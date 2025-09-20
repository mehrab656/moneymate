<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;
    protected $table = 'assets';
    protected $primaryKey = 'id';
    protected $guarded = [];


    public function totalAssetPrice()
    {
        $assets = json_decode($this->assets,true);
        $total = 0;


        foreach ($assets as $asset){
            //need implementation
        }
        return 'total';
    }
}
