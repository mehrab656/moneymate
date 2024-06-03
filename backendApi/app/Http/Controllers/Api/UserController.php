<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserRolePermissionResource;
use App\Models\ActivityLogModel;
use App\Models\BankName;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{

    /**
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 10);

        $users = Company::with(['users'])->find(Auth::user()->primary_company)->users()->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();;

        $totalCount = User::count();

        return response()->json([
            'data' => UserResource::collection($users),
            'total' => $totalCount,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreUserRequest $request
     *
     * @return Response
     * @throws Exception
     */
    public function store(StoreUserRequest $request): Response
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['primary_company'] = Auth::user()->primary_comany;
        try {
            DB::beginTransaction();
            $user = User::create($data);
            DB::table('company_user')->insert([
                'company_id' => Auth::user()->primary_comany,
                'user_id' => $user->id,
                'role_id' => $data['role_id'],//admin role.
                'status' => true,
                'created_by' => Auth::user()->id,
                'updated_by' => Auth::user()->id,
                'created_at' => date('y-m-d'),
                'updated_at' => date('y-m-d'),
            ]);

            storeActivityLog([
                'object_id' => $user['id'],
                'log_type' => 'create',
                'module' => 'user',
                'descriptions' => "",
                'data_records' => $user,
            ]);
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();

        }


        return response(new UserResource($user), 200);
    }

    /**
     * Display the specified resource.
     *
     * @param User $user
     *
     * @return UserResource
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateUserRequest $request
     * @param User $user
     *
     * @return UserResource
     */
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }
        $user->update($data);

        return new UserResource($user);
    }


    /**
     * @return JsonResponse
     */

    public function getUserRole(): JsonResponse
    {
        $user = auth()->user();

        $permissions = DB::table('company_user')->select('roles.*')
            ->join('roles', 'roles.id', '=', 'company_user.role_id')
            ->where(['company_user.company_id' => $user->primary_company, 'user_id' => $user->id])
            ->get()->first();

        $permission_array = [];
        if ($permissions){
            $permission_array = json_decode($permissions->permissions,true);
        }


        if ($user->tokenCan('admin')) {
            $role = 'admin';
        } else {
            $role = $user->role_as;
        }

        return response()->json([
            'role' => $role,
            'access' => $permission_array
        ]);
    }

    public function getUsers(): JsonResponse
    {

        $userList = DB::table('users')->select("users.*")
            ->join('company_user', 'users.id', '=', 'company_user.user_id')
            ->where('company_id', Auth::user()->primary_company)
            ->get();

        return response()->json([
            'data' => UserResource::collection($userList)
        ]);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @return JsonResponse
     */
    public function delete($id): JsonResponse
    {
        $user = User::find($id);
        BankName::delete();
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function getActivityLogs(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $pageSize = $request->query('pageSize', 1000);

        $logs = ActivityLogModel::skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();


        return response()->json([
            'data' => $logs,
        ]);
    }

    public function updateLogStatus($uid): JsonResponse
    {
        if (!$uid) {
            return response()->json([
                'message' => 'Missing!',
                'description' => "Missing UUID!",
            ], 400);
        }

        $log = ActivityLogModel::where('uid', '=', $uid)->first();

        if (!$log) {
            return response()->json([
                'message' => 'Not Found!',
                'description' => "Nothing found!",
            ], 404);
        }
        $user = Auth::user();

        $needToUpdate["view_status"] = true;


        if ($log->view_by) {
            if (!in_array($user->id, array_column(json_decode($log->view_by), 'id'))) {
                $needToUpdate['view_by'] = array_merge(json_decode($log->view_by), [
                    [
                        'id' => $user->id,
                        'name' => $user->name
                    ]
                ]);

            }
        } else {
            $needToUpdate['view_by'] = [['id' => $user->id, 'name' => $user->name]];
        }

        $status = $log->update($needToUpdate);

        return response()->json([
            'message' => $status ? 'Success!' : "Failed!",
            'description' => $status ? "Data Updated!" : "Error while updating the data!",
        ]);
    }


}
