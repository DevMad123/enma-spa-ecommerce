<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Forcer HTTPS si l'URL de l'app est en HTTPS (utile derrière un proxy comme Render)
        $appUrl = config('app.url');
        if (is_string($appUrl) && parse_url($appUrl, PHP_URL_SCHEME) === 'https') {
            URL::forceScheme('https');
        } elseif (app()->environment('production')) {
            // Garde-fou si APP_ENV=production mais APP_URL mal configurée
            URL::forceScheme('https');
        }
        Schema::defaultStringLength(191);

        // Gate to restrict customization management to admins (role name: 'admin')
        Gate::define('manage-customizations', function ($user) {
            return method_exists($user, 'hasRole') ? $user->hasRole('admin') : false;
        });

        // Global password rules for registration and password updates
        Password::defaults(function () {
            return Password::min(8)
                ->letters()     // at least one letter
                ->mixedCase()   // at least one uppercase and one lowercase letter
                ->numbers();    // at least one digit
        });
    }
}
