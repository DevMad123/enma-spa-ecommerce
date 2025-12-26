<?php

use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\HasRole;
use App\Http\Middleware\HasAnyRole;
use App\Http\Middleware\UpdateLastLogin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Inertia\Inertia;

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
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->web(append: [
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
        // Gestion des erreurs HTTP pour Inertia (404, 403, 500, etc.)
        $exceptions->respond(function ($response, $exception, $request) {
            // Pour les requêtes API, retourner du JSON
            if ($request->is('api/*')) {
                return $response;
            }

            // Pour les requêtes web, retourner le composant Inertia Error
            $status = $response->getStatusCode();
            
            // Erreurs HTTP à gérer avec Inertia (404, 403, 500, 503, etc.)
            if (in_array($status, [403, 404, 419, 429, 500, 503])) {
                return Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });

        // Gestion spécifique pour AuthenticationException
        $exceptions->renderable(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();
