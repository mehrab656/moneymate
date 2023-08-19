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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;


class ReportController extends Controller {
	public function incomeReport( Request $request ): AnonymousResourceCollection {
		// Get the optional start_date and end_date parameters from the request
		$startDate = $request->input( 'start_date' );
		$endDate   = $request->input( 'end_date' );

		// Calculate the default date range (last 3 months)
		if ( empty( $startDate ) ) {
			$startDate = Carbon::now()->subMonths( 3 )->toDateString();
		}

		if ( empty( $endDate ) ) {
			$endDate = Carbon::now()->toDateString();
		}

		// Query the incomes based on the date range
		$incomes = Income::where( 'income_date', '>=', $startDate )
		                 ->where( 'user_id', auth()->user()->id )
		                 ->where( 'income_date', '<=', $endDate )
		                 ->whereHas( 'category', function ( $query ) {
			                 $query->where( 'type', 'income' );
		                 } )
		                 ->get();

		// Return the income report as a collection of IncomeReportResource
		return IncomeReportResource::collection( $incomes );
	}


	/**
	 * @param Request $request
	 *
	 * @return AnonymousResourceCollection
	 */

	public function expenseReport( Request $request ): AnonymousResourceCollection {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;

		if ( empty( $startDate ) || empty( $endDate ) ) {
			$endDate   = Carbon::now()->toDateString();
			$startDate = Carbon::now()->subMonth( 3 )->toDateString();
		}

		$expenses = Expense::where( 'expense_date', '>=', $startDate )
		                   ->where( 'user_id', auth()->user()->id )
		                   ->where( 'expense_date', '<=', $endDate )
		                   ->whereHas( 'category', function ( $query ) {
			                   $query->where( 'type', 'expense' );
		                   } )->get();

		return ExpenseReportResource::collection( $expenses );
	}

	public function investmentReport( Request $request ) {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;


		if ( $startDate || $endDate ) {
			$endDate   = Carbon::parse( $endDate )->format( 'Y-m-d' );
			$startDate = Carbon::parse( $startDate )->format( 'Y-m-d' );
		}
		if ( $startDate && !$endDate){
			$endDate   = Carbon::now()->toDateString();

		}
		$investments = DB::table( 'investments' )->selectRaw( 'sum(amount) as amount, investor_id, name' )
		                 ->join( 'users', 'investments.investor_id', '=', 'users.id' )
		                 ->groupBy( 'investor_id' );

		$totalInvestment = DB::table( 'investments' );
		//filter investments
		if ( $startDate || $endDate ) {
			$investments = $investments->whereBetween('investment_date',[$startDate,$endDate]);
			$totalInvestment = $totalInvestment->whereBetween('investment_date',[$startDate,$endDate]);
		}
		$totalInvestment = $totalInvestment->sum( 'amount' );

		return response()->json( [
			'investments'     => $investments->get(),
			'totalInvestment' => $totalInvestment,
		] );

	}
}
