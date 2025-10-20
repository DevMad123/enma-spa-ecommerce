<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AppSettingsService;
use Symfony\Component\HttpFoundation\Response;

class ShareAppSettings
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Partager les paramètres de l'application avec toutes les pages Inertia
        Inertia::share([
            'appSettings' => function () {
                return [
                    'app_name' => AppSettingsService::getAppName(),
                    'currency' => AppSettingsService::getCurrency(),
                    'currency_symbol' => AppSettingsService::getCurrencySymbol(),
                    'language' => AppSettingsService::getLanguage(),
                    'contact_email' => AppSettingsService::getContactEmail(),
                    'admin_email' => AppSettingsService::getAdminEmail(),
                    'phone' => AppSettingsService::getPhone(),
                    'show_decimals' => AppSettingsService::getShowDecimals(),
                    'tax_rate' => AppSettingsService::getTaxRate(),
                    'free_shipping_threshold' => AppSettingsService::getFreeShippingThreshold(),
                    'announcement_text' => AppSettingsService::getAnnouncementText(),
                ];
            }
        ]);

        return $next($request);
    }
}
