<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectorModel extends Model
{
    use HasFactory;

	protected $table = 'sectors';
	protected $primaryKey = 'id';
	protected $guarded = [];

	public function payments(){
		return $this->hasMany(PaymentModel::class,'sector_id');
	}
}
