<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Ensure API requests return JSON on unauthenticated instead of redirecting to a non-existent login route.
     */
    protected function unauthenticated($request, AuthenticationException $exception): JsonResponse|Response
    {
        if ($request->expectsJson() || str_starts_with($request->path(), 'api/')) {
            return response()->json([
                'message' => 'Unauthenticated',
                'description' => 'Please provide a valid Bearer token.'
            ], 401);
        }

        // Fallback for web routes
        return response('', 401);
    }
}
