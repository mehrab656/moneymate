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
        return $this->belongsToMany(Employee::class, 'task_employee', 'task_id', 'employee_id');
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
        $task = TaskModel::find($data['id']);

        if (!$task) {
            return [
                'data' => null,
                'status_code' => 403,
                'message' => 'No task was found'
            ];
        }

        if ($task->company_id !== auth()->user()->primary_company) {
            return [
                'status_code' => 403,
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
        if ($task['type'] === 'income') {

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
            ], $task->category);

            return [
                'status_code' => $income['status_code'],
                'message' => $income['message']
            ];
        }
        if ($task['type'] === 'expense') {

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
            ]);

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


}
