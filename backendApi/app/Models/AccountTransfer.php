<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountTransfer extends Model
{
    use HasFactory,SoftDeletes;

	protected $dates = ['deleted_at'];


    protected $table = 'account_transfers';
    protected $primaryKey = 'id';
    protected $guarded = [];



    /**
     * @return BelongsTo
     */
    public function toAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'to_account_id', 'id');
    }

    /**
     * @return BelongsTo
     */
    public function fromAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'from_account_id', 'id');
    }

}
