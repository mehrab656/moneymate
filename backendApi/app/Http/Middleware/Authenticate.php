<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Route;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            // For API routes, don't redirect to a web login route
            if ($request->is('api/*')) {
                return null;
            }
            // Only redirect if a 'login' route actually exists
            return Route::has('login') ? route('login') : null;
        }
    }
}
