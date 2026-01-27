<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecurePublicApiMiddleware
{
    /**
     * Liste des IPs autorisées pour certaines API critiques
     */
    private const WHITELISTED_IPS = [
        // Ajoutez ici les IPs de vos services de confiance
    ];

    /**
     * Headers requis pour la sécurité
     */
    private const REQUIRED_HEADERS = [
        'User-Agent',
        'Accept'
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $level = 'standard'): Response
    {
        // Validation des headers basiques
        if (!$this->validateHeaders($request)) {
            Log::warning('Public API access with invalid headers', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->url(),
                'method' => $request->method(),
            ]);

            return response()->json([
                'error' => 'Invalid request headers'
            ], 400);
        }

        // Protection contre les attaques par injection dans les paramètres
        if (!$this->validateInputSecurity($request)) {
            Log::warning('Public API potential injection attempt', [
                'ip' => $request->ip(),
                'url' => $request->url(),
                'suspicious_data' => $this->getSuspiciousData($request),
            ]);

            return response()->json([
                'error' => 'Invalid input data'
            ], 400);
        }

        // Pour les API critiques, vérification IP si configurée
        if ($level === 'strict' && !empty(self::WHITELISTED_IPS)) {
            if (!$this->isIpWhitelisted($request->ip())) {
                Log::warning('Public API access from non-whitelisted IP', [
                    'ip' => $request->ip(),
                    'url' => $request->url(),
                ]);

                return response()->json([
                    'error' => 'Access denied'
                ], 403);
            }
        }

        // Ajout d'headers de sécurité dans la réponse
        $response = $next($request);
        
        return $this->addSecurityHeaders($response);
    }

    /**
     * Valide les headers de la requête
     */
    private function validateHeaders(Request $request): bool
    {
        foreach (self::REQUIRED_HEADERS as $header) {
            if (!$request->hasHeader($header) || empty($request->header($header))) {
                return false;
            }
        }

        // Validation User-Agent spécifique
        $userAgent = $request->userAgent();
        if (strlen($userAgent) < 10 || $this->isSuspiciousUserAgent($userAgent)) {
            return false;
        }

        return true;
    }

    /**
     * Vérifie si le User-Agent est suspect
     */
    private function isSuspiciousUserAgent(string $userAgent): bool
    {
        $suspiciousPatterns = [
            '/bot/i',
            '/crawler/i',
            '/scraper/i',
            '/hack/i',
            '/attack/i',
            '/^.{1,5}$/', // User-Agent trop court
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Valide la sécurité des données d'entrée
     */
    private function validateInputSecurity(Request $request): bool
    {
        $allInput = $request->all();
        
        foreach ($allInput as $key => $value) {
            if (is_string($value) && $this->containsSuspiciousContent($value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Détecte du contenu suspect dans les données
     */
    private function containsSuspiciousContent(string $content): bool
    {
        $suspiciousPatterns = [
            // SQL injection patterns
            '/union\s+select/i',
            '/drop\s+table/i',
            '/delete\s+from/i',
            '/update\s+.*set/i',
            
            // XSS patterns
            '/<script/i',
            '/javascript:/i',
            '/on\w+\s*=/i',
            
            // Command injection
            '/;.*rm\s+/i',
            '/&&.*cat\s+/i',
            '/\|\|.*ls\s+/i',
            
            // Path traversal
            '/\.\.\//i',
            '/\.\.\\\/i',
            
            // PHP code injection
            '/<\?php/i',
            '/eval\s*\(/i',
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Récupère les données suspectes pour logging
     */
    private function getSuspiciousData(Request $request): array
    {
        $suspicious = [];
        $allInput = $request->all();
        
        foreach ($allInput as $key => $value) {
            if (is_string($value) && $this->containsSuspiciousContent($value)) {
                $suspicious[$key] = substr($value, 0, 100); // Limiter pour le log
            }
        }
        
        return $suspicious;
    }

    /**
     * Vérifie si l'IP est dans la liste blanche
     */
    private function isIpWhitelisted(string $ip): bool
    {
        return in_array($ip, self::WHITELISTED_IPS) || 
               $ip === '127.0.0.1' || 
               str_starts_with($ip, '192.168.');
    }

    /**
     * Ajoute les headers de sécurité à la réponse
     */
    private function addSecurityHeaders(Response $response): Response
    {
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Pour les réponses JSON
        if ($response->headers->get('Content-Type') === 'application/json') {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
        }
        
        return $response;
    }
}