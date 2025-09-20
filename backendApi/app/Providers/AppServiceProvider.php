<?php

namespace App\Providers;

use App\Models\Option;
use App\Models\User;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\ServiceProvider;
use Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {

        try {
            $allOptions = [];
            $allOptions['options'] = Option::all()->pluck('value', 'key')->toArray();
            config($allOptions);
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }
}
