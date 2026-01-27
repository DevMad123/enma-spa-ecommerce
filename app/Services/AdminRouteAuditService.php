<?php

namespace App\Services;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

class AdminRouteAuditService
{
    /**
     * Liste des middlewares requis pour les routes admin
     */
    const REQUIRED_ADMIN_MIDDLEWARES = [
        'auth',
        'verified',
        'isAdmin'
    ];

    /**
     * Routes admin qui nécessitent des vérifications spéciales
     */
    const CRITICAL_ADMIN_ROUTES = [
        'admin.settings.*',
        'admin.users.*',
        'admin.products.*',
        'admin.customizations.*',
    ];

    /**
     * Effectue un audit complet des routes admin
     */
    public function auditAdminRoutes(): array
    {
        $results = [
            'total_routes' => 0,
            'secure_routes' => 0,
            'vulnerable_routes' => 0,
            'issues' => [],
            'recommendations' => []
        ];

        $routeCollection = Route::getRoutes();

        foreach ($routeCollection as $route) {
            if ($this->isAdminRoute($route)) {
                $results['total_routes']++;
                
                $audit = $this->auditSingleRoute($route);
                
                if ($audit['is_secure']) {
                    $results['secure_routes']++;
                } else {
                    $results['vulnerable_routes']++;
                    $results['issues'][] = $audit;
                }
            }
        }

        $results['recommendations'] = $this->generateRecommendations($results);
        
        Log::info('Admin routes audit completed', $results);
        
        return $results;
    }

    /**
     * Vérifie si une route est une route admin
     */
    private function isAdminRoute($route): bool
    {
        $name = $route->getName();
        $prefix = $route->getPrefix();
        
        return str_starts_with($name ?? '', 'admin.') || 
               str_starts_with($prefix ?? '', 'admin');
    }

    /**
     * Audit d'une route individuelle
     */
    private function auditSingleRoute($route): array
    {
        $middlewares = $route->middleware();
        $name = $route->getName();
        $uri = $route->uri();
        
        $audit = [
            'route_name' => $name,
            'route_uri' => $uri,
            'middlewares' => $middlewares,
            'is_secure' => true,
            'issues' => [],
            'security_level' => 'high'
        ];

        // Vérification des middlewares requis
        foreach (self::REQUIRED_ADMIN_MIDDLEWARES as $requiredMiddleware) {
            if (!in_array($requiredMiddleware, $middlewares)) {
                $audit['is_secure'] = false;
                $audit['issues'][] = "Missing required middleware: {$requiredMiddleware}";
                $audit['security_level'] = 'critical';
            }
        }

        // Vérification spéciale pour les routes critiques
        foreach (self::CRITICAL_ADMIN_ROUTES as $criticalPattern) {
            if (str_contains($name ?? '', str_replace('*', '', $criticalPattern))) {
                if (!$this->hasCriticalSecurity($middlewares)) {
                    $audit['is_secure'] = false;
                    $audit['issues'][] = "Critical route lacks enhanced security measures";
                    $audit['security_level'] = 'critical';
                }
            }
        }

        // Vérification CSRF pour les routes POST/PUT/DELETE
        $methods = $route->methods();
        if (array_intersect($methods, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            if (!$this->hasCSRFProtection($middlewares)) {
                $audit['is_secure'] = false;
                $audit['issues'][] = "Missing CSRF protection for state-changing operation";
            }
        }

        return $audit;
    }

    /**
     * Vérifie si la route a une sécurité critique
     */
    private function hasCriticalSecurity(array $middlewares): bool
    {
        $requiredCount = 0;
        foreach (self::REQUIRED_ADMIN_MIDDLEWARES as $required) {
            if (in_array($required, $middlewares)) {
                $requiredCount++;
            }
        }
        
        return $requiredCount >= count(self::REQUIRED_ADMIN_MIDDLEWARES);
    }

    /**
     * Vérifie la protection CSRF
     */
    private function hasCSRFProtection(array $middlewares): bool
    {
        return in_array('web', $middlewares) || 
               in_array('csrf', $middlewares) ||
               in_array(\App\Http\Middleware\VerifyCSRFToken::class, $middlewares);
    }

    /**
     * Génère des recommandations basées sur l'audit
     */
    private function generateRecommendations(array $results): array
    {
        $recommendations = [];

        if ($results['vulnerable_routes'] > 0) {
            $recommendations[] = "Immediately secure {$results['vulnerable_routes']} vulnerable admin routes";
        }

        $recommendations[] = "Enable 2FA for admin accounts";
        $recommendations[] = "Implement IP whitelisting for admin access";
        $recommendations[] = "Add session timeout for admin users";
        $recommendations[] = "Log all admin activities for audit trail";

        return $recommendations;
    }

    /**
     * Génère un rapport détaillé de sécurité
     */
    public function generateSecurityReport(): array
    {
        $audit = $this->auditAdminRoutes();
        
        return [
            'timestamp' => now()->toISOString(),
            'security_score' => $this->calculateSecurityScore($audit),
            'audit_results' => $audit,
            'immediate_actions' => $this->getImmediateActions($audit),
            'compliance_status' => $this->getComplianceStatus($audit)
        ];
    }

    /**
     * Calcule un score de sécurité
     */
    private function calculateSecurityScore(array $audit): int
    {
        if ($audit['total_routes'] === 0) {
            return 100;
        }

        $securePercentage = ($audit['secure_routes'] / $audit['total_routes']) * 100;
        
        // Pénalités pour les routes critiques non sécurisées
        $criticalIssues = array_filter($audit['issues'], function($issue) {
            return $issue['security_level'] === 'critical';
        });

        $penalty = count($criticalIssues) * 20;
        
        return max(0, (int)($securePercentage - $penalty));
    }

    /**
     * Actions immédiates requises
     */
    private function getImmediateActions(array $audit): array
    {
        $actions = [];

        foreach ($audit['issues'] as $issue) {
            if ($issue['security_level'] === 'critical') {
                $actions[] = [
                    'priority' => 'HIGH',
                    'route' => $issue['route_name'],
                    'action' => 'Add missing security middlewares: ' . implode(', ', $issue['issues'])
                ];
            }
        }

        return $actions;
    }

    /**
     * Statut de conformité
     */
    private function getComplianceStatus(array $audit): string
    {
        $score = $this->calculateSecurityScore($audit);
        
        if ($score >= 95) return 'EXCELLENT';
        if ($score >= 85) return 'GOOD';
        if ($score >= 70) return 'FAIR';
        if ($score >= 50) return 'POOR';
        
        return 'CRITICAL';
    }
}