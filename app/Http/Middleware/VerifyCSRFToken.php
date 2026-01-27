<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCSRFToken as Middleware;

class VerifyCSRFToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     */
    protected $except = [
        // Webhooks de paiement (ils ont leur propre sécurité)
        'orange-money/webhook',
        'wave/webhook',
        // API endpoints publics (protégés par rate limiting)
        'api/tax/calculate',
        'api/tax/info/*',
        // Tests endpoints (à supprimer en production)
        'test-*',
        'simulate-*',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle($request, \Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (\Illuminate\Session\TokenMismatchException $e) {
            \Log::warning('CSRF Token Mismatch', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->url(),
                'method' => $request->method(),
                'referer' => $request->header('referer'),
                'timestamp' => now()->toISOString(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Determine if the session and input CSRF tokens match.
     */
    protected function tokensMatch($request)
    {
        $token = $this->getTokenFromRequest($request);

        return is_string($request->session()->token()) &&
               is_string($token) &&
               hash_equals($request->session()->token(), $token);
    }
}