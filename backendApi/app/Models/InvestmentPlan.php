<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestmentPlan extends Model
{
    use HasFactory;

    protected $table = 'investment_plans';
    protected $primaryKey = 'id';
    protected $guarded = [];
    protected $casts = [
        'purposes' => 'array',
        'date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
