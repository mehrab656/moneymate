<?php

namespace App\Models;

use Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

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

	protected array $incomeFormat = [
		'user_id',
		'account_id',
		'amount',
		'category_id',
		'description',
		'note',
		'reference',
		'date',
		'income_type',
		'checkin_date',
		'checkout_date',
		'attachment'
	];


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

	public function mapCSVWithAirbnb( array $file): array {
		$header = explode( ',', $file[0] );
		//now remove header

		unset($file[0]);

		echo '<pre>';
		print_r($file);
		echo '</pre>';
		exit();

		$incomes = [];

		foreach ( $file as $inc ) {

			$income = explode( ',', $inc );


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
					'type'       => $income[2],
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

		echo '<pre>';
		print_r($incomes);
		echo '</pre>';
		exit();

		return $incomes;

	}
	public function mapCSVWithBooking( array $files ): array {

		$header = explode( ',', $files[0] );
		//now remove header

		unset($files[0]);



		$incomes = [];

		foreach ( $files as $file ) {

			$incomeData = explode( ',', $file );
			$incomeType = strtolower($incomeData[0]);

			if ( $incomeType == 'reservation' ) {
				$incomeCurrency = $incomeData[6];



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
					'type'       => $income[2],
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

		echo '<pre>';
		print_r($incomes);
		echo '</pre>';
		exit();

		return $incomes;

	}



}
