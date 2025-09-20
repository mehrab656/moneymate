<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SettingsModel extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $guarded = [];
    protected $table = 'settings';
}
