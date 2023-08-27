<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Borrow;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Lend;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * @return JsonResponse
     */

    public function dashboardData(): JsonResponse
    {
        $incomeOfThisMonth = Income::whereMonth('income_date', date('m'))
            ->whereYear('income_date', date('Y'))
            ->sum('amount');

        $expenseOfThisMonth = Expense::whereMonth('expense_date', date('m'))
            ->whereYear('expense_date', date('Y'))
            ->sum('amount');

        $totalBalance = BankAccount::sum('balance');

        $totalLend = Lend::sum('amount');

        $userId = auth()->user()->id;

        $totalBorrow = Borrow::sum('amount');

        $numberOfBankAccount = BankAccount::count();

        $totalSubscriptionAmountOfThisMonth = Subscription::whereBetween('created_at',
            [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])
            ->sum('amount');

        return response()->json([
            'income_of_this_month' => $incomeOfThisMonth,
            'expense_of_this_month' => $expenseOfThisMonth,
            'total_balance' => $totalBalance,
            'total_lend' => $totalLend,
            'total_borrow' => $totalBorrow,
            'number_of_bank_account' => $numberOfBankAccount,
            'total_subscription_amount_of_this_month' => $totalSubscriptionAmountOfThisMonth,
        ]);
    }
}
