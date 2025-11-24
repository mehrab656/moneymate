<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('check:user {email}', function (string $email) {
    $user = \Illuminate\Support\Facades\DB::table('users')
        ->where('email', $email)
        ->select('id', 'email', 'username', 'active')
        ->first();
    if ($user) {
        $this->info('User found: ' . json_encode($user));
    } else {
        $this->warn('No user found for email: ' . $email);
    }
})->purpose('Quickly verify a user exists by email');

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
