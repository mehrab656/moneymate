<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use DateTime;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * @property mixed $account_id
 * @property mixed $amount
 * @method static create( array $array )
 */
class Income extends Model {
	use HasFactory, SoftDeletes;

	protected $table = 'incomes';
	protected $primaryKey = 'id';
	protected $guarded = [];


	/**
	 * @return BelongsTo
	 */
	public function person(): BelongsTo {
		return $this->belongsTo( User::class, 'user_id', 'id' );
	}


	/**
	 * @return BelongsTo
	 */
	public function bankAccount(): BelongsTo {
		return $this->belongsTo( BankAccount::class, 'account_id', 'id' );
	}


	/**
	 * @return BelongsTo
	 */
	public function category(): BelongsTo {
		return $this->belongsTo( Category::class, 'category_id', 'id' );
	}

	public function mapCSVWithAirbnb( array $file ): array {
		$this->builtDataFromAirbnbCSV($file);
		unset( $file[0] );

		foreach ( $file as $inc ) {

			$income = explode( ',', $file[2] );

			echo '<pre>';
			print_r($income);
			echo '</pre>';
			exit();
			if ( $income[2] == 'Reservation' ) {

				if ( $income[12] === 'USD' ) {
					$req_url       = 'https://v6.exchangerate-api.com/v6/34613ea34951b619f1ff2fde/latest/USD';
					$response_json = file_get_contents( $req_url );

					$response         = json_decode( $response_json );
					$conversion_rates = $response->conversion_rates;

					$amount = round( $conversion_rates->AED * $income[13], 2 ); //Amount in AED
				} else {
					$amount = $income[13];
				}

				$incomes[] = [
					'user_id'       => Auth::user()->id,
					'type'          => $income[2],
//				'account_id',
					'amount'        => $amount,
//				'category_id'=>$income[],
					'description'   => $income[8],
					'note'          => "Imported From CSV File, income Reference :" . $income[3],
					'reference'     => 'airbnb',
					'date'          => $income[0],
					'income_type'   => 'reservation',
					'checkin_date'  => $income[5],
					'checkout_date' => $income[6],
//				'attachment'=>$income[]
				];
			}

		}

		return $incomes;

	}

	/**
	 * @throws Throwable
	 */
	public function mapCSVWithBooking( array $files, $category ): array {
		unset( $files[0] );

		$sector = DB::table( 'sectors' )->select( '*' )
		            ->join( 'categories', 'categories.sector_id', '=', 'sectors.id' )
		            ->where( 'categories.id', '=', $category->id )
		            ->first();

		foreach ( $files as $file ) {
			$incomeData = explode( ',', $file );
			$incomeType = strtolower( $incomeData[0] );

			if ( $incomeType == 'reservation' ) {
				$incomeCurrency = $incomeData[6];
				$incomeAmount   = $incomeData[12];
				$checkInDate    = date( 'Y-m-d', strtotime( str_replace( "\"", '', $incomeData[2] ) ) );
				$checkOutDate   = date( 'Y-m-d', strtotime( str_replace( "\"", '', $incomeData[3] ) ) );
				$paymentDate    = date( 'Y-m-d', strtotime( str_replace( "\"", '', $incomeData[13] ) ) );

				//@todo FIX me with API Paid ENDPOINTS
				if ( $incomeCurrency === 'USD' ) {
					$req_url          = 'https://v6.exchangerate-api.com/v6/34613ea34951b619f1ff2fde/latest/USD';
					$response_json    = file_get_contents( $req_url );
					$response         = json_decode( $response_json );
					$conversion_rates = $response->conversion_rates;
					$amount           = round( $conversion_rates->AED * $incomeAmount, 2 ); //Amount in AED
				}
				$income = [
					'user_id'       => Auth::user()->id,
					'account_id'    => $sector->payment_account_id,
					'amount'        => $incomeAmount,
					'category_id'   => $category->id,
					'description'   => str_replace( "\"", '', $incomeData[4] ),
					'note'          => sprintf( "This income was imported by CSV where reservation reference id '%s' and payout reference '%s'", $incomeData[1], $incomeData[14] ),
					'reference'     => 'booking',
					'date'          => $paymentDate,
					'income_type'   => $incomeType,
					'checkin_date'  => $checkInDate,
					'checkout_date' => $checkOutDate,
					'attachment'    => '',
				];

				$isAdded = $this->incomeAdd( $income,$category );

				if ( $isAdded['status_code'] != 200 ) {
					return [
						'status_code' => $isAdded['status_code'],
						'message'     => $isAdded['message']
					];
				}
			}

		}

		return [
			'status_code'  => 200,
			'message'      => 'CSV has been successfully imported!',
			'payment_date' => $paymentDate
		];

	}

	/**
	 * @throws Throwable
	 */
	public function incomeAdd( $income,$category ): array {

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

					return [
						'message'     => 'Failed to update Bank Account!',
						'status_code' => 400
					];
				}

				if ( $checkinDate->format( 'Y-m' ) === $checkoutDate->format( 'Y-m' ) ) {
					$description = buildIncomeDescription( $income['description'],
						$total_reservation_days,
						$checkinDate->format( 'Y-m-d' ),
						$checkoutDate->format( 'Y-m-d' ) );
					$income      = Income::create( [
						'user_id'       => $income['user_id'],
						'company_id'       => Auth::user()->primary_company,
						'account_id'    => $income['account_id'],
						'amount'        => $income['amount'],
						'category_id'   => $income['category_id'],
						'description'   => $description,
						'note'          => $income['note'],
						'reference'     => $income['reference'],
						'date'          => $income['date'],
						'income_type'   => $income['income_type'],
						'checkin_date'  => $checkinDate->format( 'Y-m-d' ),
						'checkout_date' => $checkoutDate->format( 'Y-m-d' ),
						'attachment'    => $income['attachment']
					] );
                    unset($income['user_id']);
                    unset($income['company_id']);
                    unset($income['account_id']);
                    unset($income['category_id']);

					storeActivityLog( [
						'object_id'    => $income['id'],
						'log_type'     => 'create',
						'module'       => 'income',
                        'descriptions' => "added new income on ".Auth::user()->current_company->name.".",
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
						'company_id'       => Auth::user()->primary_company,
						'account_id'    => $income['account_id'],
						'amount'        => $first_month_amount,
						'category_id'   => $income['category_id'],
						'description'   => $description_1,
						'note'          => $income['note'],
						'reference'     => $income['reference'],
						'date'          => $end_date,
						'income_type'   => $income['income_type'],
						'checkin_date'  => $checkinDate->format( 'Y-m-d' ),
						'checkout_date' => $second_month_startingDate,
						'attachment'    => $income['attachment']
					] );
                    unset($income_first['user_id']);
                    unset($income_first['company_id']);
                    unset($income_first['account_id']);
                    unset($income_first['category_id']);
					storeActivityLog( [
						'object_id'    => $income_first['id'],
						'log_type'     => 'create',
						'module'       => 'income',
						'descriptions' => "added new income on ".Auth::user()->current_company->name.".",
						'data_records' => array_merge( json_decode( json_encode( $income_first ), true ),['Sector Name'=>$category->sector->name], $account ),
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
							'company_id'       => Auth::user()->primary_company,
							'account_id'    => $income['account_id'],
							'amount'        => $second_month_amount,
							'category_id'   => $income['category_id'],
							'description'   => $description_2,
							'note'          => $income['note'],
							'reference'     => $income['reference'],
							'date'          => $second_month_startingDate,
							'income_type'   => $income['income_type'],
							'checkin_date'  => $second_month_startingDate,
							'checkout_date' => $checkoutDate->format( 'Y-m-d' ),
							'attachment'    => $income['attachment']
						] );
                        unset($income_sec['user_id']);
                        unset($income_sec['company_id']);
                        unset($income_sec['account_id']);
                        unset($income_sec['category_id']);
						storeActivityLog( [
							'object_id'    => $income_sec['id'],
							'log_type'     => 'create',
							'module'       => 'income',
                            'descriptions' => "added new income on ".Auth::user()->current_company->name.".",
                            'data_records' => array_merge( json_decode( json_encode( $income_sec ), true ),['Sector Name'=>$category->sector->name], $account ),
						] );
					}
				}
				DB::commit();

			} catch ( Exception $e ) {
				DB::rollBack();

				return [
					'message'     => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
					'status_code' => 400
				];
			}
		} else {

			try {
				DB::beginTransaction();
				// Update the balance of the bank account

				$account = ( new BankAccount )->updateBalance( $income['account_id'], $income['amount'] );
				if ( ! $account['status'] ) {
					DB::rollBack();

					return [
						'message'     => "Failed to update Bank Account!",
						'status_code' => 400
					];
				}

				$income = Income::create( [
					'user_id'     => Auth::user()->id,
					'company_id'       => Auth::user()->primary_company,
					'account_id'  => $income['account_id'],
					'amount'      => $income['amount'],
					'category_id' => $income['category_id'],
					'description' => $income['description'],
					'note'        => $income['note'],
					'reference'   => $income['reference'],
					'income_type' => $income['income_type'],
					'date'        => $income['date'],
					'attachment'  => $income['attachment']
				] );
				storeActivityLog( [
					'object_id'    => $income['id'],
					'log_type'     => 'create',
					'module'       => 'income',
					'descriptions' => "added new income.",
					'data_records' => array_merge( json_decode( json_encode( $income ), true ), $account ),
				] );

				DB::commit();

			} catch ( Exception $e ) {
				DB::rollBack();

				return [
					'message'     => 'Line Number:' . __LINE__ . ', ' . $e->getMessage(),
					'status_code' => 400
				];
			}
		}

		return [
			'message'     => 'Income Added',
			'status_code' => 200
		];
	}

	public function builtDataFromAirbnbCSV( $file ) {
		$headers = explode(",",$file[0]);
		unset($file[0]);
//		$incomeSet = [];
		foreach ($file as $inc){
			$income = explode(",",$inc);

			foreach ($headers as $key=>$header){
				$data[$header] = $income[$key];
			}
			$incomeSet[] = $data;
		}

		echo '<pre>';
		print_r($incomeSet);
		echo '</pre>';
		exit();
	}


}
