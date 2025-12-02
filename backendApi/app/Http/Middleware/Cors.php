<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Determine allowed origin
        $origin = $request->headers->get('Origin');
        $allowedOrigins = config('cors.allowed_origins', []);

        $response = $request->getMethod() === 'OPTIONS'
            ? response()->noContent(204)
            : $next($request);

        // Apply CORS headers
        $allowOriginHeader = '*';
        $supportsCredentials = (bool) config('cors.supports_credentials', false);

        if ($origin && in_array($origin, $allowedOrigins, true)) {
            $allowOriginHeader = $origin;
        }

        $response->headers->set('Access-Control-Allow-Origin', $allowOriginHeader);
        $response->headers->set('Vary', 'Origin');
        $response->headers->set('Access-Control-Allow-Methods', implode(', ', config('cors.allowed_methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])));
        $requestedHeaders = $request->headers->get('Access-Control-Request-Headers');
        $allowedHeadersConfig = config('cors.allowed_headers', ['Content-Type', 'Authorization', 'X-Requested-With']);
        $allowedHeaders = $requestedHeaders ?: implode(', ', $allowedHeadersConfig);
        $response->headers->set('Access-Control-Allow-Headers', $allowedHeaders);

        if ($supportsCredentials && $allowOriginHeader !== '*') {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }
}
