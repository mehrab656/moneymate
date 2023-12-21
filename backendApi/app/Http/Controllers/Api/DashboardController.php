<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Borrow;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Lend;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller {
	/**
	 * @return JsonResponse
	 */

	public function dashboardData(): JsonResponse {
		$incomeOfThisMonth = Income::whereMonth( 'date', date( 'm' ) )
		                           ->whereYear( 'date', date( 'Y' ) )
		                           ->sum( 'amount' );

		$expenseOfThisMonth = Expense::whereMonth( 'date', date( 'm' ) )
		                             ->whereYear( 'date', date( 'Y' ) )
		                             ->sum( 'amount' );

		$totalBalance = BankAccount::sum( 'balance' );

		$totalLend = Lend::sum( 'amount' );

//        $userId = auth()->user()->id;

		$totalBorrow = Borrow::sum( 'amount' );

		$active_budget = $this->getActiveBudgets();

		$numberOfBankAccount = BankAccount::count();

		$totalSubscriptionAmountOfThisMonth = Subscription::whereBetween( 'created_at',
			[
				Carbon::now()->startOfMonth(),
				Carbon::now()->endOfMonth()
			] )
		                                                  ->sum( 'amount' );

		return response()->json( [
			'income_of_this_month'                    => $incomeOfThisMonth,
			'expense_of_this_month'                   => $expenseOfThisMonth,
			'total_balance'                           => $totalBalance,
			'total_lend'                              => $totalLend,
			'total_borrow'                            => $totalBorrow,
			'number_of_bank_account'                  => $numberOfBankAccount,
			'total_subscription_amount_of_this_month' => $totalSubscriptionAmountOfThisMonth,
			'active_budget'                           => $active_budget
		] );
	}

	/**
	 * Gut the budget list which are currently active for Dashboard presentations.
	 *
	 * @return array
	 */
	public function getActiveBudgets(): array {
		$currentDate = Carbon::now()->toDateString();
		$activeBudgets = Budget::where( 'start_date', '<=', $currentDate )
		                       ->where( 'end_date', '>=', $currentDate )
		                       ->get();

		$activeBudgetCount = $activeBudgets->count();

		$data = [];
		foreach ( $activeBudgets as $budget ) {
			$amountAvailable = $budget->updated_amount;
			// You can perform additional calculations or logic here if needed
			$data[] = [
				'id'                     => $budget->id,
				'active_budget_count'    => $activeBudgetCount,
				'original_budget_amount' => $budget->amount,
				'budget_name'            => $budget->budget_name,
				'amount_available'       => $amountAvailable,
			];
		}

		return $data;
	}

}
