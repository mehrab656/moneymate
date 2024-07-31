<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyRequest;
use App\Models\Company;
use App\Models\User;
use Auth;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Throwable;

class CompanyController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function getCompanyList() {

		$companies = User::with( [ 'companies' ] )->find( Auth::user()->id )->companies()->get();

		return response()->json( [
			'status' => 'success',
			'total'  => count( $companies ),
			'data'   => $companies
		] );
	}

	public function getCurrentCompany( $id, Request $request ): JsonResponse {

		$relation = DB::table( 'company_user' )
		              ->where( [ 'user_id' => Auth::user()->id, 'company_id' => $id ] )
		              ->get()
		              ->first();
		if ( ! $relation ) {
			return response()->json( [
				'status'  => 'success',
				'message' => "This user dont have access for this company!",
			] );
		}

		$company = Company::find( $id );

		return response()->json( [
			'status'  => 'success',
			'message' => "Found company",
			'data'    => $company,
		] );
	}

	/**
	 * Store a newly created resource in storage.
	 * @throws Exception
	 * @throws Throwable
	 */
	public function addNewCompany( CompanyRequest $request ): JsonResponse {
		$companyData = $request->validated();

		$companyData['uid'] = random_string( 'alnum', 32 );
		$companyData['filename'] = 'demo_company_logo.jpg';
		if ( $request->hasFile( 'logo' ) ) {
			$attachment = $request->file( 'logo' );
			$filename   = $companyData['uid'] . '.' . $attachment->getClientOriginalExtension();
			$attachment->storeAs( 'files/company', $filename );
			$companyData['filename'] = $filename;
		}



		$store = ( new Company() )->addNewCompany( $companyData );


		return response()->json( [
			'success'     => $store['success'],
			'message'     => $store['message'],
			'description' => $store['description'],
		], $store['status_code'] );

	}

	public function switchCompany( $id ): JsonResponse {
		$newCompanyID = abs( $id );


		$relation = DB::table( 'company_user' )
		              ->where( [ 'user_id' => Auth::user()->id, 'company_id' => $newCompanyID ] )
		              ->get()
		              ->first();
		if ( ! $relation ) {
			return response()->json( [
				'status'  => 'error',
				'message' => "This user dont have access for this company!",
			] );
		}
		Auth::user()->update( [ 'primary_company' => $newCompanyID ] );
		$company = Company::find( $newCompanyID );

		return response()->json( [
			'status'  => 'success',
			'message' => "Company switched!",
			'data'    => $company

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
