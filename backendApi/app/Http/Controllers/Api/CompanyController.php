<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyRequest;
use App\Models\Company;
use Auth;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class CompanyController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function getCompanyList() {
		$user_id = Auth::user()->id;

		$userID    = abs( $user_id );
		$companies = DB::table( 'companies' )
		               ->join( 'company_user', 'companies.id', '=', 'company_user.company_id' )
		               ->where( 'company_user.user_id', '=', $userID )
		               ->get();

		return response()->json( [
			'status'  => 'success',
			'message' => '',
			'data'    => $companies
		] );
	}

	public function getCurrentCompany( $id ): JsonResponse {

		$companyID = abs( Session::get( 'company_id' ) );
		$relation = DB::table('company_user')
		              ->where(['user_id'=>Auth::user()->id,'company_id'=>$id])
		              ->get()
		              ->first();
		if ( ! $relation ){
			return response()->json( [
				'status'  => 'success',
				'message' => "This user dont have access for this company!",
			] );
		}

		$company = Company::find( $id );

		return response()->json( [
			'status'  => 'success',
			'message' => "Found company",
			'data'    => $company
		] );
	}

	/**
	 * Store a newly created resource in storage.
	 * @throws \Throwable
	 */
	public function addNewCompany( CompanyRequest $request ): JsonResponse {
		$companyData = $request->validated();

		try {
			DB::beginTransaction();
			$store = ( new Company() )->addNewCompany( $companyData );
			if ( ! $store['success'] ) {
				return response()->json( [
					'message'     => 'Company add failed',
					'description' => "Error while adding company data.",
				], 400 );
			}
			$company = $store['data'];


			if ( $request->hasFile( 'logo' ) ) {
				$attachment = $request->file( 'logo' );
				$filename   = $company['uid'] . '.' . $attachment->getClientOriginalExtension();
				$attachment->storeAs( 'files/company', $filename );
			}

			//now make relation between this company and user. as the user has created this company, he will be the admin by default.
			DB::table( 'company_user' )->insert( [
				'company_id' => $company['id'],
				'user_id'    => Auth::user()->id,
				'role_id'    => 1,//admin role.
				'status'     => true,
				'created_by' => Auth::user()->id,
				'updated_by' => Auth::user()->id,
				'created_at' => date( 'y-m-d' ),
				'updated_at' => date( 'y-m-d' ),
			] );
			DB::commit();
		} catch ( Exception  $e ) {

			DB::rollBack();

			return response()->json( [
				'message'     => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
				'status_code' => 400
			], 400 );
		}

		return response()->json( [
			'message'     => 'success',
			'description' => "Added new Company"
		] );
	}

	/**
	 * Display the specified resource.
	 */
	public function show( Company $company ) {
		//
	}

	/**
	 * Show the form for editing the specified resource.
	 */
	public function edit( Company $company ) {
		//
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function updateCompany( Request $request, Company $company ) {
		echo '<pre>';
		print_r( "Update" );
		echo '</pre>';
		exit();
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy( Company $company ) {
		//
	}

	public function getCompanyByUser( $uid ): JsonResponse {

		if ( ! $uid ) {
			return response()->json( [
				'status'  => 'failed',
				'message' => 'User Id missing',
				'data'    => []
			] );
		}

		$userID    = abs( $uid );
		$companies = DB::table( 'companies' )
		               ->join( 'company_user', 'companies.id', '=', 'company_user.company_id' )
		               ->where( 'company_user.user_id', '=', $userID )
		               ->get();

		return response()->json( [
			'status'  => 'success',
			'message' => '',
			'data'    => $companies
		] );

	}
}
