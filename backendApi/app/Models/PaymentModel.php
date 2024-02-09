<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentModel extends Model
{
    use HasFactory,SoftDeletes;

	protected $table = 'payments';
	protected $primaryKey = 'id';
	protected $guarded = [];
}
