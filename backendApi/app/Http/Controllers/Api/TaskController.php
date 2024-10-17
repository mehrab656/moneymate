<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Category;
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
            $endDate = Carbon::now()->toDateString();
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
        if ($limit) {
            $query = $query->limit($limit);
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

        $query = $query->select('tasks.*')->skip(($page - 1) * $pageSize)->take($pageSize)->get();
        $totalCount = TaskModel::count();

        return response()->json([
            'data' => TaskResource::collection($query),
            'total' => $totalCount,
            'test' => ($page - 1) * $pageSize
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @throws \Throwable
     */
    public function add(TaskRequest $task)
    {
        $data = $task->validated();

        //first check category id if it represents this company
        $category = Category::select('categories.*')
            ->join('sectors', 'categories.sector_id', '=', 'sectors.id')
            ->where(['sectors.company_id' => Auth::user()->primary_company, 'categories.id' => $data['categoryID']])
            ->first();
        if (!$category) {
            return response()->json([
                'message' => 'error!',
                'description' => 'You can not add task for other company.',
            ], 400);
        }
        if (strtotime($data['startTime']) > strtotime($data['endTime'])) {
            return response()->json([
                'message' => 'error!',
                'description' => 'End Time cannot be before start time',
            ], 400);
        }
        if (strtotime($data['startTime']) === strtotime($data['endTime'])) {
            return response()->json([
                'message' => 'error!',
                'description' => 'Task Start time and End time cannot be same.',
            ], 400);
        }

        //check if any task exists in between start and end time on the particular date
        $existenceTask = TaskModel::join('task_employee', 'tasks.id', '=', 'task_employee.task_id')
            ->where('date', date('Y-m-d', strtotime($data['date'])))
            ->where('employee_id', $data['employee_id'])
            ->where('type', $data['type'])
            ->where('start_time', '<=', date('H:i', strtotime($data['startTime'])))
            ->where('end_time', '>=', date('H:i', strtotime($data['startTime'])))
            ->first();

        if ($existenceTask) {
            return response()->json([
                'message' => 'Duplicate Task Schedule',
                'description' => 'This employee has an assigned task on this slot.',
                'data' => TaskResource::make($existenceTask)
            ], 406);
        }

        $workflow[] = buildTimelineWorkflow('create', 'Created a new task');

        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment', $data['comment']);
        }
        DB::beginTransaction();
        try {
            $task = TaskModel::create([
                'slug' => Uuid::uuid4(),
                'company_id' => Auth::user()->primary_company,
                'description' => $data['description'],
                'category_id' => $data['categoryID'],
                'date' => date('Y-m-d', strtotime($data['date'])),
                'start_time' => date('H:i', strtotime($data['startTime'])),
                'end_time' => date('H:i', strtotime($data['endTime'])),
                'type' => $data['type'],
                'amount' => $data['amount'],
                'status' => $data['status'] ?? 'pending',
                'payment_status' => $data['payment_status'] ?? 'pending',
                'workflow' => json_encode($workflow),
            ]);

            $taskHasEmployee = DB::table('task_employee')->insert([
                'task_id' => $task['id'],
                'employee_id' => $data['employee_id'],
                'status' => $data['status'] ?? 'pending',
            ]);

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
                'data_records' => $taskHasEmployee,
            ]);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error',
                'description' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage()
            ], 400);
        }
        DB::commit();

        return response()->json([
            'message' => 'Success',
            'description' => 'New task has been added.',
            'task' => TaskResource::make($task),
        ]);
    }

    /**
     * Show the form for creating a new resource.
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
     * Show the form for editing the specified resource.
     */
    public function edit(TaskModel $task)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskModel $task)
    {
        //
    }

    /**
     * @throws Exception
     * @throws \Throwable
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

            (new TaskModel)->handelPaymentStatusChange([
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
            'message' => 'Updated',
            'description' => 'Payment Status Updated',
            'status_code' => 200
        ], 200);

    }

    /**
     * @throws \Throwable
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->input();
        if (!$id) {
            return response()->json([
                'message' => 'Missing',
                'description' => 'Missing field!'
            ], 403);
        }
        $task = TaskModel::find($id);
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

        $taskEmployees = DB::table('task_employee')->where('task_id', $id)->get();


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
     */
    public function update(Request $request, TaskModel $task)
    {
        //
    }
}
