<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static where(string $string, string $string1)
 */
class Category extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = 'categories';
    protected $primaryKey = 'id';
    protected $guarded = [];
}
