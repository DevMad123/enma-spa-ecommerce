<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de rate limiting sécurisé pour les endpoints publics critiques
 * 
 * Protège contre:
 * - Spam de formulaires (contact, newsletter)
 * - Tentatives de bruteforce sur checkout
 * - Déni de service (DoS) léger
 */
class SecureRateLimiter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limiter = 'default'): Response
    {
        $limits = $this->getLimitsConfig();
        $config = $limits[$limiter] ?? $limits['default'];
        
        // Clé unique basée sur IP + User Agent pour plus de sécurité
        $key = $this->generateRateLimitKey($request, $limiter);
        
        // Vérifier la limite
        if (RateLimiter::tooManyAttempts($key, $config['max'])) {
            // Log de sécurité pour les tentatives suspectes
            Log::warning('Rate limit exceeded', [
                'limiter' => $limiter,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'route' => $request->route()?->getName(),
                'attempts' => RateLimiter::attempts($key),
                'user_id' => auth()->id()
            ]);
            
            $remainingSeconds = RateLimiter::availableIn($key);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Trop de tentatives. Veuillez patienter avant de réessayer.',
                    'retry_after' => $remainingSeconds
                ], 429);
            }
            
            return back()->withErrors([
                'rate_limit' => "Trop de tentatives. Veuillez patienter {$remainingSeconds} secondes."
            ]);
        }

        // Enregistrer la tentative
        RateLimiter::hit($key, $config['decay']);
        
        // Log des tentatives fréquentes (monitoring)
        $attempts = RateLimiter::attempts($key);
        if ($attempts >= ($config['max'] * 0.8)) { // À 80% de la limite
            Log::info('High rate limit usage detected', [
                'limiter' => $limiter,
                'ip' => $request->ip(),
                'attempts' => $attempts,
                'max' => $config['max'],
                'route' => $request->route()?->getName()
            ]);
        }
        
        $response = $next($request);
        
        // Ajouter headers informatifs
        $response->headers->set('X-RateLimit-Limit', $config['max']);
        $response->headers->set('X-RateLimit-Remaining', max(0, $config['max'] - $attempts));
        
        return $response;
    }

    /**
     * Configuration des limites par endpoint
     */
    private function getLimitsConfig(): array
    {
        return [
            'default' => [
                'max' => 60,     // 60 requêtes
                'decay' => 60    // par minute
            ],
            'newsletter' => [
                'max' => 5,      // 5 inscriptions
                'decay' => 300   // par 5 minutes (évite spam)
            ],
            'contact' => [
                'max' => 3,      // 3 messages
                'decay' => 900   // par 15 minutes
            ],
            'checkout' => [
                'max' => 10,     // 10 tentatives checkout
                'decay' => 600   // par 10 minutes
            ],
            'payment' => [
                'max' => 20,     // 20 tentatives paiement
                'decay' => 3600  // par heure
            ]
        ];
    }

    /**
     * Génère une clé unique pour le rate limiting
     */
    private function generateRateLimitKey(Request $request, string $limiter): string
    {
        $ip = $request->ip();
        $userAgent = md5($request->userAgent() ?? '');
        $userId = auth()->id() ?? 'guest';
        
        return "rate_limit:{$limiter}:{$ip}:{$userAgent}:{$userId}";
    }
}