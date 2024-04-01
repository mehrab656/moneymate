<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Borrow;
use App\Models\Debt;
use App\Models\Repayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BorrowController extends Controller {

	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 */
	public function addBorrow( Request $request ): JsonResponse {
		$data = $request->validate( [
			'amount'     => 'required|numeric',
			'note'       => 'required',
			'debt_id'    => 'required|exists:debts,id',
			'account_id' => 'required|exists:bank_accounts,id',
			'date'       => 'required|date',
		] );

		//lets start transaction
		try {
			DB::beginTransaction();
			$borrow = Borrow::create( $data );


			// Update Data in Debt table

			$debt         = Debt::find( $request->debt_id );
			$debt->amount -= $request->amount;
			$debt->save();

			// Update amount in Bank account table

			$bankAccount          = BankAccount::find( $request->account_id );
			$bankAccount->balance += $request->amount;
			$bankAccount->save();

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'object_id'     => $borrow->id,
				'log_type'     => 'edit',
				'module'       => 'Borrow',
				'descriptions' => "has borrow some more amount of $request->amount From $debt->person",
				'data_records' => [
					'Borrow Table Data' => $borrow,
					'Debt Data'         => $debt
				],
			] );

			DB::commit();
		} catch ( \Throwable $e ) {
			DB::rollBack();

			return response()->json( [
				'message' => 'Cannot add Borrow.',
			] );
		}

		return response()->json( [
			'status'  => 'success',
			'message' => 'Borrow added successfully',
			'data'    => $borrow
		] );
	}


	/**
	 * @param Request $request
	 * @param Borrow $borrow
	 *
	 * @return JsonResponse
	 */

	public function updateBorrow( Request $request, Borrow $borrow ): JsonResponse {
		$borrow = Borrow::findOrFail( $borrow->id );

		$data = $request->validate( [
			'amount'     => 'numeric',
			'debt_id'    => 'exists:debts,id',
			'account_id' => 'exists:bank_accounts,id',
		] );

		$borrow->update( $data );

		return response()->json( [ 'message' => 'Borrow updated successfully', 'data' => $borrow ] );
	}


	/**
	 * @param Borrow $borrow
	 *
	 * @return JsonResponse
	 */
	public function removeBorrow( Borrow $borrow ): JsonResponse {
		$borrow = Borrow::findOrFail( $borrow->id );
		$borrow->delete();

		return response()->json( [ 'message' => 'Borrow removed successfully' ] );
	}


	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 */
	public function addRepay( Request $request ): JsonResponse {
		$data = $request->validate( [
			'amount'     => 'required|numeric',
			'note'       => 'required',
			'debt_id'    => 'required|exists:debts,id',
			'account_id' => 'required|exists:bank_accounts,id',
			'date'       => 'required|date',
		] );

		$bankAccount = BankAccount::find( $request->account_id );
		$debt        = Debt::find( $request->debt_id );

		if ( $request->amount > $bankAccount->balance ) {
			return response()->json( [
				'action_status'     => 'insufficient_balance',
				'message'           => 'Insufficient balance in the selected bank account. Please use another bank account to repay.',
				'available_balance' => $bankAccount->balance
			] );
		}

		if ( $request->amount > ( $debt->amount * - 1 ) ) {
			return response()->json( [
				'action_status' => 'invalid_amount',
				'message'       => 'You have entered invalid amount'
			] );
		}

		try {
			DB::beginTransaction();

			$repayment = Repayment::create( $data );


			$debt->amount += $request->amount;
			$debt->save();


			$bankAccount->balance -= $request->amount;
			$bankAccount->save();

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'object_id'     => $repayment->id,
				'log_type'     => 'edit',
				'module'       => 'Borrow',
				'descriptions' => "has paid an amount of $request->amount to $debt->person",
				'data_records' => [
					'Borrow Table Data' => $repayment,
					'Debt Data'         => $debt
				],
			] );


			DB::commit();
		} catch ( \Throwable $e ) {
		DB::rollBack();
			return response()->json( [
				'message'       => 'Repayment can not be created.'
			] );
		}


		return response()->json( [
			'message'   => 'Repayment data added successfully',
			'repayment' => $repayment
		], 201 );

	}

	public function updateRepay( Request $request, Repayment $borrow ) {
	}

	public function removeRepay( Repayment $borrow ) {

	}


}
