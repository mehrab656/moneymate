<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankAccount extends Model {
	use HasFactory, SoftDeletes;

	protected $table = 'bank_accounts';
	protected $primaryKey = 'id';
	protected $guarded = [];


	/**
	 * @return BelongsTo
	 */
	public function user(): BelongsTo {
		return $this->belongsTo( User::class );
	}

	/**
	 * @return BelongsTo
	 */
	public function bankName(): BelongsTo {
		return $this->belongsTo( BankName::class, 'bank_name_id', 'id' );
	}

	/**
	 * Update Account Balance
	 *
	 * @param $accountID
	 * @param $amount
	 *
	 * @return array
	 */
	public function updateBalance( $accountID, $amount ): array {
		$account           = $this->find( $accountID );
		$oldAccountBalance = $account->balance;
		$account->balance  += $amount;
		$isUpdated         = $account->save();

		return [
			'oldBalance' => $oldAccountBalance,
			'newBalance' => $account->balance,
			'status'     => $isUpdated
		];
	}

}
