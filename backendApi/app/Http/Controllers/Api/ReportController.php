<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseReportResource;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\IncomeReportResource;
use App\Http\Resources\IncomeResource;
use App\Models\Expense;
use App\Models\Income;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use function Laravel\Prompts\table;

class ReportController extends Controller {
	/**
	 * @throws \Exception
	 */
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

		if ( $startDate && empty( $endDate ) ) {
			$endDate = Carbon::now()->toDateString();
		}

		if ( $endDate && empty( $startDate ) ) {
			$startDate = ( new DateTime( $endDate ) )->format( 'Y-m-01' );
		}


		// Query the incomes based on the date range
		$query = Income::whereNull( 'deleted_at' )
		               ->whereHas( 'category', function ( $query ) {
			               $query->where( 'type', 'income' );
		               } );

		if ( $startDate && $endDate ) {
			$query = $query->whereBetween( 'date', [ $startDate, $endDate ] );
		}
		if ( $cat_id ) {
			$query = $query->where( 'category_id', $cat_id );
		}

		// Return the income report as a collection of IncomeReportResource
		$incomes = IncomeReportResource::collection( $query->orderBy( 'date', 'DESC' )->get() );
		$sum     = 0;
		foreach ( $incomes as $income ) {
			if ( isset( $income->amount ) ) {
				$sum += $income->amount;
			}
		}

		return response()->json( [
			'totalIncome' => $sum,
			'incomes'     => $incomes,
			'startDate'   => $startDate ? date( 'y-m-d', strtotime( $startDate ) ) : null,
			'endDate'     => $endDate ? date( 'y-m-d', strtotime( $endDate ) ) : null,
			'category_id' => $cat_id ?: null
		] );
	}


	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 * @throws \Exception
	 */

	public function expenseReport( Request $request ): JsonResponse {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;
		$cat_id    = $request->cat_id;
		$sec_id    = $request->sec_id;

		if ( $startDate ) {
			$startDate = date( 'Y-m-d', strtotime( $startDate ) );
		}
		if ( $endDate ) {
			$endDate = date( 'Y-m-d', strtotime( $endDate ) );
		}

		if ( $startDate && empty( $endDate ) ) {
			$endDate = Carbon::now()->toDateString();
		}

		if ( $endDate && empty( $startDate ) ) {
			$startDate = ( new DateTime( $endDate ) )->format( 'Y-m-01' );
		}

		$query = Expense::select( 'expenses.*' )->join( 'categories', 'categories.id', '=', 'expenses.category_id' )
		                ->where( 'type', 'expense' )
		                ->whereNull( 'expenses.deleted_at' );

		if ( $startDate || $endDate ) {
			$query = $query->whereBetween( 'date', [ $startDate, $endDate ] );
		}

		if ( $sec_id ) {
			$query = $query->where( 'sector_id', $sec_id );
		}
		if ( $cat_id ) {
			$query = $query->where( 'category_id', $cat_id );
		}
		if ( ! $sec_id && ! $cat_id ) {
			$query = $query->limit( 50 );
		}


		$expensesRes = ExpenseReportResource::collection( $query->orderBy( 'date', 'DESC' )->get() );

		return response()->json( [
			'totalExpense' => fix_number_format( $query->get()->sum( 'amount' ) ),
			'expenses'     => $expensesRes,
			'start_date'   => $startDate ?: null,
			'end_date'     => $endDate ?: null,
			'sector_id'    => $sec_id ?: null,
			'category_id'  => $cat_id ?: null,
		] );
	}

	public function investmentReport( Request $request ): JsonResponse {
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
		                 ->whereNull( 'investments.deleted_at' )
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

	/**
	 * @throws \Exception
	 */
	public function overall( Request $request ): JsonResponse {
		$startDate = $request->start_date;
		$endDate   = $request->end_date;

		if ( $startDate ) {
			$startDate = date( 'Y-m-d', strtotime( $startDate ) );
		}
		if ( $endDate ) {
			$endDate = date( 'Y-m-d', strtotime( $endDate ) );
		}

		if ( $startDate && empty( $endDate ) ) {
			$endDate = Carbon::now()->toDateString();
		}

		if ( $endDate && empty( $startDate ) ) {
			$startDate = ( new DateTime( $endDate ) )->format( 'Y-m-01' );
		}

		$lends  = DB::table( 'debts' )->where( 'type', '=', 'lend' )
		            ->whereNull( 'debts.deleted_at' );
		$borrow = DB::table( 'debts' )->where( 'type', '=', 'borrow' )
		            ->whereNull( 'debts.deleted_at' );

		$refund = DB::table( 'expenses' )
		            ->where( 'refundable_amount', '>', 0 )
		            ->whereNull( 'deleted_at' );

		$investments = DB::table( 'investments' )->selectRaw( 'sum(amount) as amount, investor_id, name' )
		                 ->join( 'users', 'investments.investor_id', '=', 'users.id' )
		                 ->whereNull( 'investments.deleted_at' )
		                 ->groupBy( [ 'investor_id', 'name' ] );

		$incomes = DB::table( 'incomes' )->selectRaw( 'sum(amount) as amount, category_id, name' )
		             ->join( 'categories', 'incomes.category_id', '=', 'categories.id' )
		             ->whereNull( 'incomes.deleted_at' )
		             ->groupBy( [ 'category_id', 'name' ] );

		$expense         = DB::table( 'expenses' )->selectRaw( 'COALESCE(sum(amount), 0) as amount, sector_id, sectors.name' )
		                     ->join( 'categories', 'expenses.category_id', '=', 'categories.id' )
		                     ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		                     ->whereNull( 'expenses.deleted_at' )
		                     ->groupBy( [ 'sector_id', 'sectors.name' ] );
		$totalInvestment = DB::table( 'investments' )->whereNull( 'deleted_at' );
		$totalIncome     = DB::table( 'incomes' )->whereNull( 'deleted_at' );
		$totalExpense    = DB::table( 'expenses' )->whereNull( 'deleted_at' );

		if ( $startDate && $endDate ) {
			$lends           = $lends->whereBetween( 'date', [ $startDate, $endDate ] );
			$borrow          = $borrow->whereBetween( 'date', [ $startDate, $endDate ] );
			$refund          = $refund->whereBetween( 'date', [ $startDate, $endDate ] );
			$incomes         = $incomes->whereBetween( 'date', [ $startDate, $endDate ] );
			$expense         = $expense->whereBetween( 'date', [ $startDate, $endDate ] );
			$investments     = $investments->whereBetween( 'investment_date', [ $startDate, $endDate ] );
			$totalInvestment = $totalInvestment->whereBetween( 'investment_date', [ $startDate, $endDate ] );
			$totalIncome     = $totalIncome->whereBetween( 'date', [ $startDate, $endDate ] );
			$totalExpense    = $totalExpense->whereBetween( 'date', [ $startDate, $endDate ] );
			$refund          = $refund->whereBetween( 'date', [ $startDate, $endDate ] );
		}

		$lends           = $lends->sum( 'amount' );
		$borrow          = $borrow->sum( 'amount' );
		$incomes         = $incomes->get();
		$expense         = $expense->get();
		$investments     = $investments->get();
		$totalInvestment = $totalInvestment->sum( 'amount' );
		$totalIncome     = $totalIncome->sum( 'amount' );
		$totalExpense    = $totalExpense->sum( 'amount' );

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
			'account_receivable' => fix_number_format( $market_receivable + $lends ),
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
	public function monthlyReport( Request $request ): JsonResponse {

		$incomeCategoryId = $request->category_id;
		$fromDate         = date( 'Y-m-d', strtotime( $request->from_date ) );
		$toDate           = ( new DateTime( $fromDate ) )->format( 'Y-m-t' );


		if ( ! $incomeCategoryId || ! $fromDate ) {
			return response()->json( [
				'message' => "Select Income sector or Month."
			], 400 );
		}

		$category = DB::table( 'categories' )->find( $incomeCategoryId );
		if ( ! $category ) {
			return response()->json( [
				'message' => "Income Category not Found!",
			], 404 );
		}
		$sector = DB::table( 'sectors' )->find( $category->sector_id );

		if ( ! $sector ) {
			return response()->json( [
				'message' => "This income Category is not associated with any sector!",
			],400 );
		}

		if ( strtotime( $fromDate ) < strtotime( $sector->contract_start_date ) ) {
			return response()->json( [
				'message' => "$sector->name contract has been started from $sector->contract_start_date. So date can't be found from submitted date.",
			],400 );
		}

		if ( strtotime( $toDate ) > strtotime( $sector->contract_end_date ) ) {
			return response()->json( [
				'message' => "$sector->name contract will end on $sector->contract_end_date. So date can't be found after this contract end date.",
			],400 );
		}

		$incomes = DB::table( 'incomes' )->selectRaw( 'amount,income_type,checkin_date,checkout_date,reference,date as income_date, description' )
		             ->where( 'category_id', '=', $incomeCategoryId )
		             ->whereBetween( 'date', [
			             $fromDate,
			             $toDate
		             ] )
		             ->whereNull( 'deleted_at' )
		             ->get();

		$sector_contract_month = ( new DateTime( $sector->contract_start_date ) )->diff( new DateTime( date( 'Y-m-d', strtotime( "+1 day", strtotime( $sector->contract_end_date ) ) ) ) );
		$month                 = ( ( $sector_contract_month->y ) * 12 ) + ( $sector_contract_month->m );

		$expense = DB::table( 'expenses' )->selectRaw( 'COALESCE(sum(amount), 0) as amount, categories.name' )
		             ->join( 'categories', 'expenses.category_id', '=', 'categories.id' )
		             ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		             ->whereBetween( 'date', [ $fromDate, $toDate ] )
		             ->whereNot( 'categories.name', 'LIKE', '%rent%' )
		             ->where( 'sector_id', '=', $category->sector_id )
		             ->groupBy( [ 'categories.name' ] )
		             ->whereNull( 'expenses.deleted_at' )
		             ->get();

		$expense[] = (object) [
			'amount' => $month > 0 ? round( $sector->rent / $month, 2 ) : 0,
			'name'   => 'Rent'
		];

		return response()->json( [
			'expenses'       => $expense,
			'incomes'        => $incomes,
			'sector'         => $sector,
			'summery'        => $this->monthlySummery( $incomes->sum( 'amount' ), $expense->sum( 'amount' ) ),
			'length'         => max( count( $incomes ), count( $expense->toArray() ) ),
			'reportingMonth' => date( "F,Y", strtotime( $fromDate ) ),
		] );
	}

	public function monthlySummery( $income, $expense ): array {

		if ( $income > $expense ) {
			$net   = $income - $expense;
			$title = 'profit';
		} else {
			$net   = $expense - $income;
			$title = 'loss';
		}

		$percent = ( $net * 100 ) / $expense;

		return [
			'totalIncome'  => fix_number_format( $income ),
			'totalExpense' => fix_number_format( $expense ),
			'net'          => fix_number_format( $net ),
			'title'        => $title,
			'netPercent'   => round( $percent, 2 ) . "%",
		];
	}

	public function calenderReport() {
		$incomeQuery  = Income::whereNull( 'deleted_at' )->orderBy( 'date', 'desc' )->get();
		$expenseQuery = Expense::whereNull( 'deleted_at' )->orderBy( 'date', 'desc' )->get();
		$payments     = DB::table( 'payments' )->where( [
			'status' => 'unpaid',
		] )->whereNull( 'deleted_at' )->get();


		$incomes      = IncomeResource::collection( $incomeQuery );
		$expenses     = IncomeResource::collection( $expenseQuery );
		$calenderDara = [];

		foreach ( $incomes as $income ) {

			$calenderDara[] = (object) [
				'additionalData' => $income,
				'classNames'     => "income-event",
				'color'          => "rgb(65, 147, 136)",
				"start"          => $income->date,
				"title"          => $income->category->name
			];
		}

		foreach ( $expenses as $expense ) {
			$calenderDara[] = (object) [
				'additionalData' => $expense,
				'classNames'     => "expense-event",
				'color'          => "rgb(214, 62, 99)",
				"start"          => $expense->date,
				"title"          => $expense->category->name
			];
		}

		foreach ( $payments as $payment ) {

			$calenderDara[] = (object) [
				"additionalData" => $payment,
				"classNames"     => "payment-event",
				"color"          => "rgb(237, 19, 19)",
				"start"          => $payment->date,
				"title"          => $payment->payment_number
			];
		}

		return response()->json( [
			'calenderData' => $calenderDara
		] );
	}


}

