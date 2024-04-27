<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Debt extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = 'debts';
    protected $primaryKey = 'id';
    protected $guarded = [];


    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany
     */
    public function lends(): HasMany
    {
        return $this->hasMany(Lend::class);
    }


    /**
     * @return HasMany
     */
    public function borrows(): HasMany
    {
        return $this->hasMany(Borrow::class);
    }

    /**
     * @return HasMany
     */
    public function repayments(): HasMany
    {
        return $this->hasMany(Repayment::class);
    }


    /**
     * @return HasMany
     */
    public function debtsCollections(): HasMany
    {
        return $this->hasMany(DebtCollection::class);
    }


    /**
     * @return BelongsTo
     */
    public function accounts(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'account_id', 'id');
    }

}
