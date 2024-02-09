<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankName extends Model
{
    use HasFactory,SoftDeletes;

    protected $primaryKey = 'id';
    protected $table = 'bank_names';
    protected $guarded = [];

	/**
	 * @return BelongsTo
	 */
	public function person(): BelongsTo
	{
		return $this->belongsTo(User::class, 'user_id', 'id');
	}
}

