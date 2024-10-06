<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\TaskModel;
use App\Http\Requests\TaskRequest;
use Carbon\Carbon;
use DateTime;
use Exception;
use Illuminate\Console\View\Components\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\TaskResource;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     * @throws Exception
     */
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
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
            $query = $query->where('status', $status);
        }
        if ($employee) {
            $query = $query->where('employee_id', $employee);
        }

        $query = $query->skip(($page - 1) * $pageSize)->take($pageSize)->get();
        $totalCount = TaskModel::count();

        return response()->json([
            'data' => TaskResource::collection($query),
            'total' => $totalCount,
            'request' => $request,
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

        //check if any task exists in between start and end time on the particular date
        $existenceTask = TaskModel::where('date', date('Y-m-d', strtotime($data['date'])))
            ->where('employee_id', $data['employee_id'])
            ->where('start_time', '<=', date('H:i', strtotime($data['startTime'])))
            ->where('end_time', '>=', date('H:i', strtotime($data['startTime'])))
            ->first();

        if ($existenceTask) {
            return response()->json([
                'message' => 'Duplicate TaskModel Schedule',
                'description' => 'This employee has an assigned task on this slot.',
                'data' => TaskResource::make($existenceTask)
            ], 406);
        }

        $workflow = [
            ['date_time' => date("Y-m-d H:i:s"),
                'userID' => Auth::user()->id,
                'userName' => Auth::user()->name,
                'type' => 'create',
                'description' => Auth::user()->name . ' ' . 'created a new task.'
            ]
        ];
        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = [
                'date_time' => date("Y-m-d H:i:s"),
                'userID' => Auth::user()->id,
                'userName' => Auth::user()->name,
                'type' => 'comment',
                'description' => $data['comment']
            ];
        }
        DB::beginTransaction();
        try {
            $task = TaskModel::create([
                'company_id' => Auth::user()->primary_company,
                'employee_id' => $data['employee_id'],
                'description' => $data['description'],
                'category_id' => $data['categoryID'],
                'date' => date('Y-m-d', strtotime($data['date'])),
                'start_time' => date('H:i', strtotime($data['startTime'])),
                'end_time' => date('H:i', strtotime($data['endTime'])),
                'type' => $data['type'],
                'amount' => $data['amount'],
                'status' => $data['status'],
                'payment_status' => $data['payment_status'],
//            'comment' => $data['comment'],
                'workflow' => json_encode($workflow),
            ]);

            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $task['id'],
                'object' => 'task',
                'log_type' => 'create',
                'module' => 'tasks',
                'descriptions' => 'Added New Task',
                'data_records' => $task,
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors($e->getMessages())->withInput();
        }
        DB::commit();

        return response()->json([
            'data' => TaskResource::make($task),
            'message' => 'success',
            'description' => 'New task has been added.'
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskModel $task)
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
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $data = $request->input();
        if (!$id){
            return response()->json([
                'message' => 'Missing',
                'description' => 'Missing field!'
            ],403);
        }
        $task = TaskModel::find($id);
        if (!$task){
            return response()->json([
                'message' => 'Missing',
                'description' => 'Task is not existing!'
            ],403);
        }
        if ($task->company_id !== auth()->user()->primary_company){
            return response()->json([
                'message' => 'Not Allowed',
                'description' => 'You can not update for other company\'s task.!'
            ],403);
        }


        if (!$data['amount']){
            return response()->json([
                'message' => 'Amount',
                'description' => 'Amount is required!'
            ],403);
        }
        if (!$data['payment_status']){
            return response()->json([
                'message' => 'Payment Status',
                'description' => 'Payment Status is required!'
            ],403);
        }

        $task->paid = $data['amount'];
        $task->payment_status =$data['payment_status'];
        $workflow = json_decode($task->workflow);


        $workflow[] = buildTimelineWorkflow($data['payment_status']);

        if (isset($data['comment']) && $data['comment']) {
            $workflow[] = buildTimelineWorkflow('comment',$data['comment']);
        }

        $task->workflow = json_encode($workflow);

        $task->save();
        storeActivityLog([
            'user_id' => Auth::user()->id,
            'object_id' => $task->id,
            'object' => 'task',
            'log_type' => 'update',
            'module' => 'tasks',
            'descriptions' => 'Update Task payment status',
            'data_records' => $task,
        ]);
        return response()->json([
            'message' => 'success',
            'description' => 'Payment status has been updated.'
        ]);
    }
}
