<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Auth;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Js;
use PHPUnit\Exception;

class RoleController extends Controller
{

    public function getRoleList(Request $request)
    {

        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 1000);

        $roles = Role::with(['createdBy'])->where('company_id', Auth::user()->primary_company)->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = Role::where('company_id', Auth::user()->primary_company)->count();

        return response()->json([
            'data' => RoleResource::collection($roles),
            'total' => $totalCount,
        ]);


    }


    /**
     * Display a listing of the resource.
     */
    public function getRole($id)
    {
        $id = abs($id);


        $role = Role::where(['company_id' => Auth::user()->primary_company, 'id' => $id])->get()->first();


        if (!$role) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found!',
                'data' => []
            ], 404);
        }
        $role->permissions = json_decode($role->permissions, true);
        return response()->json([
            'status' => 'success',
            'message' => 'Role found!',
            'data' => $role
        ]);
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
    public function addRole(Request $request)
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
            'permissions' => json_encode($data),
            'created_by' => Auth::user()->id,
            'updated_by' => Auth::user()->id,
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


    public function updateRole($id, Request $request)
    {

        $data = $request->all();

        $role = Role::where(['id' => $id, 'company_id' => auth()->user()->primary_company])->get()->first();

        if (!$role) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found !',
            ], 404);
        }


        $roleName = strtolower($data['role']);
        $roleStatus = abs($data['status']);
//        unset($data['role']);
//        unset($data['status']);
        $roleData = [
            'role' => $roleName,
            'status' => $roleStatus,
            'permissions' => json_encode($data),
            'updated_by' => Auth::user()->id,
        ];

        try {
            DB::beginTransaction();
            $updatedRole = $role->update($roleData);
            DB::commit();


        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Role update failed!',
                'description' => $e
            ], 404);
        }

        if ($updatedRole) {
            storeActivityLog([
                'object_id' => $id,
                'log_type' => 'update',
                'module' => 'roles',
                'descriptions' => 'Role Updated',
                'data_records' => json_encode($updatedRole),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Role updated successfully',
            'data' => json_decode($role)
        ]);
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
        dd($role);
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

    public function getPermission(Request $request): JsonResponse
    {
        return response()->json([
            'permission' => true]);
    }

    public function getCompanyRoleList()
    {


        $roles = Role::where('company_id', Auth::user()->primary_company)
            ->orderBy('id', 'desc')
            ->get();

        $totalCount = Role::where('company_id', Auth::user()->primary_company)->count();
        return response()->json([
            'data' => $roles,
            'total' => $totalCount,
        ]);
    }
}
