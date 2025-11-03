<?php

use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\HasRole;
use App\Http\Middleware\HasAnyRole;
use App\Http\Middleware\UpdateLastLogin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders()
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        // channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust proxies to correctly detect HTTPS and client IP when behind reverse proxies
        if (method_exists($middleware, 'trustProxies')) {
            $middleware->trustProxies(at: \App\Http\Middleware\TrustProxies::class);
        }
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SecureHeaders::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ShareWishlistData::class,
            UpdateLastLogin::class,
        ]);

        $middleware->alias([
            'isAdmin' => IsAdmin::class,
            'hasRole' => HasRole::class,
            'hasAnyRole' => HasAnyRole::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->renderable(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();
