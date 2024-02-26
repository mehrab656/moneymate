<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IncomeRequest;
use App\Http\Requests\IncomeUpdateRequest;
use App\Http\Resources\IncomeResource;
use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Income;
use Carbon\Carbon;
use DateTime;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class IncomeController extends Controller {

	/**
	 * @param IncomeRequest $request
	 *
	 * @return JsonResponse
	 */

	public function index( Request $request ): JsonResponse {
		$page     = $request->query( 'page', 1 );
		$pageSize = $request->query( 'pageSize', 1000 );

		$incomes = Income::whereHas( 'category', function ( $query ) {
			$query->where( 'type', 'income' );
		} )->skip( ( $page - 1 ) * $pageSize )
		                 ->take( $pageSize )
		                 ->orderBy( 'date', 'desc' )
		                 ->get();


		$totalCount = Income::whereHas( 'category', function ( $query ) {
			$query->where( 'type', 'income' );
		} )->count();

		return response()->json( [
			'data'  => IncomeResource::collection( $incomes ),
			'total' => $totalCount,
		] );
	}


	/**
	 * @param IncomeRequest $request
	 *
	 * @return JsonResponse
	 * @throws Exception
	 * @throws Throwable
	 */
	public function add( IncomeRequest $request ): JsonResponse {
		$income   = $request->validated();
		$category = Category::findOrFail( $request->category_id );

		// Handle file upload

		if ( $request->hasFile( 'attachment' ) ) {
			$attachment = $request->file( 'attachment' );
			$filename   = time() . '.' . $attachment->getClientOriginalExtension();
			$attachment->storeAs( 'files', $filename );
			$income['attachment'] = $filename; // Store only the filename
		}

		$incomeDate = Carbon::parse( $income['date'] )->format( 'Y-m-d' );

		if ( $income['income_type'] === 'reservation' ) {
			$checkinDate  = new DateTime( $income['checkin_date'] );
			$checkoutDate = new DateTime( $income['checkout_date'] );

			$total_reservation_days = $checkoutDate->diff( $checkinDate )->format( "%a" );

			$daily_rent = $income['amount'] / $total_reservation_days;

			try {
				DB::beginTransaction();
				// Update the balance of the bank account
				$bankAccount          = BankAccount::find( $request->account_id );
				$bankAccount->balance += $request->amount;
				$bankAccount->save();

				if ( $checkinDate->format( 'Y-m' ) === $checkoutDate->format( 'Y-m' ) ) {

					$description = sprintf( '%s reservation of %d days from %s to %s',
						$income['description'],
						$total_reservation_days,
						$checkinDate->format( 'Y-m-d' ),
						$checkoutDate->format( 'Y-m-d' ),
					);

					$income = Income::create( [
						'user_id'       => Auth::user()->id,
						'account_id'    => $income['account_id'],
						'amount'        => $daily_rent * $total_reservation_days,
						'category_id'   => $income['category_id'],
						'description'   => $description,
						'note'          => $income['note'],
						'reference'     => $income['reference'],
						'date'          => $incomeDate,
						'checkin_date'  => $checkinDate->format( 'Y-m-d' ),
						'checkout_date' => $checkoutDate->format( 'Y-m-d' ),
						'attachment'    => $income['attachment']
					] );
					storeActivityLog( [
						'user_id'      => Auth::user()->id,
						'log_type'     => 'create',
						'module'       => 'income',
						'descriptions' => "  added income.",
						'data_records' => array_merge( json_decode( json_encode( [] ), true ), [ 'account_balance' => $bankAccount->balance ] ),
					] );
				} else {
					$end_date = $checkinDate->format( 'Y-m-t' ); //end date from check in date.

					$first_month_days = (int) ( ( new DateTime( $end_date ) )->diff( $checkinDate )->format( "%a" ) ) + 1;
					$start_date       = $checkoutDate->format( 'Y-m-01' ); //next month starting date;

					$second_month_days  = $checkoutDate->diff( new DateTime( $start_date ) )->format( '%a' );
					$first_month_amount = $daily_rent * $first_month_days;
					$description_1      = sprintf( '%s reservation of %d days from %s to %s',
						$income['description'],
						$first_month_days,
						$checkinDate->format( 'Y-m-d' ),
						$start_date,
					);
					$income_first       = Income::create( [
						'user_id'       => Auth::user()->id,
						'account_id'    => $income['account_id'],
						'amount'        => $first_month_amount,
						'category_id'   => $income['category_id'],
						'description'   => $description_1,
						'note'          => $income['note'],
						'reference'     => $income['reference'],
						'date'          => $end_date,
						'checkin_date'  => $checkinDate->format( 'Y-m-d' ),
						'checkout_date' => $start_date,
						'attachment'    => $income['attachment']
					] );

					storeActivityLog( [
						'user_id'      => Auth::user()->id,
						'log_type'     => 'create',
						'module'       => 'income',
						'descriptions' => "  added income.",
						'data_records' => array_merge( json_decode( json_encode( $income_first ), true ), [ 'account_balance' => $bankAccount->balance ] ),
					] );

					if ( $second_month_days > 0 ) {
						$description_2       = sprintf( '%s reservation of %d days from %s to %s',
							$income['description'],
							$second_month_days,
							$start_date,
							$checkoutDate->format( 'Y-m-d' ),
						);
						$second_month_amount = $daily_rent * $second_month_days;

						$income_sec = Income::create( [
							'user_id'       => Auth::user()->id,
							'account_id'    => $income['account_id'],
							'amount'        => $second_month_amount,
							'category_id'   => $income['category_id'],
							'description'   => $description_2,
							'note'          => $income['note'],
							'reference'     => $income['reference'],
							'date'          => $start_date,
							'checkin_date'  => $start_date,
							'checkout_date' => $checkoutDate->format( 'Y-m-d' ),
							'attachment'    => $income['attachment']
						] );
						storeActivityLog( [
							'user_id'      => Auth::user()->id,
							'log_type'     => 'create',
							'module'       => 'income',
							'descriptions' => "added new income.",
							'data_records' => array_merge( json_decode( json_encode( $income_sec ), true ), [ 'account_balance' => $bankAccount->balance ] ),
						] );
					}
				}
				DB::commit();
			} catch ( Throwable $e ) {
				DB::rollBack();

				return response()->json( [
					'message' => 'Cannot add Income.',
					'error'   => $e
				] );
			}

			return response()->json( [
				'income'   => $income,
				'category' => $category,
			] );
		} else {

			try {
				DB::beginTransaction();
				// Update the balance of the bank account
				$bankAccount          = BankAccount::find( $request->account_id );
				$bankAccount->balance += $request->amount;
				$bankAccount->save();

				$income = Income::create( [
					'user_id'     => Auth::user()->id,
					'account_id'  => $income['account_id'],
					'amount'      => $income['amount'],
					'category_id' => $income['category_id'],
					'description' => $income['description'],
					'note'        => $income['note'],
					'reference'   => $income['reference'],
					'income_type' => $income['income_type'],
					'date'        => $incomeDate,
					'attachment'  => $income['attachment']
				] );
				storeActivityLog( [
					'user_id'      => Auth::user()->id,
					'log_type'     => 'create',
					'module'       => 'income',
					'descriptions' => "added income.",
					'data_records' => array_merge( json_decode( json_encode( [] ), true ), [ 'account_balance' => $bankAccount->balance ] ),
				] );

				DB::commit();

			} catch ( Throwable $e ) {
				DB::rollBack();

				return response()->json( [
					'message' => 'Cannot add Income.',
				] );
			}

			return response()->json( [
				'income'   => $income,
				'category' => $category,
			] );

		}


	}


	/**
	 * @param IncomeUpdateRequest $request
	 * @param Income $income
	 *
	 * @return IncomeResource
	 * @throws Exception
	 */

	public function update( IncomeUpdateRequest $request, Income $income ) {
		$data = $request->validated();


		if ( $request->hasFile( 'attachment' ) ) {
			$attachmentFile = $request->file( 'attachment' );
			$this->deleteAttachmentFile( $income );

			$filename = time() . '.' . $attachmentFile->getClientOriginalExtension(); // Specify the new filename
			$attachmentFile->storeAs( 'files', $filename ); // Upload the file with the new filename
			$data['attachment'] = $filename;
		}

		// Retrieve the original amount from the database
		$originalAmount        = $income->amount; //100
		$originalBankAccountNo = $income->account_id;

		$income->fill( $data );
		$income->save();

		if ( $income->account_id != $originalBankAccountNo ) {
			$oldBankAccount = BankAccount::find( $originalBankAccountNo );
			$newBankAccount = BankAccount::find( $income->account_id );

			$oldBankAccount->balance -= $originalAmount;
			$oldBankAccount->save();

			$newBankAccount->balance += $income->amount;
			$newBankAccount->save();
			$accountBalance = $newBankAccount->balance;

		} else {
			$bankAccount          = BankAccount::find( $income->account_id );
			$bankAccount->balance += ( $income->amount - $originalAmount );
			$bankAccount->save();
			$accountBalance = $bankAccount->balance;
		}

		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'edit',
			'module'       => 'income',
			'descriptions' => "",
			'data_records' => array_merge( json_decode( json_encode( $income ), true ), [ 'account_balance' => $accountBalance ] ),
		] );

		return new IncomeResource( $income );
	}


	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 */

	public function uploadAttachment( Request $request ): JsonResponse {
		$request->validate( [
			'attachment' => 'required|file',
		] );

		if ( $request->hasFile( 'attachment' ) ) {
			$attachmentFile = $request->file( 'attachment' );

			if ( $attachmentFile->isValid() ) {
				$attachmentPath = $attachmentFile->store( 'files' );

				// You may want to store the attachment path or perform any necessary operations here

				return response()->json( [
					'attachment' => $attachmentPath,
				] );
			}
		}

		return response()->json( [
			'error' => 'Failed to upload attachment.',
		], 400 );
	}

	/**
	 * Delete the old attachment file associated with the income.
	 *
	 * @param Income $income
	 *
	 * @return void
	 */
	protected function deleteAttachmentFile( Income $income ): void {
		if ( ! empty( $income->attachment ) ) {
			Storage::delete( $income->attachment );
		}
	}


	/**
	 * @param Income $income
	 *
	 * @return IncomeResource
	 */

	public function show( Income $income ): IncomeResource {
		return new IncomeResource( $income );
	}


	/**
	 * Load all income categories.
	 *
	 * @return JsonResponse
	 */
	public function categories(): JsonResponse {
		$user       = Auth::user();
		$categories = Category::where( 'type', 'income' )->get();

		return response()->json( [ 'categories' => $categories ] );
	}


	/**
	 * @param Income $income
	 *
	 * @return Response
	 * @throws Exception
	 */
	public function destroy( Income $income ): Response {
		$income->delete();

		/**
		 * Adjust bank account
		 */

		$bankAccount = BankAccount::find( $income->account_id );
		if ( $income->amount > 0 ) {
			$bankAccount->balance -= $income->amount;
			$bankAccount->save();
		}

		storeActivityLog( [
			'user_id'      => Auth::user()->id,
			'log_type'     => 'delete',
			'module'       => 'income',
			'descriptions' => "",
			'data_records' => array_merge( json_decode( json_encode( $income ), true ), [ 'account_balance' => $bankAccount->balance ] ),
		] );

		return response()->noContent();
	}


	public function exportIncomeCsv(): BinaryFileResponse {
		$timestamp = now()->format( 'YmdHis' );
		$filename  = "incomes_$timestamp.csv";

		$headers = [
			'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0'
			,
			'Content-type'        => 'text/csv'
			,
			'Content-Disposition' => "attachment; filename=\"$filename\""
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
			'Description',
			'Date'
		] );

		$incomes = Income::all();

		foreach ( $incomes as $income ) {

			fputcsv( $handle, [
				$income->id,
				$income->person ? $income->person->name : '',
				$income->bankAccount ? $income->bankAccount->account_number : '',
				$income->category ? $income->category->name : '',
				$income->amount,
				$income->description,
				$income->date
			] );
		}

		fclose( $handle );

		return response()->download( $filename, 'income-data-' . Carbon::now()->toDateString() . '.csv', $headers );
	}


	public function totalIncome(): JsonResponse {
		$totalAccount = Income::sum( 'amount' );

		return response()->json( [
			'amount' => $totalAccount
		] );
	}
}
