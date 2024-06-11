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

		$incomes = Income::where( 'company_id', Auth::user()->primary_company )
		                 ->whereHas( 'category', function ( $query ) {
			                 $query->where( 'type', 'income' );
		                 } )->skip( ( $page - 1 ) * $pageSize )
		                 ->take( $pageSize )
		                 ->orderBy( 'date', 'desc' )
		                 ->get();


		$totalCount = Income::where( 'company_id', Auth::user()->primary_company )
		                    ->whereHas( 'category', function ( $query ) {
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
		$income = $request->validated();

		$accountID   = $income['account_id'];
		$catID       = $income['category_id'];
		$bankAccount = BankAccount::find( $accountID );
		if ( ! $bankAccount ) {
			DB::rollBack();

			return response()->json( [
				'message'     => 'Not Found!',
				'description' => "Bank account was not found!",
			], 400 );
		}
		$category = Category::where( 'id', $catID )->where( 'type', '=', 'income' )->get()->first();
		if ( ! $category ) {
			DB::rollBack();

			return response()->json( [
				'message'     => 'Not Found!',
				'description' => "Category was not Found!",
			], 400 );
		}

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
				$account = ( new BankAccount )->updateBalance( $income['account_id'], $income['amount'] );
				if ( ! $account['status'] ) {
					DB::rollBack();

					return response()->json( [
						'message'     => 'Failed!',
						'description' => "Failed to update Bank Account!",
					], 400 );
				}


				if ( $checkinDate->format( 'Y-m' ) === $checkoutDate->format( 'Y-m' ) ) {
					$description = buildIncomeDescription( $income['description'],
						$total_reservation_days,
						$checkinDate->format( 'Y-m-d' ),
						$checkoutDate->format( 'Y-m-d' ) );

					$income = Income::create( [
						'user_id'       => Auth::user()->id,
						'company_id'    => Auth::user()->primary_company,
						'account_id'    => $accountID,
						'amount'        => $income['amount'],
						'category_id'   => $catID,
						'description'   => $description,
						'note'          => $income['note'],
						'reference'     => $income['reference'],
						'date'          => $incomeDate,
						'income_type'   => $income['income_type'],
						'checkin_date'  => $checkinDate->format( 'Y-m-d' ),
						'checkout_date' => $checkoutDate->format( 'Y-m-d' ),
						'attachment'    => $income['attachment']
					] );

					storeActivityLog( [
						'object_id'    => $income['id'],
						'log_type'     => 'create',
						'module'       => 'income',
						'descriptions' => "added income.",
                        'data_records' => array_merge( json_decode( json_encode( $income ), true ),['Sector Name'=>$category->sector->name], $account ),
					] );
				} else {

					$end_date                  = $checkinDate->format( 'Y-m-t' ); //end date from check in date. Format: "YYYY-mm-dd"
					$first_month_days          = (int) ( ( new DateTime( $end_date ) )->diff( $checkinDate )->format( "%a" ) ) + 1;
					$first_month_amount        = $daily_rent * $first_month_days;
					$second_month_startingDate = $checkoutDate->format( 'Y-m-01' ); //next month starting date;

					$description_1 = sprintf( '%s reservation of %d days from %s to %s',
						$income['description'],
						$first_month_days,
						$checkinDate->format( "y-m-d" ),
						$second_month_startingDate,
					);

					$income_first = Income::create( [
						'user_id'       => Auth::user()->id,
						'company_id'    => Auth::user()->primary_company,
						'account_id'    => $accountID,
						'amount'        => $first_month_amount,
						'category_id'   => $catID,
						'description'   => $description_1,
						'note'          => $income['note'],
						'reference'     => $income['reference'],
						'date'          => $end_date,
						'income_type'   => $income['income_type'],
						'checkin_date'  => $checkinDate->format( 'Y-m-d' ),
						'checkout_date' => $second_month_startingDate,
						'attachment'    => $income['attachment']
					] );
					storeActivityLog( [
						'object_id'    => $income_first['id'],
						'log_type'     => 'create',
						'module'       => 'income',
						'descriptions' => "  added income.",
						'data_records' => array_merge( json_decode( json_encode( $income_first ), true ), $account ),
					] );

					$second_month_startingDate = $checkoutDate->format( 'Y-m-01' ); //next month starting date;

					$second_month_days = $checkoutDate->diff( new DateTime( $second_month_startingDate ) )->format( '%a' );

					if ( $second_month_days > 0 ) {
						$description_2       = sprintf( '%s reservation of %d days from %s to %s',
							$income['description'],
							$second_month_days,
							$second_month_startingDate,
							$checkoutDate->format( 'Y-m-d' ),
						);
						$second_month_amount = $daily_rent * $second_month_days;

						$income_sec = Income::create( [
							'user_id'       => Auth::user()->id,
							'company_id'    => Auth::user()->primary_company,
							'account_id'    => $accountID,
							'amount'        => $second_month_amount,
							'category_id'   => $catID,
							'description'   => $description_2,
							'note'          => $income['note'],
							'reference'     => $income['reference'],
							'date'          => $second_month_startingDate,
							'income_type'   => $income['income_type'],
							'checkin_date'  => $second_month_startingDate,
							'checkout_date' => $checkoutDate->format( 'Y-m-d' ),
							'attachment'    => $income['attachment']
						] );
						storeActivityLog( [
							'object_id'    => $income_sec['id'],
							'log_type'     => 'create',
							'module'       => 'income',
							'descriptions' => "added new income.",
							'data_records' => array_merge( json_decode( json_encode( $income_sec ), true ), $account ),
						] );
					}
				}
				DB::commit();

			} catch ( Throwable $e ) {
				DB::rollBack();

				return response()->json( [
					'message' => 'Something provided wrong data!',
					'error'   => $e
				] );
			}
		} else {

			try {
				DB::beginTransaction();
				// Update the balance of the bank account

				$account = ( new BankAccount )->updateBalance( $income['account_id'], $income['amount'] );
				if ( ! $account['status'] ) {
					DB::rollBack();

					return response()->json( [
						'message'     => 'Failed!',
						'description' => "Failed to update Bank Account!",
					], 400 );
				}

				$income = Income::create( [
					'user_id'     => Auth::user()->id,
					'company_id'  => Auth::user()->primary_company,
					'account_id'  => $income['account_id'],
					'amount'      => $income['amount'],
					'category_id' => $income['category_id'],
					'description' => $income['description'],
					'note'        => $income['note'],
					'reference'   => $income['reference'],
					'income_type' => $income['income_type'],
					'date'        => $incomeDate,
					'attachment'  => $income['attachment'],


				] );
				storeActivityLog( [
					'object_id'    => $income['id'],
					'log_type'     => 'create',
					'module'       => 'income',
					'descriptions' => "added income.",
					'data_records' => array_merge( json_decode( json_encode( $income ), true ), $account ),
				] );

				DB::commit();

			} catch ( Throwable $e ) {
				DB::rollBack();

				return response()->json( [
					'message'     => 'Cannot add Income.',
					'description' => $e,
				], 400 );
			}
		}

		return response()->json( [
			'income'      => $income,
			'message'     => 'Success!',
			'description' => 'Income has been added.',
		] );
	}


	/**
	 * @param IncomeUpdateRequest $request
	 * @param Income $income
	 *
	 * @return IncomeResource
	 * @throws Exception
	 */

	public function update( IncomeUpdateRequest $request, Income $income ): IncomeResource {
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
			'object_id'    => $income->id,
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

		$categories = DB::table( 'categories' )->select( 'categories.*' )
		                ->join( 'sectors', 'categories.sector_id', '=', 'sectors.id' )
		                ->where( 'sectors.company_id', '=', Auth::user()->primary_company )
		                ->where( 'type', 'income' )->get();

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
			'object_id'    => $income->id,
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

		$incomes = Income::where('company_id',Auth::user()->primary_company)->get();

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
		$totalAccount = Income::where('company_id',Auth::user()->primary_company)->sum( 'amount' );

		return response()->json( [
			'amount' => $totalAccount
		] );
	}

	/**
	 * @param Request $request
	 *
	 * @return JsonResponse
	 * @throws Throwable
	 */
	public function addIncomeFromCSV( Request $request ): JsonResponse {

		$files = $request->file( 'csvFile' );
		if ( ! $files ) {
			return response()->json( [
				'message'     => 'Missing file!',
				'description' => "Please upload a csv file.",
			], 400 );
		}
		$file = $files['file'];

		//Fixme Sometimes it becomes confused and shows a csv file as a text file.
//		if ( $file['file']->extension() !== 'csv' ) {
//			return response()->json( [
//				'message'     => 'Wrong File Extension!',
//				'description' => "Please upload a valid csv file.",
//			], 400 );
//		}


		$channel = $request->channel;
		if ( ! $channel ) {
			return response()->json( [
				'message'     => 'Specify Channel',
				'description' => "Please select Channel.",
			], 400 );
		}

		$fileContents = file( $file->getPathname() );
		if ( $channel === 'airbnb' ) {
			return response()->json( [
				'message'     => "Under Maintenance",
				'description' => "This channel is under maintenance.",
			], 400 );
//			$incomes = ( new Income() )->mapCSVWithAirbnb( $fileContents );
		}
		$status = [];
		if ( $channel === 'booking' ) {
			$category_id = $request->category_id;
			if ( ! $category_id ) {
				return response()->json( [
					'message'     => 'Missing Sector',
					'description' => "Please select Income Sector.",
				], 400 );
			}

            $category = Category::where( 'id', $category_id )->where( 'type', '=', 'income' )->get()->first();
            if ( ! $category ) {
                DB::rollBack();

                return response()->json( [
                    'message'     => 'Not Found!',
                    'description' => "Category was not Found!",
                ], 400 );
            }

			$status = ( new Income() )->mapCSVWithBooking( $fileContents, $category );
		}
		if ( $status['status_code'] != 200 ) {
			return response()->json( [
				'success' => $status['status_code'],
				'message' => $status['message'],
			], $status['status_code'] );
		}

		$filename = date( "F j, Y", strtotime( $status['payment_date'] ) ) . ' ' . $channel . '.' . 'csv';

		$file->storeAs( 'files', $filename );


		return response()->json( [
			'message'     => "Imported!",
			'description' => "CSV has been Imported Successfully",
		] );
	}
}
