<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BankNameRequest;
use App\Http\Requests\BankNameUpdateRequest;
use App\Http\Resources\BankNameResource;
use App\Models\BankName;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BankNameController extends Controller {


	/**
	 * Display a listing of the resource.
	 */
	public function index( Request $request ): JsonResponse {

		$page       = $request->query( 'page', 1 );
		$pageSize   = $request->query( 'pageSize', 10 );
		$bankNames  = BankName::skip( ( $page - 1 ) * $pageSize )
		                      ->take( $pageSize )
		                      ->orderBy( 'id', 'desc' )
		                      ->get();
		$totalCount = BankName::count();

		return response()->json( [
			'data'  => BankNameResource::collection( $bankNames ),
			'total' => $totalCount,
		] );

	}

	public function allBank(): JsonResponse {
		$bankNames = BankName::get();

		return response()->json( [
			'data' => BankNameResource::collection( $bankNames )
		] );
	}

	/**
	 * Store a newly created resource in storage.
	 */
	public function store( BankNameRequest $request ): JsonResponse {
		$bankName = $request->validated();

		$existingBankName = BankName::where( 'bank_name', $bankName['bank_name'] )
		                            ->where( 'user_id', auth()->user()->id )
		                            ->first();

		if ( $existingBankName ) {
			// A bank name with the same name already exists for the user, return a response
			return response()->json( [ 'message' => 'Bank name already exists' ], 409 );
		}

		$bank = [
			'user_id'   => auth()->user()->id,
			'bank_name' => $bankName['bank_name']
		];
		try {
			$bankName = BankName::create( $bank );

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'create',
				'module'       => 'sectors',
				'descriptions' => '',
				'data_records' => $bank,
			] );
			DB::commit();

		} catch ( \Throwable $e ) {
			DB::rollBack();

			return response()->json( [
				'message' => 'Failed to Create Bank.' . $e->getMessage(),
			], 500 );
		}

		return response()->json( $bankName, 201 );
	}


	/**
	 * Display the specified resource.
	 */
	public function show( BankName $bankName ): JsonResponse {
		return response()->json( $bankName );
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update( BankNameUpdateRequest $request, BankName $bankName ): BankNameResource {
		$data = $request->validated();

		$prevData = $bankName;

		$bankName->update( $data );
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'edit',
			'module'       => 'bank',
			'descriptions' => '',
			'data_records' => [
				'prevData' => $prevData,
				'newData'  => $bankName
			],
		] );

		return new BankNameResource( $bankName );
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy( BankName $bankName ): JsonResponse {
		$bankName->delete();
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'delete',
			'module'       => 'bank',
			'descriptions' => '',
			'data_records' => $bankName
		] );

		return response()->json( null, 204 );
	}
}
