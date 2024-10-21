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
use Ramsey\Uuid\Uuid;

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
        $companyID = Auth::user()->primary_company;
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

        $roles = DB::table('roles')->select(['id','role','status'])
            ->where('company_id', '=', $companyID)
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy($orderBy, $order)
            ->get();

        return response()->json([
            'message' => 'Success!',
            'data' => $roles
        ]);
    }


    /**
     * Show the form for creating a new resource.
     * @throws \Throwable
     */
    public function addRole(RoleRequest $request)
    {

        $data = $request->validated();

        try {
            DB::beginTransaction();
            $role = Role::create([
                'slug'=>Uuid::uuid4(),
                'company_id' => Auth::user()->primary_company,
                'role' => strtolower($data['name']),
                'status' => abs($data['status']),
                'permissions' => json_encode($data['roles']),
                'created_by' => Auth::user()->id,
                'updated_by' => Auth::user()->id,
            ]);

            storeActivityLog([
                'user_id' => Auth::user()->id,
                'object_id' => $role['id'],
                'object' => 'role',
                'log_type' => 'create',
                'module' => 'role',
                'descriptions' => 'Added New Role',
                'data_records' => $role,
            ]);
            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();
            return [
                'message' => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
                'status_code' => 400
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Role created successfully',
        ]);
    }

    /**
     * @throws \Throwable
     */
    public function updateRole($id, RoleRequest $request)
    {

        $data = $request->validated();

        $role = Role::where(['slug' => $id, 'company_id' => auth()->user()->primary_company])->get()->first();

        if (!$role) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found !',
            ], 404);
        }


        $roleName = strtolower($data['name']);
        $roleStatus = abs($data['status']);
//        unset($data['role']);
//        unset($data['status']);
        $roleData = [
            'role' => $roleName,
            'status' => $roleStatus,
            'permissions' => json_encode($data['roles']),
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
                'object_id' => $role['id'],
                'object'=>'role',
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
}
