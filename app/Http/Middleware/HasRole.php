<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Vous devez être connecté pour accéder à cette page.');
        }

        $user = auth()->user();

        if (!$user->hasRole($role)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.'
                ], 403);
            }

            return redirect()->back()->with('error', 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.');
        }

        return $next($request);
    }
}
