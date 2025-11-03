<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Core security headers
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');
        $response->headers->set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

        // Content Security Policy (prod stricte, dev assouplie pour Vite/HMR)
        $isLocal = app()->environment('local');

        $scriptSrc = ["'self'", 'cdn.jsdelivr.net', 'unpkg.com'];
        if ($isLocal) {
            // Vite dev server peut nécessiter eval/ws et hôte local
            $scriptSrc = array_merge($scriptSrc, ["'unsafe-eval'", 'localhost:*', '127.0.0.1:*']);
        }

        $styleSrc  = ["'self'", "'unsafe-inline'", 'fonts.bunny.net'];
        $fontSrc   = ["'self'", 'fonts.bunny.net', 'data:'];
        $imgSrc    = ["'self'", 'data:', 'blob:', 'https:'];
        $connectSrc = ["'self'"];
        if ($isLocal) {
            $connectSrc = array_merge($connectSrc, ['ws:', 'http://localhost:*', 'http://127.0.0.1:*']);
        }

        $csp = sprintf(
            "default-src 'self'; script-src %s; style-src %s; font-src %s; img-src %s; connect-src %s; object-src 'none'",
            implode(' ', $scriptSrc),
            implode(' ', $styleSrc),
            implode(' ', $fontSrc),
            implode(' ', $imgSrc),
            implode(' ', $connectSrc)
        );
        $response->headers->set('Content-Security-Policy', $csp);

        // HSTS only for HTTPS or production environments
        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
