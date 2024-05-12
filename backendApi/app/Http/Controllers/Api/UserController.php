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
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller {

	/**
	 * @return JsonResponse
	 */
	public function index( Request $request ): JsonResponse {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );

		$users = User::skip( ( $page - 1 ) * $pageSize )
		             ->take( $pageSize )
		             ->orderBy( 'id', 'desc' )
		             ->get();

		$totalCount = User::count();

		return response()->json( [
			'data'  => UserResource::collection( $users ),
			'total' => $totalCount,
		] );
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param StoreUserRequest $request
	 *
	 * @return Response
	 */
	public function store( StoreUserRequest $request ): Response {
		$data             = $request->validated();
		$data['password'] = bcrypt( $data['password'] );
		$user             = User::create( $data );
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'object_id'    => $user['id'],
			'log_type'     => 'create',
			'module'       => 'user',
			'descriptions' => "",
			'data_records' => $user,
		] );

		return response( new UserResource( $user ), 201 );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param User $user
	 *
	 * @return UserResource
	 */
	public function show( User $user ): UserResource {
		return new UserResource( $user );
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param UpdateUserRequest $request
	 * @param User $user
	 *
	 * @return UserResource
	 */
	public function update( UpdateUserRequest $request, User $user ): UserResource {
		$data = $request->validated();
		if ( isset( $data['password'] ) ) {
			$data['password'] = bcrypt( $data['password'] );
		}
		$user->update( $data );

		return new UserResource( $user );
	}


	/**
	 * @return JsonResponse
	 */

	public function getUserRole(): JsonResponse {
		$user = auth()->user();
		if ( $user->tokenCan( 'admin' ) ) {
			return response()->json( [
				'role' => 'admin'
			] );
		} else {
			return response()->json( [
				'role' => 'user'
			] );
		}
	}

	public function getUsers(): JsonResponse {
		$user     = auth()->user();
		$userList = User::all();

		return response()->json( [
			'data' => UserResource::collection( $userList )
		] );
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @return JsonResponse
	 */
	public function delete( $id ): JsonResponse {
		$user = User::find( $id );
		BankName::delete();
		$user->delete();

		return response()->json( [ 'message' => 'User deleted' ] );
	}

	public function getActivityLogs( Request $request ): JsonResponse {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 1000 );

		$logs = ActivityLogModel::skip( ( $page - 1 ) * $pageSize )
		                        ->take( $pageSize )
		                        ->orderBy( 'id', 'desc' )
		                        ->get();


		return response()->json( [
			'data' => $logs,
		] );
	}

	public function updateLogStatus( $uid ): JsonResponse {
		if ( ! $uid ) {
			return response()->json( [
				'message'     => 'Missing!',
				'description' => "Missing UUID!",
			], 400 );
		}

		$log = ActivityLogModel::where( 'uid', '=', $uid )->first();

		if ( ! $log ) {
			return response()->json( [
				'message'     => 'Not Found!',
				'description' => "Nothing found!",
			], 404 );
		}
		$user = Auth::user();

		$needToUpdate["view_status"] = true;


		if ( $log->view_by ) {
			if ( ! in_array( $user->id, array_column( json_decode( $log->view_by ), 'id' ) ) ) {
				$needToUpdate['view_by'] = array_merge( json_decode( $log->view_by ), [
					[
						'id'   => $user->id,
						'name' => $user->name
					]
				] );

			}
		} else {
			$needToUpdate['view_by'] = [ [ 'id' => $user->id, 'name' => $user->name ] ];
		}

		$status = $log->update( $needToUpdate );

		return response()->json( [
			'message'     => $status ? 'Success!' : "Failed!",
			'description' => $status ? "Data Updated!" : "Error while updating the data!",
		] );
	}

}
