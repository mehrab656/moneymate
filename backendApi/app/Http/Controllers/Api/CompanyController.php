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
use Illuminate\Support\Facades\Validator;
use Throwable;

class CompanyController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function getCompanyList(Request $request): JsonResponse
    {
        $page         = $request->query( 'page', 1 );
        $pageSize     = $request->query( 'pageSize', 10 );
		$companies = User::with( [ 'companies' ] )->find( Auth::user()->id )
            ->companies()
            ->skip( ( $page - 1 ) * $pageSize )
            ->take( $pageSize )
            ->orderBy( 'id', 'desc' )
            ->get();
        $totalCount = User::with( [ 'companies' ] )->find( Auth::user()->id )->companies()->count();
		return response()->json( [
			'status' => 'success',
			'total'  => $totalCount,
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
            // Store under the public disk so files are served via /storage
            // Final public URL will be: /storage/files/company/{filename}
            $attachment->storeAs( 'public/files/company', $filename );
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
	 * Get a single company by numeric id or string uid.
	 */
	public function getCompany( $uid ): JsonResponse {

		if ( ! $uid ) {
			return response()->json( [
				'status'  => 'failed',
				'message' => 'Company id or uid missing',
				'data'    => []
			], 400 );
		}

		$company = is_numeric( $uid )
			? Company::find( abs( $uid ) )
			: Company::where( 'uid', $uid )->first();

		if ( ! $company ) {
			return response()->json( [
				'status'  => 'failed',
				'message' => 'Company not found',
				'data'    => []
			], 404 );
		}

		$relation = DB::table( 'company_user' )
			->where( [ 'user_id' => Auth::user()->id, 'company_id' => $company->id ] )
			->first();

		if ( ! $relation ) {
			return response()->json( [
				'status'  => 'success',
				'message' => "This user dont have access for this company!",
				'data'    => []
			], 403 );
		}

		return response()->json( [
			'status'  => 'success',
			'message' => 'Found company',
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
	 * IncomeShow the form for editing the specified resource.
	 */
	public function edit( Company $company ) {
		//
	}

	/**
	 * Update an existing company by uid or id.
	 */
	public function updateCompany( Request $request, $uid ): JsonResponse {
		if ( ! $uid ) {
			return response()->json( [
				'status'  => 'failed',
				'message' => 'Company id or uid missing',
				'data'    => []
			], 400 );
		}

		$company = is_numeric( $uid )
			? Company::find( abs( $uid ) )
			: Company::where( 'uid', $uid )->first();

		if ( ! $company ) {
			return response()->json( [
				'status'  => 'failed',
				'message' => 'Company not found',
				'data'    => []
			], 404 );
		}

		$relation = DB::table( 'company_user' )
			->where( [ 'user_id' => Auth::user()->id, 'company_id' => $company->id ] )
			->first();
		if ( ! $relation ) {
			return response()->json( [
				'status'  => 'error',
				'message' => "This user dont have access for this company!",
				'data'    => []
			], 403 );
		}

		$validator = Validator::make( $request->all(), [
			'name'                => 'required|string',
			'phone'               => 'required|string',
			'email'               => 'required|email|max:32',
			'address'             => 'nullable|string',
			'activity'            => 'nullable|string',
			'license_no'          => 'nullable|string',
			'issue_date'          => 'required|date',
			'expiry_date'         => 'required|date|different:issue_date',
			'registration_number' => 'nullable|string',
			'logo'                => 'nullable|file|image|max:4096',
		] );
		if ( $validator->fails() ) {
			return response()->json( [
				'success'     => false,
				'message'     => 'Validation error',
				'description' => 'Please review the highlighted fields.',
				'errors'      => $validator->errors(),
			], 422 );
		}

		try {
			DB::beginTransaction();

			$company->name                = $request->input('name', $company->name);
			$company->phone               = $request->input('phone', $company->phone);
			$company->email               = $request->input('email', $company->email);
			$company->address             = $request->input('address', $company->address);
			$company->activity            = $request->input('activity', $company->activity);
			$company->license_no          = $request->input('license_no', $company->license_no);
			$company->registration_number = $request->input('registration_number', $company->registration_number);
			$company->issue_date          = $request->input('issue_date')
				? date('Y-m-d', strtotime($request->input('issue_date')))
				: $company->issue_date;
			$company->expiry_date         = $request->input('expiry_date')
				? date('Y-m-d', strtotime($request->input('expiry_date')))
				: $company->expiry_date;
			$company->updated_by          = Auth::user()->id;

			if ( $request->hasFile( 'logo' ) ) {
				$attachment = $request->file( 'logo' );
				$filename   = ( $company->uid ?: random_string('alnum', 32) ) . '.' . $attachment->getClientOriginalExtension();
				$attachment->storeAs( 'public/files/company', $filename );
				$company->logo = $filename;
			}

			$company->save();

			DB::commit();
			return response()->json( [
				'success'     => true,
				'message'     => 'Company updated',
				'description' => 'Company updated successfully',
				'data'        => $company,
			] );
		} catch ( Exception $e ) {
			DB::rollBack();
			return response()->json( [
				'success'     => false,
				'message'     => 'Update failed',
				'description' => $e->getMessage(),
			], 500 );
		}
	}

	/**
	 * Delete a company by uid or id, ensuring the authenticated user has access.
	 */
	public function destroy( $uid ): JsonResponse {
		if ( ! $uid ) {
			return response()->json( [
				'success'     => false,
				'message'     => 'Missing Id',
				'description' => 'Company id or uid is required.'
			], 400 );
		}

		$company = is_numeric( $uid )
			? Company::find( abs( $uid ) )
			: Company::where( 'uid', $uid )->first();

		if ( ! $company ) {
			return response()->json( [
				'success'     => false,
				'message'     => 'Not Found',
				'description' => 'Company not found.'
			], 404 );
		}

		$relation = DB::table( 'company_user' )
			->where( [ 'user_id' => Auth::user()->id, 'company_id' => $company->id ] )
			->first();
		if ( ! $relation ) {
			return response()->json( [
				'success'     => false,
				'message'     => 'Forbidden',
				'description' => 'This user dont have access for this company!'
			], 403 );
		}

		try {
			DB::beginTransaction();
			DB::table('company_user')->where('company_id', $company->id)->delete();
			$company->delete();
			DB::commit();
			return response()->json( [
				'success'     => true,
				'message'     => 'Company deleted',
				'description' => 'Company deleted successfully.'
			] );
		} catch ( Exception $e ) {
			DB::rollBack();
			return response()->json( [
				'success'     => false,
				'message'     => 'Delete failed',
				'description' => $e->getMessage()
			], 500 );
		}
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
