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

class FinanceController extends Controller {
	public function getAccountStatement(): JsonResponse {
		$totalAccountBalance = BankAccount::sum( 'balance' );
		$totalWalletBalance  = Wallet::sum( 'balance' );
		$totalIncome         = Income::sum( 'amount' );
		$totalExpense        = Expense::sum( 'amount' );

		return response()->json( [
			'totalIncome'         => $totalIncome,
			'totalAccountBalance' => $totalAccountBalance + $totalWalletBalance,
			'totalExpense'        => $totalExpense
		] );
	}
}
