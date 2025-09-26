<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Wishlist;
use Symfony\Component\HttpFoundation\Response;

class ShareWishlistData
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Partager les données de wishlist avec toutes les pages Inertia
        Inertia::share([
            'wishlist' => function () {
                if (auth()->check()) {
                    return auth()->user()->wishlistItems()->pluck('product_id')->toArray();
                }
                return [];
            },
            'wishlistCount' => function () {
                if (auth()->check()) {
                    return auth()->user()->wishlistItems()->count();
                }
                return 0;
            }
        ]);

        return $next($request);
    }
}