<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifie si l'utilisateur est authentifié et admin
        if (auth()->check() && auth()->user()->is_admin) {
            return $next($request);
        }

        // Sinon, redirige ou abort
        return redirect('/'); // ou ->abort(403, 'Accès refusé');
    }
}
