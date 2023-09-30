<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SectorRequest;
use App\Http\Resources\InvestmentResource;
use App\Http\Resources\SectorResource;
use App\Models\Category;
use App\Models\Investment;
use App\Models\PaymentModel;
use App\Models\SectorModel;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Nette\Schema\ValidationException;
use Throwable;

class SectorModelController extends Controller {
	/**
	 * Display a listing of the resource.
	 */
	public function index( Request $request ) {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );


		$sectors = SectorModel::skip( ( $page - 1 ) * $pageSize )
		                      ->take( $pageSize )
		                      ->orderBy( 'id', 'desc' )
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

		DB::beginTransaction();
		try {
			//first insert the sector data.
			$sector = SectorModel::create( [
				'name'                  => $sector['name'],
				'contract_start_date'   => Carbon::parse( $sector['contract_start_date'] )->format( 'Y-m-d' ),
				'contract_end_date'     => Carbon::parse( $sector['contract_end_date'] )->format( 'Y-m-d' ),
				'el_premises_no'        => $sector['el_premises_no'],
				'el_acc_no'             => $sector['el_acc_no'],
				'el_business_acc_no'    => $sector['el_business_acc_no'],
				'el_billing_date'       => Carbon::parse( $sector['el_billing_date'] )->format( 'Y-m-d' ),
				'internet_acc_no'       => $sector['internet_acc_no'],
				'internet_billing_date' => Carbon::parse( $sector['internet_billing_date'] )->format( 'Y-m-d' ),
				'int_note'              => $sector['int_note']
			] );

			//now insert the payment plans for the sectors.
			if ( ! empty( $payment['numbers'] ) ) {
				$totalPayment = count( $payment['numbers'] );

				for ( $i = 0; $i < $totalPayment; $i ++ ) {
					PaymentModel::create( [
						'sector_id'      => $sector['id'],
						'payment_number' => $payment['numbers'][ $i ],
						'date'           => Carbon::parse( $payment['date'][ $i ] )->format( 'Y-m-d' ),
						'amount'         => $payment['amount'][ $i ],
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
	 * Store a newly created resource in storage.
	 */
	public function store( Request $request ) {
		//
	}

	/**
	 * Display the specified resource.
	 */
	public function show( SectorModel $sectorModel ) {
		//
	}

	/**
	 * Show the form for editing the specified resource.
	 */
	public function edit( SectorModel $sectorModel ) {
		//
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update( Request $request, SectorModel $sectorModel ) {
		//
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

	public function changePaymentStatus( $id ) {
		$id = abs( $id );
		if ( ! $id ) {
			return [
				'message' => 'Payment id is not provided',
				'status'=>400,
			];
		}

		$isUpdated = DB::table( 'payments' )
		               ->where( 'id', $id )
		               ->update( [ 'status' => 'paid' ] );

		return [ 'message' => $isUpdated ? 'Payment was marked as paid!' : 'Unable to mark payment as paid','status'=>200 ];
	}

	public function sectorList(): JsonResponse {
		$sectors = SectorModel::get();

		return response()->json( [ 'sectors' => $sectors ] );
	}
}

