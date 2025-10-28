<?php

if (!function_exists('get_language')) {
    /**
     * Récupère la langue/locale courante du site
     * 
     * @return string
     */
    function get_language() {
        return \App\Models\Setting::get('language', 'fr-FR');
    }
}

if (!function_exists('get_locale_info')) {
    /**
     * Récupère les informations de localisation pour la langue courante
     * 
     * @param string|null $locale
     * @return array
     */
    function get_locale_info($locale = null) {
        if (!$locale) {
            $locale = get_language();
        }
        
        // Mapping des locales vers les informations de formatage
        $localeInfo = [
            'fr-FR' => [
                'locale' => 'fr-FR',
                'language' => 'français',
                'country' => 'France',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => ' ',
                'currency_position' => 'after', // before|after
                'rtl' => false
            ],
            'fr-SN' => [
                'locale' => 'fr-SN',
                'language' => 'français',
                'country' => 'Sénégal',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => ' ',
                'currency_position' => 'after',
                'rtl' => false
            ],
            'fr-CI' => [
                'locale' => 'fr-CI',
                'language' => 'français',
                'country' => 'Côte d\'Ivoire',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => ' ',
                'currency_position' => 'after',
                'rtl' => false
            ],
            'fr-MA' => [
                'locale' => 'fr-MA',
                'language' => 'français',
                'country' => 'Maroc',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => ' ',
                'currency_position' => 'after',
                'rtl' => false
            ],
            'fr-TN' => [
                'locale' => 'fr-TN',
                'language' => 'français',
                'country' => 'Tunisie',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => ' ',
                'currency_position' => 'after',
                'rtl' => false
            ],
            'en-US' => [
                'locale' => 'en-US',
                'language' => 'english',
                'country' => 'United States',
                'date_format' => 'm/d/Y',
                'datetime_format' => 'm/d/Y g:i A',
                'decimal_separator' => '.',
                'thousands_separator' => ',',
                'currency_position' => 'before',
                'rtl' => false
            ],
            'en-GB' => [
                'locale' => 'en-GB',
                'language' => 'english',
                'country' => 'United Kingdom',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => '.',
                'thousands_separator' => ',',
                'currency_position' => 'before',
                'rtl' => false
            ],
            'ar-MA' => [
                'locale' => 'ar-MA',
                'language' => 'العربية',
                'country' => 'المغرب',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => '.',
                'thousands_separator' => ',',
                'currency_position' => 'after',
                'rtl' => true
            ],
            'ar-TN' => [
                'locale' => 'ar-TN',
                'language' => 'العربية',
                'country' => 'تونس',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => '.',
                'thousands_separator' => ',',
                'currency_position' => 'after',
                'rtl' => true
            ],
            'es-ES' => [
                'locale' => 'es-ES',
                'language' => 'español',
                'country' => 'España',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => '.',
                'currency_position' => 'after',
                'rtl' => false
            ],
            'pt-BR' => [
                'locale' => 'pt-BR',
                'language' => 'português',
                'country' => 'Brasil',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => '.',
                'currency_position' => 'before',
                'rtl' => false
            ],
            'de-DE' => [
                'locale' => 'de-DE',
                'language' => 'deutsch',
                'country' => 'Deutschland',
                'date_format' => 'd.m.Y',
                'datetime_format' => 'd.m.Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => '.',
                'currency_position' => 'after',
                'rtl' => false
            ],
            'it-IT' => [
                'locale' => 'it-IT',
                'language' => 'italiano',
                'country' => 'Italia',
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'decimal_separator' => ',',
                'thousands_separator' => '.',
                'currency_position' => 'after',
                'rtl' => false
            ]
        ];
        
        return $localeInfo[$locale] ?? $localeInfo['fr-FR'];
    }
}

if (!function_exists('format_number')) {
    /**
     * Formate un nombre selon la locale courante
     * 
     * @param float $number
     * @param int $decimals
     * @param string|null $locale
     * @return string
     */
    function format_number($number, $decimals = 2, $locale = null) {
        $localeInfo = get_locale_info($locale);
        
        return number_format(
            $number,
            $decimals,
            $localeInfo['decimal_separator'],
            $localeInfo['thousands_separator']
        );
    }
}

if (!function_exists('format_date')) {
    /**
     * Formate une date selon la locale courante
     * 
     * @param string|\DateTime $date
     * @param bool $includeTime
     * @param string|null $locale
     * @return string
     */
    function format_date($date, $includeTime = false, $locale = null) {
        $localeInfo = get_locale_info($locale);
        
        if (is_string($date)) {
            $date = new \DateTime($date);
        }
        
        $format = $includeTime ? $localeInfo['datetime_format'] : $localeInfo['date_format'];
        
        return $date->format($format);
    }
}

if (!function_exists('get_js_locale_config')) {
    /**
     * Récupère la configuration de locale pour JavaScript
     * 
     * @param string|null $locale
     * @return array
     */
    function get_js_locale_config($locale = null) {
        $localeInfo = get_locale_info($locale);
        // Harmoniser avec les réglages d'admin
        $currency = \App\Services\AppSettingsService::getCurrency();
        $currencySymbol = \App\Services\AppSettingsService::getCurrencySymbol();
        
        return [
            'locale' => $localeInfo['locale'],
            'language' => $localeInfo['language'],
            'country' => $localeInfo['country'],
            'rtl' => $localeInfo['rtl'],
            'currency' => $currency,
            'currencySymbol' => $currencySymbol,
            'currencyPosition' => $localeInfo['currency_position'],
            // Expose decimal display preference from settings
            'showDecimals' => \App\Services\AppSettingsService::getShowDecimals(),
            'numberFormat' => [
                'decimal' => $localeInfo['decimal_separator'],
                'thousands' => $localeInfo['thousands_separator']
            ],
            'dateFormat' => [
                'short' => $localeInfo['date_format'],
                'long' => $localeInfo['datetime_format']
            ]
        ];
    }
}
