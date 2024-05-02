<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Auth;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class RoleController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function index() {
		//
	}

	public function companyRoleList( Request $request ) {
		$companyID = abs( Session::get( 'company_id' ) );
		if ( ! $companyID ) {
			return response()->json( [
				'message'     => 'Missing Company id!',
				'description' => "Company id was not found for this user.",
				'data'        => []
			], 400 );
		}
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 1000 );
		$orderBy = $request->query( 'order_by', 'id' );
		$order = $request->query( 'order', 'desc' );

		$roles = DB::table( 'roles' )
		           ->where( 'company_id', '=', $companyID )
		           ->skip( ( $page - 1 ) * $pageSize )
		           ->take( $pageSize )
		           ->orderBy( $orderBy, $order )
		           ->get();

		return response()->json( [
			'message'     => 'Success!',
			'description' => "Company id was not found for this user.",
			'data'        => $roles
		] );
	}


	/**
	 * Show the form for creating a new resource.
	 */
	public function addRole() {
		echo '<pre>';
		print_r( "HI" );
		echo '</pre>';
		exit();
	}

	/**
	 * Store a newly created resource in storage.
	 */
	public function store( Request $request ) {
		//
	}

	/**
	 * Display the specified resource.
	 */
	public function show( Role $role ) {
		//
	}

	/**
	 * Show the form for editing the specified resource.
	 */
	public function edit( Role $role ) {
		//
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update( Request $request, Role $role ) {
		//
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy( Role $role ) {
		//
	}
}
