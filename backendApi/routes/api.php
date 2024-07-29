<?php

use App\Http\Controllers\Api\AccountTransferController;
use App\Http\Controllers\Api\ApplicationSettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\BankNameController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FileDownloadController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\InvestmentController;
use App\Http\Controllers\Api\LendController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SectorModelController;
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


Route::middleware( 'auth:sanctum' )->group( function () {
	Route::get( '/user', function ( Request $request ) {
		return $request->user();
	} );

	Route::post( '/logout', [ AuthController::class, 'logout' ] );
	Route::delete( '/users/delete/{id}', [ UserController::class, 'delete' ] );
	Route::apiResource( '/users', UserController::class );
	Route::get( '/get-all-users', [ UserController::class, 'getUsers' ] );
	Route::get( '/dashboard-data', [ DashboardController::class, 'dashboardData' ] );


	// Category Api
	Route::get( '/categories', [ CategoryController::class, 'index' ] );
	Route::post( '/category/add', [ CategoryController::class, 'create' ] );
	Route::get( '/category/{category}', [ CategoryController::class, 'show' ] );
	Route::put( '/category/{category}', [ CategoryController::class, 'update' ] );
	Route::delete( '/category/{category}', [ CategoryController::class, 'destroy' ] );

	//Bank name Api

	Route::get( 'all-bank', [ BankNameController::class, 'allBank' ] );
	Route::apiResource( 'bank-names', BankNameController::class );

	// Bank Account Api
	Route::get( '/bank-account/{bankAccount}', [ BankAccountController::class, 'show' ] );
	Route::post( '/bank-account/add', [ BankAccountController::class, 'add' ] );
	Route::get( '/bank-accounts', [ BankAccountController::class, 'index' ] );
	Route::get( '/all-bank-account', [ BankAccountController::class, 'allBankAccount' ] );
	Route::put( '/bank-account/{bankAccount}', [ BankAccountController::class, 'update' ] );
	Route::delete( '/bank-account/{id}', [ BankAccountController::class, 'destroy' ] );
	Route::get( 'total-bankAccount-balance', [ BankAccountController::class, 'totalBankAccountBalance' ] );
	Route::get( 'total-balance', [ BankAccountController::class, 'totalBalance' ] );

	// Wallet Api
	Route::apiResource( 'wallets', WalletController::class );
	Route::get( 'total-wallet-balance', [ WalletController::class, 'totalWalletBalance' ] );

	// Income Api
	Route::get( '/incomes', [ IncomeController::class, 'index' ] );
	Route::post( '/income/add', [ IncomeController::class, 'add' ] );
	Route::post( '/income/add-csv', [ IncomeController::class, 'addIncomeFromCSV' ] );
	Route::get( '/income-categories', [ IncomeController::class, 'categories' ] );
	Route::delete( '/income/{income}', [ IncomeController::class, 'destroy' ] );
	Route::get( 'income/{income}', [ IncomeController::class, 'show' ] );
	Route::post( '/income/{income}', [ IncomeController::class, 'update' ] );
	Route::get( '/export-income-csv', [ IncomeController::class, 'exportIncomeCsv' ] );
	Route::post( '/income/upload-attachment', [ IncomeController::class, 'uploadAttachment' ] );
	Route::get( '/total-income', [ IncomeController::class, 'totalIncome' ] );

	// File download API

	Route::get( '/download-file/{filename}', [ FileDownloadController::class, 'downloadFile' ] );


	// Expense Api
	Route::get( '/expenses', [ ExpenseController::class, 'index' ] );
	Route::post( '/expense/add', [ ExpenseController::class, 'add' ] );
	Route::get( '/expense-categories', [ ExpenseController::class, 'categories' ] );
	Route::delete( '/expense/{expense}', [ ExpenseController::class, 'destroy' ] );
	Route::get( 'expense/{expense}', [ ExpenseController::class, 'show' ] );
	Route::post( '/expense/{expense}', [ ExpenseController::class, 'update' ] );
	Route::get( '/export-expense-csv', [ ExpenseController::class, 'exportExpenseCsv' ] );
	Route::get( '/expenses/graph', [ ExpenseController::class, 'getCategoryExpensesGraphForCurrentMonth' ] );
	Route::get( '/total-expense', [ ExpenseController::class, 'totalExpense' ] );

	// Returns from market api
	Route::get( 'returns', [ ExpenseController::class, 'getReturns' ] );
	Route::post( '/return/{return}', [ ExpenseController::class, 'updateReturn' ] );

	// Application Settings Api

	Route::put( '/store-application-setting', [ ApplicationSettingsController::class, 'storeApplicationSetting' ] );


	// Budget Api

	Route::apiResource( 'budgets', BudgetController::class );
	Route::get( '/budgets/{id}/categories', [ BudgetController::class, 'getBudgetCategories' ] );
	Route::get( '/budget/pie-data', [ BudgetController::class, 'getCategoryExpenses' ] );


	// Report Api

	Route::get( '/report/income', [ ReportController::class, 'incomeReport' ] );
	Route::get( '/report/expense', [ ReportController::class, 'expenseReport' ] );
	Route::get( '/report/investment', [ ReportController::class, 'investmentReport' ] );
	Route::get( '/report/over-all', [ ReportController::class, 'overall' ] );
	Route::get( '/report/get-monthly-report', [ ReportController::class, 'monthlyReport' ] );

	// calender
	Route::get( '/calender-report', [ ReportController::class, 'calenderReport' ] );



	// Debt Api

	Route::post( '/debts/store', [ DebtController::class, 'store' ] );
	Route::get( '/debts', [ DebtController::class, 'index' ] );
	Route::get( '/debts/{debt}', [ DebtController::class, 'show' ] );
	Route::get( '/get-debt-history/{debt_id}', [ DebtController::class, 'getDebtHistory' ] );
	Route::delete( '/debts/delete/{id}', [ DebtController::class, 'destroy' ] );


	// Borrow Api
	Route::post( '/borrows/add', [ BorrowController::class, 'addBorrow' ] );
	Route::put( '/borrows/{borrow}', [ BorrowController::class, 'updateBorrow' ] );
	Route::delete( '/borrows/{borrow}', [ BorrowController::class, 'removeBorrow' ] );

	// Repayment Api
	Route::post( '/repayments/add', [ BorrowController::class, 'addRepay' ] );

	// Lend Api
	Route::post( '/lends/add', [ LendController::class, 'addLend' ] );
	Route::post( '/lends/collection/add', [ LendController::class, 'collectionAdd' ] );

	// Subscription checking Api

	Route::get( '/subscriptions', [ SubscriptionController::class, 'index' ] );
	// Account Transfer Api

	Route::get( '/transfer/histories', [ AccountTransferController::class, 'index' ] );
	Route::get( '/transfer/current-month', [ AccountTransferController::class, 'accountTransferCurrentMonth' ] );
	Route::post( '/bank-accounts/transfer-amount', [ AccountTransferController::class, 'transferAmount' ] );

	Route::get( '/get-user-role', [ UserController::class, 'getUserRole' ] );

	// Investment Api
	Route::get( '/investments', [ InvestmentController::class, 'index' ] );
	Route::post( '/investment/add', [ InvestmentController::class, 'add' ] );
	Route::delete( '/investment/{investment}', [ InvestmentController::class, 'destroy' ] );
	Route::get( 'investment/{investment}', [ InvestmentController::class, 'show' ] );
	Route::post( '/investment/{investment}', [ InvestmentController::class, 'update' ] );
	Route::get( '/export-investment-csv', [ InvestmentController::class, 'exportInvestmentCsv' ] );
	Route::get( '/investment/graph', [ InvestmentController::class, 'getInvestmentGraph' ] );
	Route::post( '/investments/add-new-plan', [ InvestmentController::class, 'addPlan' ] );

	// Sectors API

	Route::get( '/sectors', [ SectorModelController::class, 'index' ] );
	Route::post( '/sector/add', [ SectorModelController::class, 'add' ] );
	Route::delete( '/sector/{sector}', [ SectorModelController::class, 'delete' ] );
	Route::get( 'sector/{sector}', [ SectorModelController::class, 'show' ] );
	Route::post( 'sector/{sector}', [ SectorModelController::class, 'update' ] );
	Route::get( '/sectorsIncomeExpense/{sector}', [
		SectorModelController::class,
		'getTotalExpenseAndIncomeBySectorID'
	] );
	Route::post( '/change-payment-status/{sector}', [ SectorModelController::class, 'changePaymentStatus' ] );
	Route::post( '/pay-bill/{payment}', [ SectorModelController::class, 'payBills' ] );
	Route::get( '/sectors-list', [ SectorModelController::class, 'sectorList' ] );

	//finance report
	Route::get( '/getFinanceReport', [ FinanceController::class, 'getAccountStatement' ] );

	//send notifications

	//activity logs
	Route::get( '/activity-logs', [ UserController::class, 'getActivityLogs' ] );
	Route::post( '/update-log-status/{uid}', [ UserController::class, 'updateLogStatus' ] );

	//company
	Route::get('companies',[ CompanyController::class,'getCompanyList']);
	Route::get('getCurrentCompany/{id}',[ CompanyController::class,'getCurrentCompany']);
	Route::get('/company/{uid}',[ CompanyController::class,'getCompany']);
	Route::post('/addCompany',[CompanyController::class,'addNewCompany']);
	Route::post('/switch-company/{id}',[CompanyController::class,'switchCompany']);
	Route::post('/company/update/{uid}',[CompanyController::class,'updateCompany']);
	Route::delete( 'company/{uid}', [ CompanyController::class, 'destroy' ] );
	Route::get( 'company-by-user/{uid}', [ CompanyController::class, 'getCompanyByUser' ] );

	//Roles
	Route::get('roles',[ RoleController::class,'getRoleList']);
	Route::get('roles-by-company',[ RoleController::class,'companyRoleList']);
	Route::get('role/{id}',[ RoleController::class,'getRole']);
	Route::post('/role/add/',[RoleController::class,'addRole']);
	Route::post('/role/update/{id}',[RoleController::class,'updateRole']);
	Route::delete( 'role/{id}', [ RoleController::class, 'destroy' ] );
    Route::get('permission',[ RoleController::class,'getPermission']);
    Route::get('company-role-list',[RoleController::class,'getCompanyRoleList']);

} );


Route::get( '/get-application-settings', [ ApplicationSettingsController::class, 'getApplicationSettings' ] );
Route::get( '/get-associative-categories', [ ApplicationSettingsController::class, 'getAssociativeCategories' ] );
Route::post( '/signup', [ AuthController::class, 'signup' ] );
Route::post( '/login', [ AuthController::class, 'login' ] );
Route::get( 'reboot', function () {
	Artisan::call( 'cache:clear' );
	Artisan::call( 'config:clear' );
	Artisan::call( 'route:clear' );
	Artisan::call('view:clear');
	Artisan::call('key:generate');

	dd( "Application Cache was removed" );
} );
Route::get('migrate', function(){
	Artisan::call('migrate');
	dd('New Files has been Migrated');
});
Route::get('upcoming-payments',[ NotificationController::class,'sendUpcomingPaymentsNotification']);























