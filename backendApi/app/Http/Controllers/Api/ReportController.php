<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseReportResource;
use App\Http\Resources\IncomeReportResource;
use App\Http\Resources\InvestmentReportResource;
use App\Http\Resources\InvestmentResource;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Investment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;


class ReportController extends Controller {
	public function incomeReport( Request $request ): \Illuminate\Http\JsonResponse {
		// Get the optional start_date and end_date parameters from the request
		$startDate = $request->input( 'start_date' );
		$endDate   = $request->input( 'end_date' );
		$cat_id    = $request->input( 'cat_id' );

		if ($startDate){
			$startDate = Carbon::parse( $request->start_date,'Asia/Dubai' )->format( 'Y-m-d' );
		}
		if ($endDate){
			$endDate = Carbon::parse( $request->input()['end_date'] )->format( 'Y-m-d' );
		}
		// Calculate the default date range (last 3 months)
		if ( empty( $startDate ) ) {
			$startDate = Carbon::now()->subMonths( 3 )->toDateString();
		}

		if ( empty( $endDate ) ) {
			$endDate = Carbon::now()->toDateString();
		}

		// Query the incomes based on the date range
		$incomes = Income::where( 'income_date', '>=', $startDate )
		                 ->where( 'income_date', '<=', $endDate )
		                 ->whereHas( 'category', function ( $query ) {
			                 $query->where( 'type', 'income' );
		                 } );
		if ( $cat_id ) {
			$incomes = $incomes->where( 'category_id', $cat_id );
		}

		// Return the income report as a collection of IncomeReportResource
		$incomesRes =  IncomeReportResource::collection( $incomes->orderBy('income_date','DESC')->get() );
		$sum = 0;
		foreach ( $incomesRes as $key => $income ) {
			if ( isset( $income->amount ) ) {
				$sum += $income->amount;
			}
		}

		return response()->json( [
			'totalIncome' => $sum,
			'incomes'     => $incomesRes,
			'startDate'=>date('y-m-d',strtotime($request->start_date)),
			'endDate'=>date('y-m-d',strtotime($request->end_date))
		] );
	}


	/**
	 * @param Request $request
	 *
	 * @return \Illuminate\Http\JsonResponse
	 */

	public function expenseReport( Request $request ) {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;
		$cat_id    = $request->cat_id;

		if ( empty( $startDate ) || empty( $endDate ) ) {
			$endDate   = Carbon::now()->toDateString();
			$startDate = Carbon::now()->subMonth( 3 )->toDateString();
		}

		$expenses = Expense::where( 'expense_date', '>=', $startDate )
		                   ->where( 'expense_date', '<=', $endDate )
		                   ->whereHas( 'category', function ( $query ) {
			                   $query->where( 'type', 'expense' );
		                   } );

		if ( $cat_id ) {
			$expenses = $expenses->where( 'category_id', $cat_id );
		}

		$expensesRes = ExpenseReportResource::collection( $expenses->orderBy('expense_date','DESC')->get() );


		$sum = 0;
		foreach ( $expensesRes as $key => $expense ) {
			if ( isset( $expense->amount ) ) {
				$sum += $expense->amount;
			}
		}

		return response()->json( [
			'totalExpense' => $sum,
			'expenses'     => $expensesRes,
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
		                 ->groupBy(['investor_id','name'] );

		$totalInvestment = DB::table( 'investments' );
		//filter investments
		if ( $startDate || $endDate ) {
			$investments     = $investments->whereBetween( 'investment_date', [ $startDate, $endDate ] );
			$totalInvestment = $totalInvestment->whereBetween( 'investment_date', [ $startDate, $endDate ] );
		}
		$totalInvestment = $totalInvestment->sum( 'amount' );

		return response()->json( [
			'investments'     => $investments->get(),
			'totalInvestment' => $totalInvestment,
		] );

	}
}

