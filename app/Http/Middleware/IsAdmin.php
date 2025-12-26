<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifie si l'utilisateur est authentifié et a le rôle Admin
        if (auth()->check() && auth()->user()->hasRole('Admin')) {
            return $next($request);
        }

        // Pour les requêtes API, retourne JSON
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Accès refusé : Vous devez être administrateur.'
            ], 403);
        }

        // Pour toutes les autres requêtes (web), retourne le composant Error Inertia
        return Inertia::render('Error', ['status' => 403])
            ->toResponse($request)
            ->setStatusCode(403);
    }
}
