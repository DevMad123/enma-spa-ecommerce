<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HasAnyRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Vous devez être connecté pour accéder à cette page.');
        }

        $user = auth()->user();
        $hasAnyRole = false;

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                $hasAnyRole = true;
                break;
            }
        }

        if (!$hasAnyRole) {
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
