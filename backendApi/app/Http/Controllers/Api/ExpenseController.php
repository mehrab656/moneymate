<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Http\Resources\IncomeResource;
use App\Models\BankAccount;
use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\BudgetExpense;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Option;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Nette\Schema\ValidationException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Throwable;

class ExpenseController extends Controller {
	/**
	 * @param ExpenseResource $request
	 *
	 * @return JsonResponse
	 */
	public function index( Request $request ): JsonResponse {

		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );

		$expenses = Expense::where( 'company_id', Auth::user()->primary_company )
		                   ->whereHas( 'category', function ( $query ) {
			                   $query->where( 'type', 'expense' );
		                   } )->skip( ( $page - 1 ) * $pageSize )
		                   ->take( $pageSize )
		                   ->orderBy( 'date', 'desc' )
		                   ->orderBy( 'id', 'desc' )
		                   ->get();

		$totalCount = Expense::where( 'company_id', Auth::user()->primary_company )
		                     ->whereHas( 'category', function ( $query ) {
			                     $query->where( 'type', 'expense' );
		                     } )->count();

		return response()->json( [
			'data'  => ExpenseResource::collection( $expenses ),
			'total' => $totalCount,
		] );
	}


	/**
	 * @param ExpenseRequest $request
	 *
	 * @return JsonResponse
	 */
	public function add( ExpenseRequest $request ): JsonResponse {

		$expense = $request->validated();

		$category = Category::findOrFail( $request->category_id );

		//check balance amount to make a valid expense
		$bankAccount = BankAccount::find( $request->account_id );

		if ( $bankAccount->balance < $request->amount ) {
			return response()->json( [
				'message'     => 'Error!',
				'description' => 'Insufficient amount to make this expense.',
			], 400 );
		}


		// Check Budget for this expense
		$budgetCategory = BudgetCategory::where( 'category_id', $request->category_id )->first();

		if ( $budgetCategory ) {
			$budget = Budget::find( $budgetCategory->budget_id );
			if ( $budget && $expense['amount'] > $budget->amount ) {
				return response()->json( [
					'message'     => 'Error!',
					'description' => 'There is no sufficient budget for this category',
				] );
			}
		}


		if ( $request->hasFile( 'attachment' ) ) {
			$attachment = $request->file( 'attachment' );
			$filename   = time() . '.' . $attachment->getClientOriginalExtension();
			$attachment->storeAs( 'files', $filename );
			$expense['attachment'] = $filename; // Store only the filename
		}

		try {
			DB::beginTransaction();
			$expenseDate = Carbon::parse( $expense['date'] )->format( 'Y-m-d' );
			$expense     = Expense::create( [
				'user_id'           => $expense['user_id'],
				'company_id'        => Auth::user()->primary_company,
				'account_id'        => $expense['account_id'],
				'amount'            => $expense['amount'],
				'refundable_amount' => $expense['refundable_amount'] ?? 0,
				'category_id'       => $expense['category_id'],
				'description'       => $expense['description'],
				'note'              => $expense['note'],
				'reference'         => array_key_exists( 'reference', $expense ) ? $expense['reference'] : null,
				'date'              => $expenseDate,
				'attachment'        => array_key_exists( 'attachment', $expense ) ? $expense['attachment'] : null
			] );

			// Check if expense category falls within any budget's categories
			$budgets = Budget::where( 'start_date', '<=', Carbon::now() )
			                 ->where( 'company_id', Auth::user()->primary_company )
			                 ->with( 'categories' )
			                 ->get();

			foreach ( $budgets as $budget ) {
				if ( $budget->categories->contains( 'id', $expense['category_id'] ) && $this->isWithinTimeRange( $budget->start_date, $budget->end_date, $expenseDate ) ) {
					// Add entry to the new table
					BudgetExpense::create( [
						'user_id'     => Auth::user()->id,
						'budget_id'   => $budget->id,
						'category_id' => $expense['category_id'],
						'amount'      => $expense['amount'],
					] );

					// Reduce budget amount if the date matches
					if ( Carbon::parse( $expense['created_at'] )->isSameDay( Carbon::now() ) ) {
						$budget->updated_amount -= $expense['amount'];
						$budget->save();
					}
				}
			}

			// Update the balance of the bank account
			$bankAccount->balance -= $request->amount;
			$bankAccount->save();

			storeActivityLog( [
				'object_id'    => $expense['id'],
				'log_type'     => 'create',
				'module'       => 'expense',
				'descriptions' => "",
				'data_records' => array_merge( json_decode( json_encode( $expense ), true ), [ 'account_balance' => $bankAccount->balance ] ),
			] );

			DB::commit();

		} catch ( Throwable $e ) {
			DB::rollBack();

			return response()->json( [
				'message'     => 'Cannot add Expenses.',
				'description' => $e,
			], 400 );
		}

		return response()->json( [
			'message'     => 'Success!',
			'description' => 'Expense added successfully!.',
			'expense'     => $expense,
			'category'    => $category
		] );
	}


	/**
	 * Load all expense categories.
	 *
	 * @return JsonResponse
	 */
	public function categories( Request $request ): JsonResponse {

		$sectorID = abs( $request->sector_id );

		$categories = DB::table( 'categories' )->select( 'categories.*' )
		                ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		                ->where( 'sectors.company_id', '=', Auth::user()->primary_company );

		if ( $sectorID ) {
			$categories = $categories->where( 'sectors.id', '=', $sectorID );
		}


		return response()->json( [ 'categories' => $categories->get() ] );
	}


	/**
	 * @param Expense $expense
	 *
	 * @return Response
	 */
	public function destroy( Expense $expense ): Response {
		$expense->delete();

		/**
		 * Adjust bank account
		 */

		$bankAccount = BankAccount::find( $expense->account_id );
		if ( $expense->amount > 0 ) {
			$bankAccount->balance += $expense->amount;
			$bankAccount->save();
		}


		storeActivityLog( [
			'object_id'    => $expense->id,
			'log_type'     => 'delete',
			'module'       => 'expense',
			'descriptions' => "",
			'data_records' => array_merge( json_decode( json_encode( $expense ), true ), [ 'account_balance' => $bankAccount->balance ] ),
		] );

		return response()->noContent();
	}


	/**
	 * @param UpdateExpenseRequest $request
	 * @param Expense $expense
	 *
	 * @return IncomeResource
	 */

	public function update( UpdateExpenseRequest $request, Expense $expense ): ExpenseResource {
		$data = $request->validated();

		if ( $request->hasFile( 'attachment' ) ) {
			$attachmentFile = $request->file( 'attachment' );

			if ( $attachmentFile instanceof UploadedFile ) {
				// Delete the old attachment file, if it exists
				$this->deleteAttachmentFile( $expense );

				$filename       = time() . '.' . $attachmentFile->getClientOriginalExtension(); // Specify the new filename
				$attachmentPath = $attachmentFile->storeAs( 'files', $filename ); // Upload the file with the new filename

				$data['attachment'] = $filename;
			} else {
				// Handle the case where the attachment field is not a file
				$data['attachment'] = null;
			}
		}

		// Retrieve the original amount from the database
		$originalAmount        = $expense->amount;
		$originalBankAccountNo = $expense->account_id;

		$expense->update( $data ); // Use fill() instead of update()
		$expense->save();


		if ( $expense->account_id != $originalBankAccountNo ) {
			$oldBankAccount = BankAccount::find( $originalBankAccountNo );
			$newBankAccount = BankAccount::find( $expense->account_id );

			$oldBankAccount->balance += $originalAmount;
			$oldBankAccount->save();

			$newBankAccount->balance -= $expense->amount;
			$newBankAccount->save();
			$accountBalance = $newBankAccount->balance;

		} else {

			$bankAccount = BankAccount::find( $expense->account_id );
			if ( $expense->amount > $originalAmount ) {
				$bankAccount->balance -= ( $expense->amount - $originalAmount );
			} else {
				$bankAccount->balance += ( $originalAmount - $expense->amount );
			}
			$bankAccount->save();
			$accountBalance = $bankAccount->balance;
		}
		storeActivityLog( [
			'object_id'    => $expense->id,
			'log_type'     => 'edit',
			'module'       => 'expense',
			'descriptions' => "",
			'data_records' => array_merge( json_decode( json_encode( $expense ), true ), [ 'account_balance' => $accountBalance ] ),
		] );

		// return new ExpenseResource( $expense );
		return new ExpenseResource( $expense );

	}


	/**
	 * @param Expense $expense
	 *
	 * @return ExpenseResource
	 */

	public function show( Expense $expense ): ExpenseResource {
		return new ExpenseResource( $expense );
	}


	public function exportExpenseCsv() {

		$timestamp = now()->format( 'YmdHis' );
		$filename  = "expense_{$timestamp}.csv";

		$headers = [
			'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0'
			,
			'Content-type'        => 'text/csv'
			,
			'Content-Disposition' => "attachment; filename=\"{$filename}\""
			,
			'Expires'             => '0'
			,
			'Pragma'              => 'public'
		];

		$handle = fopen( $filename, 'w' );
		fputcsv( $handle, [
			'ID',
			'User Name',
			'Bank Account Number',
			'Category',
			'Amount',
			'refundable_amount',
			'Description',
			'Date'
		] );


		$expenses = Expense::where( 'company_id', Auth::user()->primary_company )->get();

		foreach ( $expenses as $expense ) {

			fputcsv( $handle, [
				$expense->id,
				$expense->person ? $expense->person->name : '',
				$expense->bankAccount ? $expense->bankAccount->account_number : '',
				$expense->category ? $expense->category->name : '',
				$expense->amount,
				$expense->refundable_amount,
				$expense->description,
				$expense->date
			] );
		}

		fclose( $handle );

		return response()->download( $filename, 'expense-data-' . Carbon::now()->toDateString() . '.csv', $headers );
	}


	/**
	 * Check if a given date is within the specified time range.
	 *
	 * @param string $start_date
	 * @param string $end_date
	 * @param string $date
	 *
	 * @return bool
	 */
	private function isWithinTimeRange( string $start_date, string $end_date, string $date ): bool {
		$startDate   = Carbon::createFromFormat( 'Y-m-d', trim( $start_date ) )->startOfDay();
		$endDate     = Carbon::createFromFormat( 'Y-m-d', trim( $end_date ) )->endOfDay();
		$expenseDate = Carbon::createFromFormat( 'Y-m-d', trim( $date ) )->startOfDay();

		return $expenseDate->between( $startDate, $endDate );
	}


	/**
	 * @return JsonResponse
	 */
	public function getCategoryExpensesGraphForCurrentMonth(): JsonResponse {
		$currentMonth = Carbon::now()->month;

		$expenses = DB::table( 'expenses' )
		              ->join( 'categories', 'expenses.category_id', '=', 'categories.id' )
		              ->join( 'users', 'expenses.user_id', '=', 'users.id' )
		              ->select( 'categories.name', DB::raw( 'SUM(expenses.amount) as total' ) )
		              ->where( 'expenses.company_id', Auth::user()->primary_company )
		              ->whereMonth( 'expenses.date', $currentMonth )
		              ->groupBy( 'categories.name' )
		              ->get();

		$categoryNames = $expenses->pluck( 'name' );
		$expenseTotals = $expenses->pluck( 'total' );

		$graphData = [
			'labels' => $categoryNames,
			'data'   => $expenseTotals,
		];

		return response()->json( $graphData );
	}


	/**
	 * Delete the old attachment file associated with the income.
	 *
	 * @param Expense $expense
	 *
	 * @return void
	 */
	protected function deleteAttachmentFile( Expense $expense ): void {
		if ( ! empty( $expense->attachment ) ) {
			Storage::delete( $expense->attachment );
		}
	}

	public function getReturns( Request $request ): JsonResponse {

		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 10 );

		$expenses = Expense::where( 'refundable_amount', '>', 0 )->skip( ( $page - 1 ) * $pageSize )
		                   ->where( 'company_id', Auth::user()->primary_company )
		                   ->take( $pageSize )
		                   ->orderBy( 'id', 'desc' )
		                   ->get();

		$totalCount = Expense::where( 'refundable_amount', '>', 0 )
		                     ->where( 'expenses.company_id', Auth::user()->primary_company )
		                     ->count();

		return response()->json( [
			'data'  => ExpenseResource::collection( $expenses ),
			'total' => $totalCount,
		] );
	}

	/**
	 * @throws \Throwable
	 */
	public function updateReturn( UpdateExpenseRequest $request, Expense $return ) {
		$data = $request->validated();

		$refundableAmount = $return->refundable_amount; // Actual Return amount
		$refundedAmount   = $return->refunded_amount; // Already refund amount
		$refundAmount     = $data['return_amount']; // just now return amount
		$remainingAmount  = $refundableAmount - $refundedAmount; // just now return amount

		if ( $refundAmount > $remainingAmount ) {
			return response()->json( [
				'message'     => 'Incorrect Return Amount',
				'description' => "Remaining amount is $remainingAmount. Return amount can't be exceeded!",
			], 400 );
		}

		DB::beginTransaction();
		try {
			//first update bank account to adjust the balance from return
			$bankAccount          = BankAccount::find( $return->account_id );
			$bankAccount->balance += $refundAmount;
			$bankAccount->save();
			// now time to update the expense field refunded amount.
			$return->update( [ 'refunded_amount' => $refundedAmount + $refundAmount ] );

			storeActivityLog( [
				'object_id'    => $return->id,
				'log_type'     => 'edit',
				'module'       => 'return',
				'descriptions' => "added returns. Amount: $refundAmount",
				'data_records' => $data,
			] );

			$return->save();
		} catch ( ValidationException $e ) {
			DB::rollBack();

			return redirect()->back()->withErrors( $e->getMessages() )->withInput();
		}

		DB::commit();

		return response()->json( [
			'message'     => 'Success',
			'description' => "New return adjusted successfully!",
			'data'        => $return
		] );
	}

	public function totalExpense(): JsonResponse {
		$totalAccount = Expense::where( 'expenses.company_id', Auth::user()->primary_company )->sum( 'amount' );

		return response()->json( [
			'amount' => $totalAccount
		] );
	}

}
