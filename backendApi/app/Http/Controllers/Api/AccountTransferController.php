<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccountTransferRequest;
use App\Http\Resources\TransferHistoryResource;
use App\Models\AccountTransfer;
use App\Models\BankAccount;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class AccountTransferController extends Controller {


	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 */
	public function index( Request $request ): JsonResponse {
		$currentMonth = Carbon::now()->format( 'm' );

		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );

		$accountTransfers = AccountTransfer::whereMonth( 'transfer_date', $currentMonth )
		                                   ->skip( ( $page - 1 ) * $pageSize )
		                                   ->take( $pageSize )
		                                   ->orderBy( 'id', 'desc' )
		                                   ->get();

		$totalCount = AccountTransfer::whereMonth( 'transfer_date', $currentMonth )->count();

		return response()->json( [
			'data'  => TransferHistoryResource::collection( $accountTransfers ),
			'total' => $totalCount,
		] );
	}

	/**
	 * @return JsonResponse
	 */
	public function accountTransferCurrentMonth(): JsonResponse {
		$currentMonth = Carbon::now()->format( 'm' );

		$accountTransfers = AccountTransfer::whereMonth( 'transfer_date', $currentMonth )
		                                   ->get();

		return response()->json( [
			'data' => TransferHistoryResource::collection( $accountTransfers )
		] );
	}


	/**
	 * @param AccountTransferRequest $request
	 *
	 * @return JsonResponse
	 * @throws ValidationException
	 * @throws Throwable
	 */
	public function transferAmount( AccountTransferRequest $request ): JsonResponse {
		$this->validate( $request, [
			'from_account_id' => 'required|exists:bank_accounts,id',
			'to_account_id'   => 'required|exists:bank_accounts,id',
			'amount'          => 'required|numeric|gt:0',
			'transfer_date'   => 'required|date',
			'note'            => 'nullable|string',
		], [
			'from_account_id.required' => 'You need to select a from account number',
			'from_account_id.exists'   => 'The selected from account is invalid.',
			'to_account_id.required'   => 'You need to select a to account number',
			'to_account_id.exists'     => 'The selected to account is invalid.',
			'amount.required'          => 'You need to put an amount to transfer',
			'amount.numeric'           => 'The amount must be a numeric value',
			'amount.gt'                => 'The amount must be greater than 0',
			'transfer_date.required'   => 'The transfer date is required',
			'transfer_date.date'       => 'The transfer date must be a valid date.',
		] );

		$fromAccountId = $request->input( 'from_account_id' );
		$toAccountId   = $request->input( 'to_account_id' );
		$amount        = $request->input( 'amount' );
		$transferDate  = $request->input( 'transfer_date' );
		$note          = $request->input( 'note' );


		// Do not allow amount transfer between same account
		if ( $fromAccountId === $toAccountId ) {
			return response()->json( [
				'message' => 'Cannot transfer amount between the same account.',
			], 400 );
		}

		try {
			DB::beginTransaction();

			$fromAccount = BankAccount::lockForUpdate()->findOrFail( $fromAccountId );
			$toAccount   = BankAccount::lockForUpdate()->findOrFail( $toAccountId );

			if ( $fromAccount->balance < $amount ) {
				throw ValidationException::withMessages( [
					'amount' => ' Insufficient balance on '. $fromAccount->bankName->bank_name,
				] );
			}

			$fromAccount->balance -= $amount;
			$toAccount->balance   += $amount;

			$fromAccount->save();
			$toAccount->save();

			$transfer                  = new AccountTransfer();
			$transfer->user_id         = auth()->user()->id;
			$transfer->from_account_id = $fromAccountId;
			$transfer->to_account_id   = $toAccountId;
			$transfer->amount          = $amount;
			$transfer->transfer_date   = $transferDate;
			$transfer->note            = $note;
			$transfer->save();

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'object_id'     => $transfer->id,
				'log_type'     => 'edit',
				'module'       => 'transfer',
				'descriptions' => 'has transfer an amount from '.$fromAccount->bankName->bank_name.'('.$fromAccount->account_name.')'.' to '.$toAccount->bankName->bank_name.'('.$toAccount->account_name.')'.' an amount of '.$amount,
				'data_records' => $transfer,
			] );

			DB::commit();

			return response()->json( [
				'message' => 'Amount transferred successfully.',
			] );
		} catch ( Exception $e ) {
			DB::rollBack();

			return response()->json( [
				'message' => 'Failed to transfer amount.' . $e->getMessage(),
			], 500 );
		}
	}

}
