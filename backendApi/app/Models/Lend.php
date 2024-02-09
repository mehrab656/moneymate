<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lend extends Model
{
    use HasFactory,SoftDeletes;
    protected $table = 'lends';
    protected $primaryKey = 'id';
    protected $guarded = [];

    public function account(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'account_id', 'id');
    }
}
