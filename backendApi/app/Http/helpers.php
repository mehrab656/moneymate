<?php

use App\Models\DB2\Category;
use App\Models\DB2\Product;
use App\Models\DB6\Shop;
use App\Models\ProductSwitch;
use App\Models\ShwapnoOrderStatus;


if (!function_exists('base_url')) {

    /**
     * @param string $resource
     *
     * @return string
     */

    function base_url(string $resource = ''): string
    {
        return asset($resource);
    }


}


if (!function_exists('get_option')) {
    function get_option($key)
    {
        $system_settings = config('options');
        if ($key && isset($system_settings[$key])) {
            return $system_settings[$key];
        } else {
            return false;
        }
    }
}


