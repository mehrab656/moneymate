<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseReportResource;
use App\Http\Resources\IncomeReportResource;
use App\Http\Resources\IncomeResource;
use App\Http\Resources\InvestmentReportResource;
use App\Http\Resources\InvestmentResource;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Investment;
use App\Models\User;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class ReportController extends Controller {
	public function incomeReport( Request $request ): JsonResponse {
		// Get the optional start_date and end_date parameters from the request
		$startDate = $request->input( 'start_date' );
		$endDate   = $request->input( 'end_date' );
		$cat_id    = $request->input( 'cat_id' );

		if ( $startDate ) {
			$startDate = date( 'Y-m-d', strtotime( $startDate ) );
		}
		if ( $endDate ) {
			$endDate = date( 'Y-m-d', strtotime( $endDate ) );
		}
		// Calculate the default date range (last 3 months)
		if ( empty( $startDate ) ) {
			$startDate = Carbon::now()->subMonths( 3 )->toDateString();
		}

		if ( empty( $endDate ) ) {
			$endDate = Carbon::now()->toDateString();
		}

		// Query the incomes based on the date range
		$incomes = Income::where( 'date', '>=', $startDate )
		                 ->where( 'date', '<=', $endDate )
		                 ->whereHas( 'category', function ( $query ) {
			                 $query->where( 'type', 'income' );
		                 } );
		if ( $cat_id ) {
			$incomes = $incomes->where( 'category_id', $cat_id );
		}

		// Return the income report as a collection of IncomeReportResource
		$incomesRes = IncomeReportResource::collection( $incomes->orderBy( 'date', 'DESC' )->get() );
		$sum        = 0;
		foreach ( $incomesRes as $key => $income ) {
			if ( isset( $income->amount ) ) {
				$sum += $income->amount;
			}
		}

		return response()->json( [
			'totalIncome' => $sum,
			'incomes'     => $incomesRes,
			'startDate'   => date( 'y-m-d', strtotime( $request->start_date ) ),
			'endDate'     => date( 'y-m-d', strtotime( $request->end_date ) )
		] );
	}


	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 */

	public function expenseReport( Request $request ): JsonResponse {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;
		$cat_id    = $request->cat_id;
		$sec_id    = $request->sec_id;

		if ( $startDate && ! $endDate ) {
			$endDate = Carbon::now()->toDateString();

		}

		$query = Expense::select( 'expenses.*' )->join( 'categories', 'categories.id', '=', 'expenses.category_id' )
		                ->where( 'type', 'expense' );

		if ( $startDate || $endDate ) {
			$endDate   = Carbon::parse( $endDate )->format( 'Y-m-d' );
			$startDate = Carbon::parse( $startDate )->format( 'Y-m-d' );
			$query     = $query->whereBetween( 'date', [ $startDate, $endDate ] );
		}

		if ( $sec_id ) {
			$query = $query->where( 'sector_id', $sec_id );
		}
		if ( $cat_id ) {
			$query = $query->where( 'category_id', $cat_id );
		}

		//$response['sql'] = Str::replaceArray( '?', $query->getBindings(), $query->toSql() );//check the sql

		$expensesRes = ExpenseReportResource::collection( $query->orderBy( 'date', 'DESC' )->get() );

		return response()->json( [
			'totalExpense' => fix_number_format( $query->get()->sum( 'amount' ) ),
			'expenses'     => $expensesRes
		] );
	}

	public function investmentReport( Request $request ) {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;


		if ( $startDate || $endDate ) {
			$endDate   = Carbon::parse( $endDate )->format( 'Y-m-d' );
			$startDate = Carbon::parse( $startDate )->format( 'Y-m-d' );
		}
		if ( $startDate && ! $endDate ) {
			$endDate = Carbon::now()->toDateString();

		}
		$investments = DB::table( 'investments' )->selectRaw( 'sum(amount) as amount, investor_id, name' )
		                 ->join( 'users', 'investments.investor_id', '=', 'users.id' )
		                 ->groupBy( [ 'investor_id', 'name' ] );

		$totalInvestment = DB::table( 'investments' );
		//filter investments
		if ( $startDate || $endDate ) {
			$investments     = $investments->whereBetween( 'investment_date', [ $startDate, $endDate ] );
			$totalInvestment = $totalInvestment->whereBetween( 'investment_date', [ $startDate, $endDate ] );
		}
		$totalInvestment = $totalInvestment->sum( 'amount' );

		return response()->json( [
			'investments'     => $investments->get(),
			'totalInvestment' => $totalInvestment //fix_number_format($totalInvestment),
		] );

	}

	public function overall( Request $request ): JsonResponse {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;

		if ( ! $startDate ) {
			$startDate = date( 'Y-m-d', strtotime( '-1 year' ) );
		}
		if ( ! $endDate ) {
			$endDate = Carbon::now()->toDateString();
		}

		$endDate   = Carbon::parse( $endDate )->format( 'Y-m-d' );
		$startDate = Carbon::parse( $startDate )->format( 'Y-m-d' );

		$lends  = DB::table( 'debts' )->whereBetween( 'date', [
			$startDate,
			$endDate
		] )->where( 'type', '=', 'lend' )->sum( 'amount' );
		$borrow = DB::table( 'debts' )->whereBetween( 'date', [
			$startDate,
			$endDate
		] )->where( 'type', '=', 'borrow' )->sum( 'amount' );

		$refund = DB::table( 'expenses' )
		            ->where( 'refundable_amount', '>', 0 )
		            ->whereBetween( 'date', [ $startDate, $endDate ] );

		$investments = DB::table( 'investments' )->selectRaw( 'sum(amount) as amount, investor_id, name' )
		                 ->join( 'users', 'investments.investor_id', '=', 'users.id' )
		                 ->whereBetween( 'investment_date', [ $startDate, $endDate ] )
		                 ->groupBy( [ 'investor_id', 'name' ] )->get();

		$incomes = DB::table( 'incomes' )->selectRaw( 'sum(amount) as amount, category_id, name' )
		             ->join( 'categories', 'incomes.category_id', '=', 'categories.id' )
		             ->whereBetween( 'date', [ $startDate, $endDate ] )
		             ->groupBy( [ 'category_id', 'name' ] )->get();

		$expense = DB::table( 'expenses' )->selectRaw( 'COALESCE(sum(amount), 0) as amount, sector_id, sectors.name' )
		             ->join( 'categories', 'expenses.category_id', '=', 'categories.id' )
		             ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		             ->whereBetween( 'date', [ $startDate, $endDate ] )
		             ->groupBy( [ 'sector_id', 'sectors.name' ] )->get();

		$totalInvestment = DB::table( 'investments' )->whereBetween( 'investment_date', [
			$startDate,
			$endDate
		] )->sum( 'amount' );

		$totalIncome = DB::table( 'incomes' )->whereBetween( 'date', [
			$startDate,
			$endDate
		] )->sum( 'amount' );

		$totalExpense = DB::table( 'expenses' )->whereBetween( 'date', [
			$startDate,
			$endDate
		] )->sum( 'amount' );

		$refundable_amount = $refund->sum( 'refundable_amount' );
		$refunded_amount   = $refund->sum( 'refunded_amount' );

		//Total Cash IN = Investment + Income + Refunded Amount + Loan(borrow)
		$total_cash_in = $totalInvestment + $totalIncome + $refunded_amount + abs( $borrow );

		//Total Cash Out = Expense + Loan(lend)
		$total_cash_out    = $totalExpense + abs( $lends );
		$market_receivable = $refundable_amount - $refunded_amount;

		return response()->json( [
			'investments'        => $investments,
			'incomes'            => $incomes,
			'expenses'           => $expense,
			'totalInvestment'    => fix_number_format( $totalInvestment ),
			'totalExpense'       => fix_number_format( $totalExpense ),
			'totalIncome'        => fix_number_format( $totalIncome ),
			'length'             => max( count( $investments ), count( $incomes ), count( $expense ) ),
			'refundable_amount'  => fix_number_format( $refundable_amount ),
			'refunded_amount'    => fix_number_format( $refunded_amount ),
			'market_receivable'  => fix_number_format( $refundable_amount - $refunded_amount ),
			//only return from market
			'account_receivable' => fix_number_format( $market_receivable + $lends ),
			// return from market and lend to others
			'lends'              => fix_number_format( abs( $lends ) ),
			'borrow'             => fix_number_format( abs( $borrow ) ),
			'total_cash_in'      => fix_number_format( $total_cash_in ),
			'total_cash_out'     => fix_number_format( $total_cash_out ),
			'current_balance'    => fix_number_format( $total_cash_in - $total_cash_out ),
		] );
	}

	/**
	 * @throws \Exception
	 */
	public function monthlyReport( Request $request ) {

		$incomeCategoryId = $request->category_id;
		$fromDate         = $request->from_date;
		$toDate           = $request->to_date;
		$category         = DB::table( 'categories' )->find( $incomeCategoryId );
		if ( ! $category ) {
			return response()->json( [
				'message' => "Income Category not Found!",
				'status'  => 404
			] );
		}
		$sector = DB::table( 'sectors' )->find( $category->sector_id );


		if ( ! $sector ) {
			return response()->json( [
				'message' => "This income Category is not associated with any sector!",
				'status'  => 404
			] );
		}

		if ( strtotime( $fromDate ) < strtotime( $sector->contract_start_date ) ) {
			return response()->json( [
				'message' => "$sector->name contract has been started from $sector->contract_start_date. So date can't be found from submitted date.",
				'status'  => 404
			] );
		}
		if ( strtotime( $toDate ) > strtotime( $sector->contract_end_date ) ) {
			return response()->json( [
				'message' => "$sector->name contract will end on $sector->contract_end_date. So date can't be found after this contract end date.",
				'status'  => 404
			] );
		}

		$incomes = DB::table( 'incomes' )->selectRaw( 'amount,income_type,checkin_date,checkout_date,reference,date as income_date, description' )
		             ->where( 'category_id', '=', $incomeCategoryId )
		             ->whereBetween( 'date', [
			             $fromDate,
			             $toDate
		             ] )
		             ->get();

		$sector_contract_month = ( new DateTime( $sector->contract_start_date ) )->diff( new DateTime( date( 'Y-m-d', strtotime( "+1 day", strtotime( $sector->contract_end_date ) ) ) ) );
		$month                 = ( ( $sector_contract_month->y ) * 12 ) + ( $sector_contract_month->m );

		$expense = DB::table( 'expenses' )->selectRaw( 'COALESCE(sum(amount), 0) as amount, categories.name' )
		             ->join( 'categories', 'expenses.category_id', '=', 'categories.id' )
		             ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		             ->whereBetween( 'date', [ $fromDate, $toDate ] )
		             ->whereNot( 'categories.name', 'LIKE', '%rent%' )
		             ->where( 'sector_id', '=', $category->sector_id )
		             ->groupBy( [ 'categories.name' ] )->get();

		$expense[] = (object) [
			'amount' => $month > 0 ? round($sector->rent / $month,2) : 0,
			'name'   => 'Rent'
		];

		return response()->json( [
			'expenses'     => $expense,
			'incomes'      => $incomes,
			'sector'       => $sector,
			'status'       => 200,
			'length'       => max( count( $incomes ), count( $expense->toArray() ) ),
			'totalIncome'  => fix_number_format($incomes->sum( 'amount' )),
			'totalExpense' => fix_number_format($expense->sum( 'amount' ))
		] );

	}
}

