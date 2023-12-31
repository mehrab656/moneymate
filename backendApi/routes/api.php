<?php

use App\Http\Controllers\Api\AccountTransferController;
use App\Http\Controllers\Api\ApplicationSettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\BankNameController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FileDownloadController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\LendController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/users/delete/{id}', [UserController::class, 'delete']);
    Route::apiResource('/users', UserController::class);
    Route::get('/get-all-users', [UserController::class,'getUsers']);
    Route::get('/dashboard-data', [DashboardController::class, 'dashboardData']);


    // Category Api
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/category/add', [CategoryController::class, 'create']);
    Route::get('/category/{category}', [CategoryController::class, 'show']);
    Route::put('/category/{category}', [CategoryController::class, 'update']);
    Route::delete('/category/{category}', [CategoryController::class, 'destroy']);

    //Bank name Api


    Route::get('all-bank', [BankNameController::class, 'allBank']);
    Route::apiResource('bank-names', BankNameController::class);


    // Bank Account Api
    Route::get('/bank-account/{bankAccount}', [BankAccountController::class, 'show']);
    Route::post('/bank-account/add', [BankAccountController::class, 'add']);
    Route::get('/bank-accounts', [BankAccountController::class, 'index']);
    Route::get('/all-bank-account', [BankAccountController::class, 'allBankAccount']);
    Route::put('/bank-account/{bankAccount}', [BankAccountController::class, 'update']);
    Route::delete('/bank-account/{id}', [BankAccountController::class, 'destroy']);


    // Wallet Api
    Route::apiResource('wallets', WalletController::class);


    // Income Api
    Route::get('/incomes', [IncomeController::class, 'index']);
    Route::post('/income/add', [IncomeController::class, 'add']);
    Route::get('/income-categories', [IncomeController::class, 'categories']);
    Route::delete('/income/{income}', [IncomeController::class, 'destroy']);
    Route::get('income/{income}', [IncomeController::class, 'show']);
    Route::post('/income/{income}', [IncomeController::class, 'update']);
    Route::get('/export-income-csv', [IncomeController::class, 'exportIncomeCsv']);
    Route::post('/income/upload-attachment', [IncomeController::class, 'uploadAttachment']);


    // File download API

    Route::get('/download-file/{filename}', [FileDownloadController::class, 'downloadFile']);


    // Expense Api
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expense/add', [ExpenseController::class, 'add']);
    Route::get('/expense-categories', [ExpenseController::class, 'categories']);
    Route::delete('/expense/{expense}', [ExpenseController::class, 'destroy']);
    Route::get('expense/{expense}', [ExpenseController::class, 'show']);
    Route::post('/expense/{expense}', [ExpenseController::class, 'update']);
    Route::get('/export-expense-csv', [ExpenseController::class, 'exportExpenseCsv']);
    Route::get('/expenses/graph', [ExpenseController::class, 'getCategoryExpensesGraphForCurrentMonth']);


    // Application Settings Api

    Route::put('/store-application-setting', [ApplicationSettingsController::class, 'storeApplicationSetting']);


    // Budget Api

    Route::get('/budgets/active-budgets', [BudgetController::class, 'getActiveBudgets']);
    Route::apiResource('budgets', BudgetController::class);
    Route::get('/budgets/{id}/categories', [BudgetController::class, 'getBudgetCategories']);
    Route::get('/budget/pie-data', [BudgetController::class, 'getCategoryExpenses']);


    // Report Api

    Route::get('/report/income', [ReportController::class, 'incomeReport']);
    Route::get('/report/expense', [ReportController::class, 'expenseReport']);


    // Debt Api

    Route::post('/debts/store', [DebtController::class, 'store']);
    Route::get('/debts', [DebtController::class, 'index']);
    Route::get('/debts/{debt}', [DebtController::class, 'show']);
    Route::get('/get-debt-history/{debt_id}', [DebtController::class, 'getDebtHistory']);
    Route::delete('/debts/delete/{id}', [DebtController::class, 'destroy']);


    // Borrow Api
    Route::post('/borrows/add', [BorrowController::class, 'addBorrow']);
    Route::put('/borrows/{borrow}', [BorrowController::class, 'updateBorrow']);
    Route::delete('/borrows/{borrow}', [BorrowController::class, 'removeBorrow']);

    // Repayment Api
    Route::post('/repayments/add', [BorrowController::class, 'addRepay']);

    // Lend Api
    Route::post('/lends/add', [LendController::class, 'addLend']);
    Route::post('/lends/collection/add', [LendController::class, 'collectionAdd']);

    // Subscription checking Api

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);


    // Account Transfer Api

    Route::get('/transfer/histories', [AccountTransferController::class, 'index']);
    Route::get('/transfer/current-month', [AccountTransferController::class, 'accountTransferCurrentMonth']);
    Route::post('/bank-accounts/transfer-amount', [AccountTransferController::class, 'transferAmount']);

    Route::get('/get-user-role', [UserController::class, 'getUserRole']);

});


Route::get('/get-application-settings', [ApplicationSettingsController::class, 'getApplicationSettings']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/renew-subscription', [AuthController::class, 'renewSubscription']);
Route::post('/login', [AuthController::class, 'login']);

