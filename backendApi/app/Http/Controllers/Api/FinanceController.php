<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class FinanceController extends Controller {
	public function getAccountStatement(): JsonResponse {
		$totalAccountBalance = BankAccount::where('company_id',Auth::user()->primary_company)->sum( 'balance' );
		$totalWalletBalance  = Wallet::where('company_id',Auth::user()->primary_company)->sum( 'balance' );
		$totalIncome         = Income::where('company_id',Auth::user()->primary_company)->sum( 'amount' );
		$totalExpense        = Expense::where('company_id',Auth::user()->primary_company)->sum( 'amount' );

		return response()->json( [
			'totalIncome'         => $totalIncome,
			'totalAccountBalance' => $totalAccountBalance + $totalWalletBalance,
			'totalExpense'        => $totalExpense
		] );
	}
}
