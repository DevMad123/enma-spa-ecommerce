<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\AppSettingsService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'appSettings' => [
                'app_name' => AppSettingsService::getAppName(),
                'currency' => AppSettingsService::getCurrency(),
                'currency_symbol' => AppSettingsService::getCurrencySymbol(),
                'show_decimals' => AppSettingsService::getShowDecimals(),
                'tax_rate' => \App\Models\TaxRule::getDefault(),
                // 'tax_rate' => AppSettingsService::getTaxRate(),\App\Models\TaxRule::getDefault()
                'shipping_threshold' => AppSettingsService::getShippingThreshold(),
                'free_shipping_threshold' => AppSettingsService::getFreeShippingThreshold(),
                'shipping_cost' => AppSettingsService::getShippingCost(),
                'max_price_default' => AppSettingsService::getMaxPriceDefault(),
                'language' => AppSettingsService::getLanguage(),
                'contact_email' => AppSettingsService::getContactEmail(),
                'admin_email' => AppSettingsService::getAdminEmail(),
                'phone' => AppSettingsService::getPhone(),
            ],
            'wishlistItems' => $user ? $user->wishlistItems()->with(['product.category', 'product.brand'])->get() : [],
            'flash' => [
                'upload_success' => $request->session()->get('upload_success'),
                'upload_error' => $request->session()->get('upload_error'),
                'delete_success' => $request->session()->get('delete_success'),
                'delete_error' => $request->session()->get('delete_error'),
                'success' => $request->session()->get('success') ?? $request->session()->get('flash.success'),
                'error' => $request->session()->get('error') ?? $request->session()->get('flash.error'),
            ],
        ];
    }
}
