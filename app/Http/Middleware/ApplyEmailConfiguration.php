<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\EmailConfigurationService;
use Illuminate\Support\Facades\Cache;

class ApplyEmailConfiguration
{
    public function __construct(
        private EmailConfigurationService $emailConfigService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Appliquer la configuration email seulement si nécessaire
        // (pour éviter de le faire à chaque requête)
        $cacheKey = 'email_config_applied';
        
        if (!Cache::has($cacheKey)) {
            $this->emailConfigService->applyEmailConfiguration();
            
            // Cache pour 1 heure
            Cache::put($cacheKey, true, 3600);
        }

        return $next($request);
    }
}