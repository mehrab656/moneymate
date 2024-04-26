<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserRolePermissionResource;
use App\Models\ActivityLogModel;
use App\Models\BankName;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
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

        $users = User::skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->orderBy('id', 'desc')
            ->get();

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
     * @return Response
     */
    public function store(StoreUserRequest $request): Response
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);
	    storeActivityLog( [
		    'user_id'      => Auth::user()->id,
		    'object_id'    => $user['id'],
		    'log_type'     => 'create',
		    'module'       => 'user',
		    'descriptions' => "",
		    'data_records' => $user,
	    ] );
        return response(new UserResource($user), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param User $user
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
        if ($user->tokenCan('admin')) {
            return response()->json([
                'role' => 'admin'
            ]);
        } else {
            return response()->json([
                'role' => 'user'
            ]);
        }
    }

	public function getUsers(): JsonResponse
	{
		$user = auth()->user();
		$userList = User::all();
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

	public function getActivityLogs(Request $request): JsonResponse {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 1000 );

		$logs = ActivityLogModel::skip( ( $page - 1 ) * $pageSize )
		                 ->take( $pageSize )
		                 ->orderBy( 'id', 'desc' )
		                 ->get();




		return response()->json( [
			'data'  => $logs,
		] );
	}

}
