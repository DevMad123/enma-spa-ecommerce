<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Mettre à jour la dernière connexion uniquement pour les utilisateurs authentifiés
        // et éviter de le faire à chaque requête (seulement au login)
        if (Auth::check() && session('update_last_login', false)) {
            Auth::user()->updateLastLogin();
            session()->forget('update_last_login');
        }

        return $response;
    }
}
