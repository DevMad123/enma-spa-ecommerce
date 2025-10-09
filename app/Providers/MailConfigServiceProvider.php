<?php

namespace App\Providers;

use App\Services\AppSettingsService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class MailConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configurer les paramètres mail à partir des settings
        try {
            $emailSettings = AppSettingsService::getEmailSettings();
            
            Config::set('mail.from.address', $emailSettings['from_address']);
            Config::set('mail.from.name', $emailSettings['from_name']);
            
            // Optionnel : configurer d'autres paramètres si nécessaire
            // Config::set('mail.reply_to.address', $emailSettings['contact_email']);
            // Config::set('mail.reply_to.name', AppSettingsService::getAppName());
            
        } catch (\Exception $e) {
            // En cas d'erreur (par exemple pendant les migrations), 
            // utiliser les valeurs par défaut du .env
            \Log::info('Could not load email settings from database, using .env defaults: ' . $e->getMessage());
        }
    }
}
