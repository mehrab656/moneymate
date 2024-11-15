<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use App\Models\TaskModel;
use App\Http\Requests\TaskRequest;
use Carbon\Carbon;
use DateTime;
use Exception;
use Illuminate\Console\View\Components\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\TaskResource;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Storage;
use Throwable;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     * @throws Exception
     */
    public function index(Request $request)
    {
        $page = $request->query('currentPage', 1);
        $pageSize = $request->query('pageSize', 10);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $cat_id = $request->query('category_id');
        $limit = $request->query('limit');
        $order = $request->query('order', 'DESC');
        $orderBy = $request->query('orderBy', 'id');
        $payment_status = $request->query('payment_status');
        $status = $request->query('status');
        $employee = $request->query('employee_id');


        if ($startDate) {
            $startDate = date('Y-m-d', strtotime($startDate));
        }
        if ($endDate) {
            $endDate = date('Y-m-d', strtotime($endDate));
        }

        if ($startDate && empty($endDate)) {
            $endDate = (new DateTime($startDate))->format('Y-m-31');
        }

        if ($endDate && empty($startDate)) {
            $startDate = (new DateTime($endDate))->format('Y-m-01');
        }

        $query = TaskModel::where('company_id', Auth::user()->primary_company);

        if ($startDate && $endDate) {
            $query = $query->whereBetween('date', [$startDate, $endDate]);
        }
        if ($cat_id) {
            $query = $query->where('category_id', $cat_id);
        }
        if ($orderBy && $order) {
            $query = $query->orderBy($orderBy, $order);
        }
        if ($payment_status) {
            $query = $query->where('payment_status', $payment_status);
        }
        if ($status) {
            $query = $query->where('tasks.status', $status);
        }
        if ($employee) {
            $query = $query->join('task_employee', 'tasks.id', '=', 'task_employee.task_id')->where('employee_id', $employee);
        }
        if ($limit) {
            $query = $query->limit($limit);
        }
        $query = $query->select('tasks.*')->skip(($page - 1) * $pageSize)->take($pageSize)->get();
        $totalCount = TaskModel::where('company_id',Auth::user()->primary_company)->count();

        return response()->json([
            'data' => TaskResource::collection($query),
            'total' => $totalCount,
        ]);
    }

    public function assignedTasks(Request $request)
    {
        $quickFilter = $request->query('quickFilter');




        //default is today
        $tasks = TaskModel::where('company_id', Auth::user()->primary_company)
            ->join('task_employee', 'tasks.id', '=', 'task_employee.task_id')
            ->where('employee_id', Auth::user()->slug)
            ->where('task_employee.status','pending')
            ->orWhere('task_employee.status','ongoing')
            ->orderBy('date','ASC')
            ->orderBy('start_time','ASC')
            ->get();
        return response()->json([
            'data' => TaskResource::collection($tasks),
            'total' => 1000,
            'test'=>Auth::user()->slug
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @throws Throwable
     */
    public function add(TaskRequest $task)
    {
        $data = $task->validated();
        $validationStatus = (new TaskModel())->taskCustomValidation([
            'categoryID' => $data['categoryID'],
            'startTime' => $data['startTime'],
            'endTime' => $data['endTime'],
            'employee_list' => $data['employee_list'],
            'date' => $data['date'],
            'type' => $data['type'],
        ]);

        if ($validationStatus['status_code'] !== 200) {
            return response()->json($validationStatus, $validationStatus['status_code']);
        }

        $workflow[] = buildTimelineWorkflow('create', 'Created a new task');

        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }
        try {
            DB::beginTransaction();

            $task = TaskModel::create([
                'slug' => Uuid::uuid4(),
                'company_id' => Auth::user()->primary_company,
                'description' => $data['description'],
                'category_id' => $validationStatus['category']->id,
                'date' => date('Y-m-d', strtotime($data['date'])),
                'start_time' => date('H:i', strtotime($data['startTime'])),
                'end_time' => date('H:i', strtotime($data['endTime'])),
                'type' => $data['type'],
                'amount' => $data['amount'],
                'status' => $data['status'] ?? 'pending',
                'payment_status' => $data['payment_status'] ?? 'pending',
                'workflow' => json_encode($workflow),
            ]);
            $employees = json_decode($data['employee_list'], true);

            foreach ($employees as $employee) {
                DB::table('task_employee')->insert([
                    'task_id' => $task['id'],
                    'employee_id' => $employee['value'],
                    'status' => $data['status'] ?? 'pending',
                ]);
            }

            if ($data['payment_status'] === 'done') {
                (new TaskModel)->handelPaymentStatusChange([
                    'id' => $task['id'],
                    'amount' => $data['amount'],
                    'payment_status' => $data['payment_status'],
                ]);
            }

            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $task['id'],
                'object' => 'task',
                'log_type' => 'create',
                'module' => 'tasks',
                'descriptions' => 'Added New Task',
                'data_records' => $task,
            ]);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error',
                'description' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage()
            ], 400);
        }

        return response()->json([
            'message' => 'Success',
            'description' => 'New task has been added.',
        ]);
    }

    /**
     * IncomeShow the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskModel $task)
    {
        //
    }

    /**
     * IncomeShow the form for editing the specified resource.
     */
    public function edit(Request $request, $id)
    {
        if (!$id) {
            return response()->json([
                'message' => 'Missing Id',
                'description' => 'Missing Id!'
            ], 403);
        }

        $task = TaskModel::where(['slug'=> $id, 'company_id'=> Auth::user()->primary_company])->first();
        if (!$task) {
            return response()->json([
                'message' => 'Not Found',
                'description' => 'Task not found!'
            ], 404);
        }

        return response()->json([
            'data' => TaskResource::make($task),
            'id'=>$id
        ]);
    }

    /**
     * @throws Exception
     * @throws Throwable
     */
    public function updatePaymentStatus(Request $request, $id): JsonResponse|array
    {
        $data = $request->input();
        if (!$id) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Missing field!'
            ], 403);
        }

        if (!$data['amount']) {
            return response()->json([
                'message' => 'Amount',
                'description' => 'Amount is required!'
            ], 403);
        }
        if (!$data['payment_status']) {
            return response()->json([
                'message' => 'Payment Status',
                'description' => 'Payment Status is required!'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $data = (new TaskModel)->handelPaymentStatusChange([
                'id' => $id,
                'amount' => $data['amount'],
                'payment_status' => $data['payment_status']
            ]);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ], 400);
        }

        return response()->json([
            'message' => $data['message'],
            'status_code' => $data['status_code'],
        ], $data['status_code']);
    }

    /**
     * @throws Throwable
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $data = $request->input();
        if (!$id) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Missing field!'
            ], 403);
        }
        $task = TaskModel::where('slug', $id)->first();
        if (!$task) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Task is not existing!'
            ], 403);
        }
        if ($task->company_id !== auth()->user()->primary_company) {
            return response()->json([
                'message' => 'Not Allowed',
                'description' => 'You can not update for other company\'s task.!'
            ], 403);
        }

        if (!$data['task_status']) {
            return response()->json([
                'message' => 'Task Status',
                'description' => 'Task Status is required!'
            ], 403);
        }

        $task->status = $data['task_status'];
        $workflow = json_decode($task->workflow);
        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }
        $workflow[] = buildTimelineWorkflow($data['task_status']);

        $task->workflow = json_encode($workflow);

        $taskEmployees = DB::table('task_employee')->where('task_id', $task->id)->get();


        try {
            DB::beginTransaction();
            $task->save();
            foreach ($taskEmployees as $item) {
                $item->status = $data['task_status'];
                DB::table('task_employee')
                    ->where('id', $item->id)
                    ->update(['status' => $data['task_status']]);
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ], 400);
        }

        return response()->json([
            'message' => 'Updated',
            'description' => 'Payment Status Updated',
            'status_code' => 200
        ], 200);

    }

    /**
     * Update the specified resource in storage.
     * @throws Throwable
     */
    public function update(TaskRequest $task, $id): JsonResponse
    {

        $data = $task->validated();

        $validationStatus = (new TaskModel())->taskCustomValidation([
            'categoryID' => $data['categoryID'],
            'startTime' => $data['startTime'],
            'endTime' => $data['endTime'],
            'type' => $data['type'],
            'employee_list' => $data['employee_list'],
            'date' => $data['date'],
        ], 'update');

        if ($validationStatus['status_code'] !== 200) {
            return response()->json($validationStatus, $validationStatus['status_code']);
        }

        $task = TaskModel::where('slug', $id)->first();
        $workflow = json_decode($task->workflow);
        $workflow[] = buildTimelineWorkflow('update');

        if (isset($data['comment']) && $data['comment'] !== 'undefined') {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }
        try {
            DB::beginTransaction();
            $task->update([
                'description' => $data['description'],
                'category_id' => $validationStatus['category']->id,
                'date' => date('Y-m-d', strtotime($data['date'])),
                'start_time' => date('H:i', strtotime($data['startTime'])),
                'end_time' => date('H:i', strtotime($data['endTime'])),
                'type' => $data['type'],
                'amount' => $data['amount'],
                'workflow' => json_encode($workflow),
            ]);

            $employees = json_decode($data['employee_list'], true);
            DB::table('task_employee')->where('task_id', '=', $task->id)->delete();

            foreach ($employees as $employee) {
                DB::table('task_employee')->insert([
                    'task_id' => $task['id'],
                    'employee_id' => $employee['value'],
                    'status' => $data['status'] ?? 'pending',
                ]);
            }

            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $task['id'],
                'object' => 'task',
                'log_type' => 'update',
                'module' => 'tasks',
                'descriptions' => 'Updated Task',
                'data_records' => $task,
            ]);
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error',
                'description' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage()
            ], 400);
        }

        return response()->json([
            'message' => 'Updated',
            'description' => 'Task has been updated',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * @throws Exception
     */
    public function delete($slug): JsonResponse
    {
        $task = TaskModel::where('slug', $slug)->first();

        if (!$task) {
            return response()->json([
                'message' => 'Deleted!',
                'description' => 'Task was not found'
            ], 404);
        }
        DB::table('task_employee')->where('task_id', '=', $task->id)->delete();
        DB::table('tasks')->where('slug', $slug)->delete();
        DB::table('incomes')->where('slug', $slug)->delete();
        (new Expense())->deleteExpense($slug);
        (new Income())->deleteIncome($slug);
        storeActivityLog([
            'object_id' => $task->id,
            'log_type' => 'delete',
            'module' => 'task',
            'descriptions' => "Task Delete",
            'data_records' => $task,
        ]);

        return response()->json([
            'message' => 'Success!',
            'description' => 'Task deleted.',
        ]);
    }

    /**
     * @throws Throwable
     */
    public function taskStarted(Request $request, $id): JsonResponse
    {
        $data = $request->input();
        if (!$id) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Missing field!'
            ], 403);
        }
        $task = TaskModel::where('slug', $id)->first();
        if (!$task) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Task is not existing!'
            ], 403);
        }
        if ($task->company_id !== auth()->user()->primary_company) {
            return response()->json([
                'message' => 'Not Allowed',
                'description' => 'You can not start task for other company / user.!'
            ], 403);
        }
        $hasOngoingTask = DB::table('task_employee')
            ->where('status', '=','ongoing')
            ->where('employee_id', Auth::user()->slug)->first();

        if ($hasOngoingTask){
            return response()->json([
                'message' => 'Not Allowed',
                'description' => 'You can\'t start multiple task at same time.'
            ], 403);
        }
        $workflow = json_decode($task->workflow);
        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }
        $workflow[] = buildTimelineWorkflow('started');

        $task->workflow = json_encode($workflow);
        $task->status="ongoing";

        try {
            DB::beginTransaction();
            $task->save();
            DB::table('task_employee')
                ->where('task_id', $task->id)
                ->where('employee_id', Auth::user()->slug)
                ->update(['started_at' => date('H:i'),'status'=>'ongoing']);
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ], 400);
        }

        return response()->json([
            'message' => 'Started',
            'description' => 'Task has been started',
            'status_code' => 200
        ], 200);

    }

    /**
     * @throws Throwable
     */
    public function taskEnded(Request $request, $id): JsonResponse
    {
        $data = $request->input();
        if (!$id) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Missing field!'
            ], 403);
        }
        $task = TaskModel::where('slug', $id)->first();
        if (!$task) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Task is not existing!'
            ], 403);
        }
        if ($task->company_id !== auth()->user()->primary_company) {
            return response()->json([
                'message' => 'Not Allowed',
                'description' => 'You can not start task for other company / user.!'
            ], 403);
        }
        $hasStartedBefore = DB::table('task_employee')
            ->where('task_id', $task->id)
            ->where('employee_id', Auth::user()->slug)->first();

        if ($hasStartedBefore->started_at === null){
            return response()->json([
                'message' => 'Not Allowed',
                'description' => 'Tas has not started yet'
            ], 403);
        }

        $workflow = json_decode($task->workflow);
        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }
        $workflow[] = buildTimelineWorkflow('complete');

        $task->workflow = json_encode($workflow);
        $task->status="complete";

        try {
            DB::beginTransaction();
            $task->save();
            DB::table('task_employee')
                ->where('task_id', $task->id)
                ->where('employee_id', Auth::user()->slug)
                ->update(['ended_at' => date('H:i'),'status'=>'complete']);
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ], 400);
        }

        return response()->json([
            'message' => 'Completed',
            'description' => 'Task has been completed',
        ], 200);

    }
}
