<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SectorRequest;
use App\Http\Requests\SectorUpdateRequest;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvestmentResource;
use App\Http\Resources\SectorResource;
use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Investment;
use App\Models\PaymentModel;
use App\Models\SectorModel;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Nette\Schema\ValidationException;
use Throwable;

class SectorModelController extends Controller {
	/**
	 * Display a listing of the resource.
	 * @throws \Exception
	 */
	public function index( Request $request ) {

		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );


		$sectors = SectorModel::skip( ( $page - 1 ) * $pageSize )
		                      ->take( $pageSize )
		                      ->orderBy( 'id', 'DESC' )
		                      ->get();

		$totalCount = SectorModel::count();

		return response()->json( [
			'data'  => SectorResource::collection( $sectors ),
			'total' => $totalCount,
		] );
	}

	/**
	 * Show the form for creating a new resource.
	 * @throws Throwable
	 */
	public function add( SectorRequest $request ): JsonResponse|RedirectResponse {

		$sector             = $request->validated();
		$payment['numbers'] = $sector['payment_number'];
		$payment['amount']  = $sector['payment_amount'];
		$payment['date']    = $sector['payment_date'];
		if ( isset( $sector['category_name'] ) ) {
			$associativeCategories = $sector['category_name'];
		}

		$sectorData = [
			'name'                  => $sector['name'],
			'payment_account_id'    => $sector['payment_account_id'],
			'contract_start_date'   => Carbon::parse( $sector['contract_start_date'] )->format( 'Y-m-d' ),
			'contract_end_date'     => Carbon::parse( $sector['contract_end_date'] )->format( 'Y-m-d' ),
			'el_premises_no'        => $sector['el_premises_no'],
			'el_acc_no'             => $sector['el_acc_no'],
			'el_business_acc_no'    => $sector['el_business_acc_no'],
			'el_billing_date'       => Carbon::parse( $sector['el_billing_date'] )->format( 'Y-m-d' ),
			'internet_acc_no'       => $sector['internet_acc_no'],
			'internet_billing_date' => Carbon::parse( $sector['internet_billing_date'] )->format( 'Y-m-d' ),
			'int_note'              => $sector['int_note']
		];

		$internet_contract_period = $sector['contract_period'];
		if ( $internet_contract_period > 24 ) {
			$internet_contract_period = 24;
		}

		DB::beginTransaction();
		try {
			//first insert the sector data.
			$sector = SectorModel::create( $sectorData );

			//now  insert the internet billing dates on payment table
			for ( $i = 1; $i <= $internet_contract_period; $i ++ ) {
				PaymentModel::create( [
					'sector_id'      => $sector['id'],
					'payment_number' => $sector['name'] . ' internet bill for ' . date( 'Y-m-d', strtotime( "+$i month", strtotime( $sectorData['internet_billing_date'] ) ) ),
					'date'           => date( 'Y-m-d', strtotime( "+$i month", strtotime( $sectorData['internet_billing_date'] ) ) ),
					'amount'         => 0,
					'type'           => 'internet',
					'note'           => null,
				] );
			}

			//now insert electricity billing date on payment table
			for ( $i = 1; $i <= 12; $i ++ ) {
				PaymentModel::create( [
					'sector_id'      => $sector['id'],
					'payment_number' => $sector['name'] . ' electricity bill for ' . date( 'Y-m-d', strtotime( "+$i month", strtotime( $sectorData['el_billing_date'] ) ) ),
					'date'           => date( 'Y-m-d', strtotime( "+$i month", strtotime( $sectorData['el_billing_date'] ) ) ),
					'amount'         => 0,
					'type'           => 'electricity',
					'note'           => null,
				] );
			}

			//now insert the payment plans for the sectors cheque.
			if ( ! empty( $payment['numbers'] ) ) {
				$totalPayment = count( $payment['numbers'] );

				for ( $i = 0; $i < $totalPayment; $i ++ ) {
					PaymentModel::create( [
						'sector_id'      => $sector['id'],
						'payment_number' => $payment['numbers'][ $i ],
						'date'           => Carbon::parse( $payment['date'][ $i ] )->format( 'Y-m-d' ),
						'amount'         => $payment['amount'][ $i ],
						'type'           => 'cheque',
						'note'           => null,
					] );
				}
			}

			//now update the category
			//first add a default category according the sector for income
			Category::create( [
				'sector_id' => $sector['id'],
				'user_id'   => auth()->user()->id,
				'name'      => $sector['name'],
				'type'      => 'income',
			] );

			//now check if there is any associative category.
			if ( ! empty( $associativeCategories ) ) {
				foreach ( $associativeCategories as $category ) {
					Category::create( [
						'sector_id' => $sector['id'],
						'user_id'   => auth()->user()->id,
						'name'      => $sector['name'] . '-' . $category,
						'type'      => 'expense',
					] );
				}
			}

			//Add activity Log
			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'create',
				'module'       => 'sectors',
				'descriptions' => '',
				'data_records' => $sectorData,
			] );
		} catch ( ValidationException $e ) {
			DB::rollBack();

			return redirect()->back()->withErrors( $e->getMessages() )->withInput();

		}
		DB::commit();

		return response()->json( [
			'data' => $sector
		] );
	}

	/**
	 * Display the specified resource.
	 */
	public function show( SectorModel $sector ): SectorResource {
		return new SectorResource( $sector );
	}

	/**
	 * Show the form for editing the specified resource.
	 */
	public function edit( SectorModel $sectorModel ) {
		//
	}

	/**
	 * Update the specified resource in storage.
	 * @throws \Exception
	 */
	public function update( SectorUpdateRequest $request, SectorModel $sector ) {
		$data = $request->validated();

		$sector->fill( $data );
		$sector->save();
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'Update',
			'module'       => 'Sector',
			'descriptions' => "",
			'data_records' => $sector
		] );

		return new SectorResource( $sector );
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy( SectorModel $sectorModel ) {
		//
	}

	public function getTotalExpenseAndIncomeBySectorID( $sectorID ) {
		$sectorID = (int) $sectorID;

		if ( ! $sectorID ) {
			return [
				'message'      => 'No sector id provided.',
				'totalIncome'  => 0,
				'totalExpense' => 0
			];
		}

		$expense = DB::table( 'sectors' )
		             ->join( 'categories', 'sectors.id', '=', 'categories.sector_id' )
		             ->join( 'expenses', 'categories.id', '=', 'expenses.category_id' )
		             ->where( 'sectors.id', $sectorID )
		             ->sum( 'expenses.amount' );

		$income = DB::table( 'sectors' )
		            ->join( 'categories', 'sectors.id', '=', 'categories.sector_id' )
		            ->join( 'incomes', 'categories.id', '=', 'incomes.category_id' )
		            ->where( 'sectors.id', $sectorID )
		            ->sum( 'incomes.amount' );

		return response()->json( [
			'income'  => $income,
			'expense' => $expense
		] );
	}

	/**
	 * @throws Throwable
	 */
	public function changePaymentStatus( $id ) {
		$id = abs( $id );
		if ( ! $id ) {
			return [
				'message' => 'Payment id is not provided',
				'status'  => 400,
			];
		}
		$isUpdated      = false;
		$paymentDetails = DB::table( 'payments' )->find( $id );

		if ( ! $paymentDetails ) {
			return [ 'message' => 'No Payment Details was found', 'status' => 200 ];
		}

		$sector = DB::table( 'sectors' )->find( $paymentDetails->sector_id );

		if ( ! $sector ) {
			return [ 'message' => 'No Sectors were found according to this payment term!', 'status' => 200 ];
		}

		$category = DB::table( 'categories' )
		              ->where( 'sector_id', '=', $sector->id )
		              ->where( function ( $query ) {
			              $query->where( 'name', 'LIKE', '%apartment%' )
			                    ->orWhere( 'name', 'LIKE', '%rent%' );
		              } )->first();

		if ( ! $category ) {
			return [
				'message' => 'No Associative category were found according to this payment term!',
				'status'  => 200
			];
		}

		$expense = [
			'user_id'           => Auth::user()->id,
			'account_id'        => $sector->payment_account_id,
			'amount'            => $paymentDetails->amount,
			'refundable_amount' => 0,
			'category_id'       => $category->id,
			'description'       => $paymentDetails->payment_number . ' ' . 'payment of ' . $sector->name,
			'note'              => 'This expense was recorded while user paid from sector details directly.',
			'reference'         => 'Automated Payment for : ' . $sector->name,
			'date'              => Carbon::now()->format( 'Y-m-d' )
		];
		// Create and response for this expense.

		DB::beginTransaction();
		try {
			Expense::create( $expense );
			$isUpdated = DB::table( 'payments' )
			               ->where( 'id', $id )
			               ->update( [ 'status' => 'paid' ] );
		} catch ( ValidationException $e ) {
			DB::rollBack();

			return redirect()->back()->withErrors( $e->getMessages() )->withInput();
		}

		//Add activity Log
		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'edit',
			'module'       => 'sectors',
			'descriptions' => 'updated payment status.',
			'data_records' => $expense,
		] );

		DB::commit();

		return [
			'message' => $isUpdated ? 'Payment was marked as paid!' : 'Unable to mark payment as paid',
			'status'  => 200
		];
	}

	public function payBills( $paymentID, Request $request ) {
		$id = abs( $paymentID );
		if ( ! $id ) {
			return [
				'message' => 'Payment id is not provided',
				'status'  => 400,
			];
		}
		$isUpdated = false;
		$type      = $request->type;
		$date      = $request->date;

		$search_criteria = $type === 'internet' ? 'internet' : ( $type === 'cheque' ? 'rent cost' : 'electricity' );
		$sector          = DB::table( 'sectors' )->find( $request->sector_id );
		$category        = DB::table( 'categories' )
		                     ->where( 'sector_id', '=', $sector->id )
		                     ->where( function ( $query ) use ( $search_criteria ) {
			                     $query->where( 'name', 'LIKE', '%electricity%' )
			                           ->orWhere( 'name', 'LIKE', "%$search_criteria%" );
//			                           ->orWhere( 'name', 'LIKE', '%city%' );
		                     } )->first();

		if ( ! $category ) {
			return [
				'message' => 'No Associative category were found according to this payment term!',
				'status'  => 200
			];
		}
		$bankAccount = BankAccount::find( $sector->payment_account_id );
		if ( $bankAccount->balance < $request->amount ) {
			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'bill_pay',
				'module'       => "$type-bill-payments",
				'descriptions' => "tried to pay $type bill of an amount " . $request->amount . " was failed due to insufficient account balance.",
				'data_records' => $request,
			] );

			return response()->json( [
				'message' => 'Insufficient amount to pay this bill!',
			], 400 );
		}
		$expense = [
			'user_id'           => Auth::user()->id,
			'account_id'        => $sector->payment_account_id,
			'amount'            => $request->amount,
			'refundable_amount' => 0,
			'category_id'       => $category->id,
			'description'       => $request->payment_number,
			'note'              => 'This expense was recorded while user paid from sector details directly.',
			'reference'         => 'Automated Payment for : ' . $sector->name . strtoupper( $request->type ),
			'date'              => $date
		];

		DB::beginTransaction();
		try {
			Expense::create( $expense );
			$isUpdated = DB::table( 'payments' )
			               ->where( 'id', $id )
			               ->update( [
				               'status'     => 'paid',
				               'amount'     => $request->amount,
				               'updated_at' => Carbon::now()->format( 'Y-m-d H:i:s' )
			               ] );

			$bankAccount->balance -= $request->amount;
			$bankAccount->save();

			//Add activity Log
			storeActivityLog( [
				'user_id'      => Auth::user()->id,
				'log_type'     => 'update',
				'module'       => "$type-payments",
				'descriptions' => "Add $type bill payment on" . $request->payment_number . ' ' . $request->amount,
				'data_records' => $expense,
			] );


		} catch ( ValidationException $e ) {
			DB::rollBack();

			return redirect()->back()->withErrors( $e->getMessages() )->withInput();
		}

		DB::commit();

		return response()->json( [
			'message' => $isUpdated ? 'Bill paid successfully!' : 'Unable to pay bill.',
			'status'  => $isUpdated ? 200 : 400
		] );
	}

	public function sectorList(): JsonResponse {
		$sectors = SectorModel::get();

		return response()->json( [ 'sectors' => $sectors ] );
	}
}

