<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Investment extends Model
{
	use HasFactory;

	protected $table = 'investments';
	protected $primaryKey = 'id';
	protected $guarded = [];

	/**
	 * @return BelongsTo
	 */
	public function investor(): BelongsTo
	{
		return $this->belongsTo(User::class, 'investor_id', 'id');
	}

	/**
	 * @return BelongsTo
	 */
	public function added(): BelongsTo
	{
		return $this->belongsTo(User::class, 'added_by', 'id');
	}

	/**
	 * @return BelongsTo
	 */
	public function bankAccount(): BelongsTo
	{
		return $this->belongsTo(BankAccount::class, 'account_id', 'id');
	}
}
