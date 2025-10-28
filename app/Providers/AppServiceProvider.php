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
        if (app()->environment('production')) {
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
