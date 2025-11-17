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
use Illuminate\Support\Facades\DB;
use Mockery\Exception;
use Ramsey\Uuid\Uuid;

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
     * IncomeShow the form for creating a new resource.
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
            $filename = $employee['user_name'] . '_' . 'profile_picture_' . time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->move('avatars', $filename);
            $employee['profile_picture'] = $filename; // Store only the filename
        }

        if ($request->hasFile('id_copy')) {
            $attachment = $request->file('id_copy');
            $filename = $employee['user_name'] . '_' . 'id_' . time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->move('ids', $filename);
            $employee['id_copy'] = $filename; // Store only the filename
        }

        try {
            DB::beginTransaction();
            $uuid = Uuid::uuid4();
            $user = (new User)->addNewUser([
                'slug'=>$uuid,
                'first_name' => $employee['first_name'],
                'last_name' => $employee['last_name'],
                'user_name' => $employee['user_name'],
                'email' => $employee['email'],
                'phone' => $employee['phone'],
                'emergency_contact' => $employee['emergency_contact'],
                'dob' => $employee['dob'],
                'gender' => $employee['gender'],
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
                'slug'=>$uuid,
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

            DB::commit();
        }catch (Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Error',
                'description' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage()
            ], 400);
        }
        return response()->json([
            'message' => 'Success!',
            'description' => "New Employee was added",
        ]);
    }

    /**
     * Display the specified employee details.
     */
    public function show($id)
    {
        $employee = Employee::where('slug', $id)->with('user')->first();
        if (!$employee) {
            return response()->json([
                'message' => 'Error',
                'description' => 'Employee not found',
            ], 404);
        }

        $roleId = DB::table('company_user')
            ->where('user_id', $employee->user_id)
            ->where('company_id', Auth::user()->primary_company)
            ->value('role_id');

        return response()->json([
            'data' => [
                'id' => $employee->slug,
                'first_name' => $employee->user->first_name,
                'last_name' => $employee->user->last_name,
                'user_name' => $employee->user->username,
                'email' => $employee->user->email,
                'phone' => $employee->phone,
                'emergency_contact' => $employee->emergency_contact,
                'dob' => $employee->user->dob,
                'gender' => $employee->user->gender,
                'joining_date' => $employee->joining_date,
                'role_id' => $roleId,
                'position' => $employee->position,
                'basic_salary' => $employee->basic_salary,
                'accommodation_cost' => $employee->accommodation_cost,
                'profile_picture' => $employee->user->profile_picture,
                'id_copy' => $employee->attachment,
                'avatar' => asset('avatars/' . $employee->user->profile_picture),
            ],
        ]);
    }

    /**
     * IncomeShow the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        //
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::where('slug', $id)->with('user')->first();
        if (!$employee) {
            return response()->json([
                'message' => 'Error',
                'description' => 'Employee not found',
            ], 404);
        }

        $validated = $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'user_name' => 'required',
            'email' => ['required', 'email'],
            'phone' => 'required',
            'emergency_contact' => 'nullable',
            'dob' => 'nullable',
            'gender' => 'nullable',
            'joining_date' => 'required',
            'role_id' => 'required',
            'position' => 'required',
            'basic_salary' => 'required|numeric',
            'accommodation_cost' => 'required|numeric',
        ]);

        // Handle uploads
        if ($request->hasFile('profile_picture')) {
            $attachment = $request->file('profile_picture');
            $filename = $validated['user_name'] . '_' . 'profile_picture_' . time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->move('avatars', $filename);
            $validated['profile_picture'] = $filename;
        }

        if ($request->hasFile('id_copy')) {
            $attachment = $request->file('id_copy');
            $filename = $validated['user_name'] . '_' . 'id_' . time() . '.' . $attachment->getClientOriginalExtension();
            $attachment->move('ids', $filename);
            $validated['id_copy'] = $filename;
        }

        try {
            DB::beginTransaction();
            // Update user
            $employee->user->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $validated['user_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'dob' => $validated['dob'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'profile_picture' => $validated['profile_picture'] ?? $employee->user->profile_picture,
            ]);

            // Update pivot role if exists
            DB::table('company_user')
                ->where('user_id', $employee->user_id)
                ->where('company_id', Auth::user()->primary_company)
                ->update(['role_id' => $validated['role_id']]);

            // Update employee
            $employee->update([
                'phone' => $validated['phone'],
                'basic_salary' => $validated['basic_salary'],
                'accommodation_cost' => $validated['accommodation_cost'],
                'joining_date' => $validated['joining_date'],
                'position' => $validated['position'],
                'attachment' => $validated['id_copy'] ?? $employee->attachment,
                'emergency_contact' => $validated['emergency_contact'] ?? $employee->emergency_contact,
            ]);

            storeActivityLog([
                'object_id' => $employee['id'],
                'object' => 'employee',
                'log_type' => 'update',
                'module' => 'employee',
                'descriptions' => 'Updated employee details',
                'data_records' => json_encode($validated),
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error',
                'description' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
            ], 400);
        }

        return response()->json([
            'message' => 'Success!',
            'description' => 'Employee was updated',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        //
    }
}
