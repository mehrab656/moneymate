<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DebtRequest;
use App\Http\Resources\DebtHistory;
use App\Http\Resources\DebtResource;
use App\Models\BankAccount;
use App\Models\Borrow;
use App\Models\Debt;
use App\Models\DebtCollection;
use App\Models\Lend;
use App\Models\Repayment;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Twilio\Exceptions\ConfigurationException;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Client;

class DebtController extends Controller {


	/**
	 * Display a listing of the resource.
	 */

	public function index( Request $request ): JsonResponse {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );

		$debts = Debt::skip( ( $page - 1 ) * $pageSize )
		             ->take( $pageSize )
		             ->orderBy( 'id', 'desc' )
		             ->get();

		$totalCount = Debt::count();

		return response()->json( [
			'debts' => DebtResource::collection( $debts ),
			'total' => $totalCount,
		] );
	}


	/**
	 * @param DebtRequest $request
	 *
	 * @return JsonResponse
	 */
	public function store( DebtRequest $request ): JsonResponse {
		$selectedBankAccount = BankAccount::find( $request->account_id );

		$debt = $request->validated();
		if ( $debt['type'] === 'borrow' ) {
			$debtAmount   = - $debt['amount'];
			$borrowAmount = $debt['amount'];
		} else {
			if ( $debt['amount'] > $selectedBankAccount->balance ) {
				return response()->json( [
					'status'            => 'insufficient_balance',
					'message'           => 'Insufficient balance in the selected bank account. Please use another bank account to repay.',
					'available_balance' => $selectedBankAccount->balance
				] );
			}

			$debtAmount = $debt['amount'];
		}

		$person = $debt['person'];
		/** @var TYPE_NAME $debtAmount */
		$debt = Debt::firstOrCreate( [
			'user_id'    => auth()->user()->id,
			'amount'     => $debtAmount,
			'account_id' => $debt['account_id'],
			'type'       => $debt['type'],
			'person'     => $person,
			'date'       => $debt['date'],
			'note'       => $debt['note']
		] );

		$bankAccount = BankAccount::find( $debt->account_id );

		// Means you are lending money to someone.

		if ( $debt['type'] === 'lend' ) {
			$lendData = [
				'amount'     => $debt->amount,
				'account_id' => $debt->account_id,
				'date'       => $debt['date'],
				'debt_id'    => $debt->id,
				'note'       => $debt['note']
			];
			Lend::create( $lendData );

			// Update Associated bank account by decreasing account balance
			$bankAccount->balance -= $request->amount;
			$bankAccount->save();

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'create',
				'module'       => 'Debt',
				'descriptions' => " lend an amount of $debtAmount to $person",
				'data_records' => [
					'lendData'       => $lendData,
					'accountBalance' => $bankAccount->balance
				],
			] );

			return response()->json( [
				'status'          => 'success',
				'message'         => 'Lend created successfully',
				'debt'            => $debt,
				'bankAccountInfo' => $bankAccount
			] );

		}


		// Means you are lending money form someone.

		if ( $debt['type'] === 'borrow' ) {
			$borrowData = [
				'amount'     => ( $debt->amount * - 1 ),
				'account_id' => $debt->account_id,
				'date'       => $debt->date,
				'debt_id'    => $debt->id,
				'note'       => $debt['note']

			];
			Borrow::create( $borrowData );

			// Update Associated bank account by increasing account balance
			$bankAccount->balance += $request->amount;
			$bankAccount->save();

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'create',
				'module'       => 'Debt',
				'descriptions' => " has borrowed an amount of $borrowAmount from $person",
				'data_records' => [
					'borrowData'     => $borrowData,
					'accountBalance' => $bankAccount->balance
				],
			] );

			return response()->json( [
				'status'          => 'success',
				'message'         => 'Borrow created successfully',
				'debt'            => $debt,
				'bankAccountInfo' => $bankAccount
			] );
		}


		return response()->json( [
			'status'  => 'fail',
			'message' => 'Something went wrong'
		] );
	}


	/**
	 * @param Debt $debt
	 *
	 * @return DebtResource
	 */

	public function show( Debt $debt ): DebtResource {
		return new DebtResource( $debt );
	}

	/**
	 * @param $debt_id
	 *
	 * @return JsonResponse
	 * @throws ConfigurationException
	 * @throws TwilioException
	 */

	public function getDebtHistory( $debt_id ): JsonResponse {
		$debt = Debt::find( $debt_id );

		if ( $debt->type == 'borrow' ) {
			$borrows          = collect( Borrow::where( 'debt_id', $debt_id )->get() );
			$repayments       = collect( Repayment::where( 'debt_id', $debt_id )->get() );
			$borrowRepayments = $borrows->merge( $repayments )->sortByDesc( 'created_at' );

			return response()->json( [
				'infos' => DebtHistory::collection( $borrowRepayments )
			] );
		} else {
			$lends                = collect( Lend::where( 'debt_id', $debt_id )->get() );
			$debtCollections      = collect( DebtCollection::where( 'debt_id', $debt_id )->get() );
			$lendsDebtCollections = $lends->merge( $debtCollections )->sortByDesc( 'created_at' );

			return response()->json( [
				'infos' => DebtHistory::collection( $lendsDebtCollections )
			] );
		}

	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update( Request $request, string $id ) {
		//
	}


	/**
	 * @param Debt $debt
	 *
	 * @return JsonResponse
	 * @throws Exception
	 */
	public function destroy( $id ): JsonResponse {
		Debt::where( 'id', $id )->delete();
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'delete',
			'module'       => 'Debt',
			'descriptions' => "",
			'data_records' => [
				'id' => $id,
			],
		] );

		return response()->json( [
			'message' => 'Debt removed'
		] );
	}
}
