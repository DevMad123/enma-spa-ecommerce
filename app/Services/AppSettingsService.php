<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class AppSettingsService
{
    /**
     * Obtenir tous les paramètres de l'application
     */
    public static function all()
    {
        return Cache::remember('app_settings_all', 3600, function () {
            return Setting::all()->pluck('value', 'key')->toArray();
        });
    }

    /**
     * Obtenir un paramètre spécifique
     */
    public static function get($key, $default = null)
    {
        return Setting::get($key, $default);
    }

    /**
     * Paramètres de l'application
     */
    public static function getAppName()
    {
        return self::get('site_name', 'ENMA Store');
    }

    public static function getAppDescription()
    {
        return self::get('site_description', 'Site e-commerce moderne et performant');
    }

    public static function getContactEmail()
    {
        return self::get('contact_email', 'contact@enmaspa.com');
    }

    public static function getSiteEmail()
    {
        return self::get('site_email', 'contact@enma-ecommerce.com');
    }

    public static function getAdminEmail()
    {
        return self::get('admin_email', self::getContactEmail());
    }

    public static function getPhone()
    {
        return self::get('phone', '+33 1 23 45 67 89');
    }

    public static function getAddress()
    {
        return self::get('address', '123 Rue de la République, 75001 Cocody, Côte d\'Ivoire');
    }

    /**
     * Paramètres de notification et email
     */
    public static function getMailFromAddress()
    {
        return self::get('mail_from_address', self::getSiteEmail());
    }

    public static function getMailFromName()
    {
        return self::get('mail_from_name', self::getAppName());
    }

    public static function getNoReplyEmail()
    {
        return self::get('noreply_email', 'noreply@' . self::getEmailDomain());
    }

    /**
     * Paramètres de devise
     */
    public static function getCurrency()
    {
        return self::get('currency', 'XOF');
    }

    public static function getCurrencySymbol()
    {
        return self::get('currency_symbol', 'F CFA');
    }

    /**
     * Paramètres de prix et d'affichage
     */
    public static function getShowDecimals()
    {
        return self::get('show_decimals', 'false') === 'true';
    }

    /**
     * @deprecated Utiliser TaxRule::getDefault()->tax_rate à la place
     */
    public static function getTaxRate()
    {
        $defaultRule = \App\Models\TaxRule::getDefault();
        error_log($defaultRule);
        return $defaultRule ? ($defaultRule->tax_rate / 100) : 0.00; // Conversion en décimal pour compatibilité
    }

    public static function getShippingThreshold()
    {
        return floatval(self::get('shipping_threshold', '50000'));
    }

    public static function getShippingCost()
    {
        return floatval(self::get('shipping_cost', '3000'));
    }

    public static function getFreeShippingThreshold()
    {
        return floatval(self::get('free_shipping_threshold', '75000'));
    }

    public static function getMaxPriceDefault()
    {
        return floatval(self::get('max_price_default', '500000'));
    }

    // ================================
    // NOUVEAUX METHODS PAYS & TVA
    // ================================

    /**
     * Obtenir le pays par défaut
     */
    public static function getDefaultCountry()
    {
        return self::get('default_country', 'Côte D\'Ivoire');
    }

    /**
     * Obtenir le code pays par défaut
     * Utilise d'abord les TaxRules, sinon fallback sur les settings
     */
    public static function getDefaultCountryCode()
    {
        $defaultFromTaxRule = \App\Models\TaxRule::getDefaultCountryCode();
        return $defaultFromTaxRule ?: self::get('default_country_code', 'CI');
    }

    /**
     * Obtenir la liste des pays de livraison autorisés
     */
    public static function getAllowedShippingCountries()
    {
        $countries = self::get('allowed_shipping_countries', 'CI,FR,BE,CH,LU');
        return array_filter(explode(',', $countries));
    }

    /**
     * Vérifier si la livraison internationale est activée
     */
    public static function isInternationalShippingEnabled()
    {
        return self::get('international_shipping_enabled', 'true') === 'true';
    }

    /**
     * @deprecated Utiliser TaxRule::getByCountryCode() ou TaxRule::calculateTax() à la place
     */
    public static function calculateTax($amount, $countryCode = null)
    {
        $countryCode = $countryCode ?? self::getDefaultCountryCode();
        
        // Utiliser les TaxRules
        $taxRule = \App\Models\TaxRule::getByCountryCode($countryCode) ?? \App\Models\TaxRule::getDefault();
        
        return $taxRule ? $taxRule->calculateTax($amount) : 0;
    }

    /**
     * @deprecated Utiliser TaxRule::getByCountryCode()->tax_rate à la place
     */
    public static function getTaxRateByCountry($countryCode)
    {
        $taxRule = \App\Models\TaxRule::getByCountryCode($countryCode) ?? \App\Models\TaxRule::getDefault();
        
        return $taxRule ? ($taxRule->tax_rate / 100) : 0; // Conversion en décimal pour compatibilité
    }

    /**
     * Vérifier si un pays est autorisé pour la livraison
     */
    public static function isCountryAllowedForShipping($countryCode)
    {
        if (!self::isInternationalShippingEnabled() && $countryCode !== self::getDefaultCountryCode()) {
            return false;
        }
        
        $allowedCountries = self::getAllowedShippingCountries();
        return in_array($countryCode, $allowedCountries);
    }

    /**
     * @deprecated Utiliser TaxRule::getCountriesWithTaxRates() à la place
     */
    public static function getCountriesWithTaxRates()
    {
        return \App\Models\TaxRule::getCountriesWithTaxRates();
    }

    /**
     * Paramètres de design
     */
    public static function getPrimaryColor()
    {
        return self::get('primary_color', '#007bff');
    }

    public static function getSecondaryColor()
    {
        return self::get('secondary_color', '#6c757d');
    }

    public static function getLogo()
    {
        return self::get('logo', '');
    }

    /**
     * Paramètres de localisation
     */
    public static function getLanguage()
    {
        return self::get('language', 'fr-CI');
    }

    public static function getLocale()
    {
        return self::get('locale', 'fr-FR');
    }

    /**
     * Utilitaires
     */
    private static function getEmailDomain()
    {
        $email = self::getSiteEmail();
        $parts = explode('@', $email);
        return count($parts) > 1 ? $parts[1] : 'enmaspa.com';
    }

    /**
     * Ajouter ou mettre à jour un paramètre
     */
    public static function set($key, $value, $type = 'string', $group = 'general', $label = null)
    {
        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group,
                'label' => $label ?: ucfirst(str_replace('_', ' ', $key)),
            ]
        );

        // Vider le cache
        Cache::forget('app_settings_all');
        Cache::forget("setting.{$key}");

        return $setting;
    }

    /**
     * Paramètres pour les emails (remplace les variables .env)
     */
    public static function getEmailSettings()
    {
        return [
            'from_address' => self::getMailFromAddress(),
            'from_name' => self::getMailFromName(),
            'noreply_address' => self::getNoReplyEmail(),
            'admin_email' => self::getAdminEmail(),
            'contact_email' => self::getContactEmail(),
        ];
    }

    /**
     * Paramètres pour les notifications
     */
    public static function getNotificationSettings()
    {
        return [
            'app_name' => self::getAppName(),
            'contact_email' => self::getContactEmail(),
            'phone' => self::getPhone(),
            'address' => self::getAddress(),
            'currency_symbol' => self::getCurrencySymbol(),
            'primary_color' => self::getPrimaryColor(),
        ];
    }

    /**
     * Vider tout le cache des paramètres
     */
    public static function clearCache()
    {
        Cache::forget('app_settings_all');
        // Vider aussi les caches individuels
        $settings = Setting::all();
        foreach ($settings as $setting) {
            Cache::forget("setting.{$setting->key}");
        }
    }
}