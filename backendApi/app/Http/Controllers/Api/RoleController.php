<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Models\Role;
use Auth;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use PHPUnit\Exception;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getRole()
    {
        //
    }

    public function companyRoleList(Request $request): JsonResponse
    {
        $companyID = abs(Session::get('company_id'));
        if (!$companyID) {
            return response()->json([
                'message' => 'Missing Company id!',
                'description' => "Company id was not found for this user.",
                'data' => []
            ], 400);
        }
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 1000);
        $orderBy = $request->query('order_by', 'id');
        $order = $request->query('order', 'desc');

        $roles = DB::table('roles')
            ->where('company_id', '=', $companyID)
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy($orderBy, $order)
            ->get();

        return response()->json([
            'message' => 'Success!',
            'description' => "Company id was not found for this user.",
            'data' => $roles
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function addRole(RoleRequest $request)
    {

        $data = $request->all();

        $roleName = strtolower($data['role']);
        $roleStatus = abs($data['status']);
        unset($data['role']);
        unset($data['status']);

        $roleData = [
            'company_id' => Auth::user()->primary_company,
            'role' => $roleName,
            'status' => $roleStatus,
            'permissions' => json_encode($data)
        ];

        try {
            DB::beginTransaction();
            $addNewRole = Role::create($roleData);
            DB::commit();


        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Role created successfully',
                'description' => $e
            ], 404);
        }

        if ($addNewRole) {
            storeActivityLog([
                'object_id' => $addNewRole['id'],
                'log_type' => 'create',
                'module' => 'roles',
                'descriptions' => '',
                'data_records' => $addNewRole,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Role created successfully',
            'data' => []
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        //
    }
}
