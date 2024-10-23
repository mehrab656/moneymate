<?php

namespace App\Models;

use App\Http\Resources\TaskResource;
use Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskModel extends Model
{
    use HasFactory;

    protected $table = 'tasks';
    protected $primaryKey = 'id';
    protected $guarded = [];

    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'task_employee', 'task_id', 'employee_id','','slug');
    }

    public function category(): HasOne
    {

        return $this->hasOne(Category::class, 'id', 'category_id');
    }

    /**
     * @throws \Throwable
     */
    public function handelPaymentStatusChange($data): array
    {
        $task = TaskModel::where('slug', $data['id'])->first();

        if (!$task) {
            return [
                'status_code' => 403,
                'message' => 'error',
                'description' => 'No task was found'
            ];
        }

        if ($task->company_id !== auth()->user()->primary_company) {
            return [
                'status_code' => 403,
                'message' => 'error',
                'description' => 'You can not update for other company\'s task.!'
            ];
        }


        $task->paid = $data['amount'];
        $task->payment_status = $data['payment_status'];
        $workflow = json_decode($task->workflow);


        $workflow[] = buildTimelineWorkflow($data['payment_status']);

        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }


        $task->workflow = json_encode($workflow);

        //get the account id associated with this task by : task->category->sector->sector payment account

        $accountID = $task->category->sector->payment_account_id;

        $task->save();

        storeActivityLog([
            'user_id' => \Illuminate\Support\Facades\Auth::user()->id,
            'object_id' => $task->id,
            'object' => 'task',
            'log_type' => 'update',
            'module' => 'tasks',
            'descriptions' => 'Update Task payment status',
            'data_records' => $task,
        ]);
        //now check if the task was income or expense sections
        if (strtolower($task['type']) === 'income') {

            $income = (new Income)->incomeAdd([
                'account_id' => $accountID,
                'amount' => $data['amount'],
                'category_id' => $task['category_id'],
                'description' => $task['description'],
                'note' => 'This income was recorded while ' . Auth::user()->name . ' marked the task as ' . strtoupper(str_replace('_', ' ', $data['payment_status'])),
                'reference' => 'cash',
                'income_type' => 'others',
                'date' => $task['date'],
                'attachment' => null,
            ], $task->category,$task->slug);

            return [
                'status_code' => $income['status_code'],
                'message' => $income['message'],
            ];
        }
        if (strtolower($task['type']) === 'expense') {

            $expense = (new Expense)->addExpense([
                'account_id' => $accountID,
                'amount' => $data['amount'],
                'category_id' => $task['category_id'],
                'description' => $task['description'],
                'note' => 'This expense was recorded while ' . Auth::user()->name . ' marked the task as ' . strtoupper(str_replace('_', ' ', $data['payment_status'])),
                'reference' => '',
                'category_name' => $task->category->name,
                'date' => $task['date'],
                'attachment' => null,
            ],$task->slug);

            return [
                'status_code' => $expense['status_code'],
                'message' => $expense['message']
            ];
        }

        return [
            'status_code' => 404,
            'message' => 'Undefined Task Type :' . $task['type']
        ];

    }

    public function taskCustomValidation($data,$tag='add'): array
    {

        $category = Category::select('categories.*')
            ->join('sectors', 'categories.sector_id', '=', 'sectors.id')
            ->where(['sectors.company_id' => \Illuminate\Support\Facades\Auth::user()->primary_company, 'categories.id' => $data['categoryID']])
            ->first();

        if (!$category) {
            return [
                'status_code' => 400,
                'message' => 'error!',
                'description' => 'You can not add task for other company.',
            ];
        }

        if (strtotime($data['startTime']) > strtotime($data['endTime'])) {
            return [
                'status_code' => 400,
                'message' => 'error!',
                'description' => 'End Time cannot be before start time',
            ];
        }
        if (strtotime($data['startTime']) === strtotime($data['endTime'])) {
            return [
                'status_code' => 400,
                'message' => 'error!',
                'description' => 'Task Start time and End time cannot be same.',
            ];
        }
        $employees = json_decode($data['employee_list'],true);
        if (empty($employees)) {
            return [
                'status_code' => 400,
                'message' => 'error!',
                'description' => 'Task Employee is required',
            ];
        }
        if ($tag==='add'){

            foreach ($employees as $employee){
                $existenceTask = TaskModel::join('task_employee', 'tasks.id', '=', 'task_employee.task_id')
                    ->join('users','task_employee.employee_id','=','users.slug')
                    ->select(['users.username','date','description','end_time','start_time'])
                    ->where('date', date('Y-m-d', strtotime($data['date'])))
                    ->where('employee_id', $employee['value'])
                    ->where('type', strtolower($data['type']))
                    ->where('start_time', '<=', date('H:i', strtotime($data['startTime'])))
                    ->where('end_time', '>=', date('H:i', strtotime($data['startTime'])))
                    ->first();

                if ($existenceTask) {
                    return [
                        'status_code' => 406,
                        'message' => 'Time conflicted',
                        'description' => sprintf("%s has an assigned task on %s(%s, From %s To %s)",$existenceTask->username,$existenceTask->description,$existenceTask->date,date("g:i a",strtotime($existenceTask->start_time)),date("g:i a",strtotime($existenceTask->end_time))),
                    ];
                }
            }
        }

        return [
            'status_code' => 200,
            'message' => 'success',
            'description' => 'Validation is ok',
        ];
    }


}
