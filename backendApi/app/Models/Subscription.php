<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $guarded = [];


    public function getCurrentPeriodStartAttribute()
    {
        return date('Y-m-d', strtotime($this->attributes['current_period_start']));
    }

    public function getCurrentPeriodEndAttribute()
    {
        return date('Y-m-d', strtotime($this->attributes['current_period_end']));
    }

    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
