<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SectorModel extends Model
{
    use HasFactory,SoftDeletes;

	protected $table = 'sectors';
	protected $primaryKey = 'id';
	protected $guarded = [];

	public function payments(): HasMany {
		return $this->hasMany(PaymentModel::class,'sector_id');
	}
	public function channels(): HasMany {
		return $this->hasMany(Channel::class,'sector_id');
	}
}
