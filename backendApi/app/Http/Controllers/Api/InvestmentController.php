<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvestmentRequest;
use App\Http\Requests\UpdateInvestmentRequest;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvestmentResource;
use App\Models\BankAccount;
use App\Models\Investment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Nette\Schema\ValidationException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvestmentController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function index( Request $request ) {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );


		$invests = Investment::skip( ( $page - 1 ) * $pageSize )
		                     ->take( $pageSize )
		                     ->orderBy( 'id', 'desc' )
		                     ->get();

		$totalCount = Investment::count();

		return response()->json( [
			'data'  => InvestmentResource::collection( $invests ),
			'total' => $totalCount,
		] );
	}

	/**
	 * Show the form for creating a new resource.
	 */
	public function add( InvestmentRequest $request ): JsonResponse {
		$invest = $request->validated();
		$user   = Auth::user();

		$investDate = Carbon::parse( $invest['investment_date'] )->format( 'Y-m-d' );
		$invest     = Investment::create( [
			'investor_id'     => $invest['investor_id'],
			'added_by'        => $user->id, //current user
			'amount'          => $invest['amount'],
			'note'            => $invest['note'],
			'account_id'      => $invest['account_id'],
			'investment_date' => $investDate,
		] );

		// Update the balance of the bank account
		$bankAccount          = BankAccount::find( $request->account_id );
		$bankAccount->balance += $request->amount;
		$bankAccount->save();

		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'create',
			'module'       => 'investment',
			'descriptions' => "",
			'data_records' => array_merge( json_decode( json_encode( $invest ), true ), [ 'account_balance' => $bankAccount->balance ] ),
		] );

		// return response()->json( [
		// 	'invest' => $invest,
		// ] );
		return response()->json( [
			'invest' => $invest,
			'message'     => 'Success!',
			'description' => 'Investment created!.',
		] );
	}

	/**
	 * Display the specified resource.
	 */
	public function show( Investment $investment ) {
		return new InvestmentResource( $investment );
	}

	/**
	 * Show the form for editing the specified resource.
	 */
	public function edit( Investment $investor ) {
		//
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update( UpdateInvestmentRequest $request, Investment $investment ) {
		$data = $request->validated();
		$user = Auth::user();

		DB::beginTransaction();
		try {
			//first handel bank
			$bankAccount          = BankAccount::find( $investment->account_id );
			$bankAccount->balance = $bankAccount->balance - $investment->amount;
			$bankAccount->save();

			// now update other data
			$investDate              = Carbon::parse( $data['investment_date'] )->format( 'Y-m-d' );
			$data['added_by']        = $user->id;
			$data['investment_date'] = $investDate;

			$investment->update( $data );
			$investment->save();

			//now again update bank with the new amount.
			$bankAccount          = BankAccount::find( $request->account_id );
			$bankAccount->balance += $request->amount;
			$bankAccount->save();

			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'edit',
				'module'       => 'investment',
				'descriptions' => "",
				'data_records' => array_merge( json_decode( json_encode( $investment ), true ), [ 'account_balance' => $bankAccount->balance ] ),
			] );

		} catch ( ValidationException $e ) {
			DB::rollBack();

			return redirect()->back()->withErrors( $e->getMessages() )->withInput();
		}
		DB::commit();

		// return new InvestmentResource( $investment );
		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Investment updated!.',
		] );
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy( Investment $investment ): Response {
		$investment->delete();

		/**
		 * Adjust bank account
		 */

		$bankAccount = BankAccount::find( $investment->account_id );
		if ( $investment->amount > 0 ) {
			$bankAccount->balance -= $investment->amount;
			$bankAccount->save();
		}
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'delete',
			'module'       => 'investment',
			'descriptions' => "",
			'data_records' => array_merge( json_decode( json_encode( $investment ), true ), [ 'account_balance' => $bankAccount->balance ] ),
		] );

		// return response()->noContent();
		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Investment deleted!.',
		] );
	}

	public function addPlan( Request $request ) {
		$s = $request->purposes;

		return $s;
	}
}
