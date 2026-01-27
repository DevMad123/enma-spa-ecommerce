<?php

namespace App\Services;

class SettingsConfigurationService
{
    /**
     * Obtient la liste des devises disponibles
     */
    public function getAvailableCurrencies(): array
    {
        return [
            'XOF' => 'Franc CFA (XOF)',
            'EUR' => 'Euro (EUR)',
            'USD' => 'Dollar US (USD)',
            'GBP' => 'Livre Sterling (GBP)',
            'MAD' => 'Dirham Marocain (MAD)',
            'TND' => 'Dinar Tunisien (TND)',
            'NGN' => 'Naira Nigérian (NGN)',
            'GHS' => 'Cedi Ghanéen (GHS)',
            'KES' => 'Shilling Kenyan (KES)',
            'ZAR' => 'Rand Sud-Africain (ZAR)'
        ];
    }

    /**
     * Obtient les symboles de devises
     */
    public function getCurrencySymbols(): array
    {
        return [
            'XOF' => 'F CFA',
            'EUR' => '€',
            'USD' => '$',
            'GBP' => '£',
            'MAD' => 'MAD',
            'TND' => 'TND',
            'NGN' => '₦',
            'GHS' => '₵',
            'KES' => 'KSh',
            'ZAR' => 'R'
        ];
    }

    /**
     * Obtient le symbole d'une devise
     */
    public function getCurrencySymbol(string $currencyCode): string
    {
        $symbols = $this->getCurrencySymbols();
        return $symbols[$currencyCode] ?? $currencyCode;
    }

    /**
     * Obtient la liste des langues/locales disponibles
     */
    public function getAvailableLanguages(): array
    {
        return [
            'fr-FR' => 'Français (France)',
            'fr-SN' => 'Français (Sénégal)',
            'fr-CI' => 'Français (Côte d\'Ivoire)',
            'fr-MA' => 'Français (Maroc)',
            'fr-TN' => 'Français (Tunisie)',
            'en-US' => 'English (United States)',
            'en-GB' => 'English (United Kingdom)',
            'ar-MA' => 'العربية (المغرب)',
            'ar-TN' => 'العربية (تونس)',
            'es-ES' => 'Español (España)',
            'pt-BR' => 'Português (Brasil)',
            'de-DE' => 'Deutsch (Deutschland)',
            'it-IT' => 'Italiano (Italia)'
        ];
    }

    /**
     * Obtient la liste des groupes de paramètres
     */
    public function getSettingGroups(): array
    {
        return [
            'general' => 'Général',
            'appearance' => 'Apparence',
            'ecommerce' => 'E-commerce',
            'social' => 'Réseaux sociaux',
            'seo' => 'Référencement',
            'email' => 'Email',
            'security' => 'Sécurité'
        ];
    }

    /**
     * Obtient la configuration d'un groupe de paramètres
     */
    public function getGroupConfiguration(string $group): array
    {
        $configurations = [
            'general' => [
                'label' => 'Paramètres généraux',
                'description' => 'Configuration de base du site',
                'icon' => 'settings',
                'order' => 1
            ],
            'appearance' => [
                'label' => 'Apparence et thème',
                'description' => 'Personnalisation visuelle du site',
                'icon' => 'palette',
                'order' => 2
            ],
            'ecommerce' => [
                'label' => 'E-commerce',
                'description' => 'Configuration boutique et paiements',
                'icon' => 'shopping-cart',
                'order' => 3
            ],
            'social' => [
                'label' => 'Réseaux sociaux',
                'description' => 'Liens et intégrations sociales',
                'icon' => 'share',
                'order' => 4
            ],
            'seo' => [
                'label' => 'Référencement',
                'description' => 'Optimisation pour les moteurs de recherche',
                'icon' => 'search',
                'order' => 5
            ],
            'email' => [
                'label' => 'Configuration email',
                'description' => 'Paramètres SMTP et notifications',
                'icon' => 'mail',
                'order' => 6
            ],
            'security' => [
                'label' => 'Sécurité',
                'description' => 'Paramètres de sécurité et accès',
                'icon' => 'shield',
                'order' => 7
            ]
        ];

        return $configurations[$group] ?? [
            'label' => ucfirst($group),
            'description' => "Configuration $group",
            'icon' => 'settings',
            'order' => 999
        ];
    }

    /**
     * Valide une configuration de devise
     */
    public function validateCurrencyConfiguration(string $currencyCode): array
    {
        $availableCurrencies = $this->getAvailableCurrencies();
        
        if (!array_key_exists($currencyCode, $availableCurrencies)) {
            return [
                'valid' => false,
                'error' => "Code de devise non supporté: $currencyCode"
            ];
        }

        return [
            'valid' => true,
            'currency_name' => $availableCurrencies[$currencyCode],
            'currency_symbol' => $this->getCurrencySymbol($currencyCode)
        ];
    }

    /**
     * Valide une configuration de langue
     */
    public function validateLanguageConfiguration(string $languageCode): array
    {
        $availableLanguages = $this->getAvailableLanguages();
        
        if (!array_key_exists($languageCode, $availableLanguages)) {
            return [
                'valid' => false,
                'error' => "Code de langue non supporté: $languageCode"
            ];
        }

        return [
            'valid' => true,
            'language_name' => $availableLanguages[$languageCode],
            'is_rtl' => str_starts_with($languageCode, 'ar-')
        ];
    }

    /**
     * Obtient la configuration complète pour le frontend
     */
    public function getFrontendConfiguration(): array
    {
        return [
            'currencies' => $this->getAvailableCurrencies(),
            'languages' => $this->getAvailableLanguages(),
            'groups' => $this->getSettingGroups(),
            'localeConfig' => function_exists('get_js_locale_config') ? get_js_locale_config() : []
        ];
    }
}