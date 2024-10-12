<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\TaskResource;
use App\Models\Employee;
use App\Models\TaskModel;
use App\Models\User;
use Auth;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     * @throws \Exception
     */
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $limit = $request->query('limit');
        $order = $request->query('order', 'DESC');
        $orderBy = $request->query('orderBy', 'id');
        $position = $request->query('position');


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

        $query = Employee::where('company_id', Auth::user()->primary_company);

        if ($startDate && $endDate) {
            $query = $query->whereBetween('joining_date', [$startDate, $endDate]);
        }
        if ($limit) {
            $query = $query->limit($limit);
        }
        if ($orderBy && $order) {
            $query = $query->orderBy($orderBy, $order);
        }
        if ($position) {
            $query = $query->where('position', $position);
        }


        $query = $query->skip(($page - 1) * $pageSize)->take($pageSize)->get();
        $totalCount = Employee::count();

        return response()->json([
            'data' => EmployeeResource::collection($query),
            'total' => $totalCount,
        ]);
    }

    public function allEmployees(Request $request)
    {
        $query = Employee::where('company_id', Auth::user()->primary_company)->get();
        return response()->json([
            'data' => EmployeeResource::collection($query),
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
     * Store a newly created resource in storage.
     * @throws \Exception
     * @throws \Throwable
     */
    public function add(EmployeeRequest $request)
    {
        $employee = $request->validated();

        if ($request->hasFile('profile_picture')) {
            $attachment = $request->file('profile_picture');
            $filename = $employee['name'] . '_' . 'profile_picture_' . time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->move('avatars', $filename);
            $employee['profile_picture'] = $filename; // Store only the filename
        }

        if ($request->hasFile('id_copy')) {
            $attachment = $request->file('id_copy');
            $filename = $employee['name'] . '_' . 'id_' . time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->move('ids', $filename);
            $employee['id_copy'] = $filename; // Store only the filename
        }


        $user = (new User)->addNewUser([
            'name' => $employee['name'],
            'email' => $employee['email'],
            'profile_picture' => $employee['profile_picture'] ?? 'default_employee.png',
            'role_as' => 'employee',
            'role_id' => $employee['role_id'],
            'primary_company' => Auth::user()->primary_company,
        ]);
        if ($user['status_code'] !== 200){
            return response()->json($user,$user['status_code']);
        }

        //@need to add data on employee table

        $newEmployee = (new Employee())->addEmployee([
            'company_id' => Auth::user()->primary_company,
            'user_id' => $user['user']->id,
            'phone' => $employee['phone'],
            'basic_salary' => $employee['basic_salary'],
            'accommodation_cost' => $employee['accommodation_cost'],
            'joining_date' => $employee['joining_date'],
            'position' => $employee['position'],
            'id_copy' => $employee['id_copy']??'',
            'emergency_contact' => $employee['emergency_contact'],
            'extras' => json_encode($user['user']),
        ]);
        if ($newEmployee['status_code'] !== 200){
            return response()->json($newEmployee,$newEmployee['status_code']);
        }
        return response()->json([
            'message' => 'Success!',
            'description' => "New Employee was added",
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        //
    }
}
