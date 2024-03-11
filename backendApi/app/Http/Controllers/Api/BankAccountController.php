<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BankAccountRequest;
use App\Http\Requests\BankAccountUpdateRequest;
use App\Http\Resources\BankAccountResource;
use App\Models\BankAccount;
use App\Models\Wallet;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BankAccountController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function index( Request $request ): JsonResponse {
		$user         = Auth::user();
		$page         = $request->query( 'page', 1 );
		$pageSize     = $request->query( 'pageSize', 10 );
		$bankAccounts = BankAccount::skip( ( $page - 1 ) * $pageSize )
		                           ->take( $pageSize )
		                           ->orderBy( 'id', 'desc' )
		                           ->get();

		$totalCount = BankAccount::count();

		return response()->json( [
			'data'  => BankAccountResource::collection( $bankAccounts ),
			'total' => $totalCount,
		] );

	}

	public function allBankAccount(): JsonResponse {
		$user         = Auth::user();
		$bankAccounts = BankAccount::get();

		return response()->json( [
			'data' => BankAccountResource::collection( $bankAccounts )
		] );
	}


	/**
	 * @param BankAccountRequest $request
	 *
	 * @return JsonResponse
	 */

	public function add( BankAccountRequest $request ): JsonResponse {
		$bankAccount = $request->validated();
		$details     = [
			'user_id'        => Auth::user()->id,
			'account_name'   => $bankAccount['account_name'],
			'account_number' => $bankAccount['account_number'],
			'bank_name_id'   => $bankAccount['bank_name_id'],
			'balance'        => $bankAccount['balance'],
		];

		try {
			DB::beginTransaction();
			$bankAccount = BankAccount::create( $details );

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'object_id'     => $bankAccount->id,
				'log_type'     => 'create',
				'module'       => 'Account',
				'descriptions' => '',
				'data_records' => $details,
			] );
			DB::commit();
		} catch ( \Throwable $e ) {
			DB::rollBack();

			return response()->json( [
				'message' => 'Failed to create Account.' . $e->getMessage(),
			], 500 );
		}


		return response()->json( [ 
			'bank_account' => $bankAccount,
		    'message'     => 'Success!',
			'description' => 'Bank account information has been stored!.',
		] );

	}


	/**
	 * @param BankAccount $bankAccount
	 *
	 * @return BankAccountResource
	 */
	public function show( BankAccount $bankAccount ): BankAccountResource {
		return new BankAccountResource( $bankAccount );
	}


	/**
	 * @param BankAccount $bankAccount
	 *
	 * @return JsonResponse|Response
	 */
	public function destroy( $id ) {
		$bankAccount = BankAccount::find( $id );

		try {
			DB::beginTransaction();
			$bankAccount->delete();
			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'object_id'     => $bankAccount->id,
				'log_type'     => 'delete',
				'module'       => 'Bank Account',
				'descriptions' => '',
				'data_records' => $bankAccount,
			] );
			DB::commit();
		} catch ( \Throwable $e ) {
			DB::rollBack();

			return response()->json( [
				'message' => 'Failed to delete Account.' . $e->getMessage(),
			], 500 );
		}


		return response()->noContent();
	}


	/**
	 * @param BankAccountUpdateRequest $request
	 * @param BankAccount $bankAccount
	 *
	 * @return BankAccountResource
	 */
	public function update( BankAccountUpdateRequest $request, BankAccount $bankAccount ): BankAccountResource {
		$data = $request->validated();
		$data['balance'] = str_replace(',','',$data['balance']);
		$bankAccount->update( $data );

		return new BankAccountResource( $bankAccount );
	}


	/**
	 * This is the Current Bank account balance
	 * @return JsonResponse
	 */

	public function totalBankAccountBalance(): JsonResponse {
		$totalAccount = BankAccount::sum( 'balance' );

		return response()->json( [
			'balance' => fix_number_format($totalAccount)
		] );
	}

	/**
	 * This is the Current Bank account balance
	 * @return JsonResponse
	 */

	public function totalBalance(): JsonResponse {
		$totalAccount = BankAccount::sum( 'balance' );
		$totalWallet  = Wallet::sum( 'balance' );

		return response()->json( [
			'balance' =>fix_number_format( $totalAccount + $totalWallet)
		] );
	}


}
