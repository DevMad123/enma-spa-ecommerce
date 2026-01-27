<?php

namespace Tests\Unit\Services;

use App\Services\SettingsConfigurationService;
use Tests\TestCase;

class SettingsConfigurationServiceTest extends TestCase
{
    private SettingsConfigurationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SettingsConfigurationService();
    }

    public function test_get_available_currencies()
    {
        $currencies = $this->service->getAvailableCurrencies();

        $this->assertIsArray($currencies);
        $this->assertArrayHasKey('XOF', $currencies);
        $this->assertArrayHasKey('EUR', $currencies);
        $this->assertArrayHasKey('USD', $currencies);
        $this->assertEquals('Franc CFA (XOF)', $currencies['XOF']);
    }

    public function test_get_currency_symbols()
    {
        $symbols = $this->service->getCurrencySymbols();

        $this->assertIsArray($symbols);
        $this->assertArrayHasKey('XOF', $symbols);
        $this->assertArrayHasKey('EUR', $symbols);
        $this->assertEquals('F CFA', $symbols['XOF']);
        $this->assertEquals('€', $symbols['EUR']);
        $this->assertEquals('$', $symbols['USD']);
    }

    public function test_get_currency_symbol_for_existing_currency()
    {
        $symbol = $this->service->getCurrencySymbol('EUR');
        $this->assertEquals('€', $symbol);
        
        $symbol = $this->service->getCurrencySymbol('XOF');
        $this->assertEquals('F CFA', $symbol);
    }

    public function test_get_currency_symbol_for_unknown_currency()
    {
        $symbol = $this->service->getCurrencySymbol('UNKNOWN');
        $this->assertEquals('UNKNOWN', $symbol);
    }

    public function test_get_available_languages()
    {
        $languages = $this->service->getAvailableLanguages();

        $this->assertIsArray($languages);
        $this->assertArrayHasKey('fr-FR', $languages);
        $this->assertArrayHasKey('en-US', $languages);
        $this->assertArrayHasKey('ar-MA', $languages);
        $this->assertEquals('Français (France)', $languages['fr-FR']);
        $this->assertEquals('العربية (المغرب)', $languages['ar-MA']);
    }

    public function test_get_setting_groups()
    {
        $groups = $this->service->getSettingGroups();

        $this->assertIsArray($groups);
        $this->assertArrayHasKey('general', $groups);
        $this->assertArrayHasKey('appearance', $groups);
        $this->assertArrayHasKey('ecommerce', $groups);
        $this->assertEquals('Général', $groups['general']);
    }

    public function test_get_group_configuration_for_existing_group()
    {
        $config = $this->service->getGroupConfiguration('general');

        $this->assertIsArray($config);
        $this->assertArrayHasKey('label', $config);
        $this->assertArrayHasKey('description', $config);
        $this->assertArrayHasKey('icon', $config);
        $this->assertArrayHasKey('order', $config);
        $this->assertEquals('Paramètres généraux', $config['label']);
        $this->assertEquals(1, $config['order']);
    }

    public function test_get_group_configuration_for_unknown_group()
    {
        $config = $this->service->getGroupConfiguration('unknown');

        $this->assertIsArray($config);
        $this->assertEquals('Unknown', $config['label']);
        $this->assertEquals('Configuration unknown', $config['description']);
        $this->assertEquals('settings', $config['icon']);
        $this->assertEquals(999, $config['order']);
    }

    public function test_validate_currency_configuration_with_valid_currency()
    {
        $result = $this->service->validateCurrencyConfiguration('EUR');

        $this->assertTrue($result['valid']);
        $this->assertEquals('Euro (EUR)', $result['currency_name']);
        $this->assertEquals('€', $result['currency_symbol']);
    }

    public function test_validate_currency_configuration_with_invalid_currency()
    {
        $result = $this->service->validateCurrencyConfiguration('INVALID');

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Code de devise non supporté', $result['error']);
    }

    public function test_validate_language_configuration_with_valid_language()
    {
        $result = $this->service->validateLanguageConfiguration('fr-FR');

        $this->assertTrue($result['valid']);
        $this->assertEquals('Français (France)', $result['language_name']);
        $this->assertFalse($result['is_rtl']);
    }

    public function test_validate_language_configuration_with_rtl_language()
    {
        $result = $this->service->validateLanguageConfiguration('ar-MA');

        $this->assertTrue($result['valid']);
        $this->assertEquals('العربية (المغرب)', $result['language_name']);
        $this->assertTrue($result['is_rtl']);
    }

    public function test_validate_language_configuration_with_invalid_language()
    {
        $result = $this->service->validateLanguageConfiguration('INVALID');

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Code de langue non supporté', $result['error']);
    }

    public function test_get_frontend_configuration()
    {
        $config = $this->service->getFrontendConfiguration();

        $this->assertIsArray($config);
        $this->assertArrayHasKey('currencies', $config);
        $this->assertArrayHasKey('languages', $config);
        $this->assertArrayHasKey('groups', $config);
        $this->assertArrayHasKey('localeConfig', $config);
        
        // Vérifier que les données sont cohérentes
        $this->assertEquals($this->service->getAvailableCurrencies(), $config['currencies']);
        $this->assertEquals($this->service->getAvailableLanguages(), $config['languages']);
        $this->assertEquals($this->service->getSettingGroups(), $config['groups']);
    }

    public function test_all_currency_codes_have_symbols()
    {
        $currencies = $this->service->getAvailableCurrencies();
        $symbols = $this->service->getCurrencySymbols();

        foreach (array_keys($currencies) as $currencyCode) {
            $this->assertArrayHasKey($currencyCode, $symbols, 
                "Symbole manquant pour la devise: $currencyCode");
        }
    }

    public function test_group_configurations_have_consistent_orders()
    {
        $groups = $this->service->getSettingGroups();
        $orders = [];

        foreach (array_keys($groups) as $groupKey) {
            $config = $this->service->getGroupConfiguration($groupKey);
            $orders[] = $config['order'];
        }

        // Vérifier qu'il n'y a pas d'ordres en double (sauf pour les groupes inconnus qui ont 999)
        $uniqueOrders = array_unique(array_filter($orders, fn($order) => $order !== 999));
        $filteredOrders = array_filter($orders, fn($order) => $order !== 999);
        
        $this->assertEquals(count($filteredOrders), count($uniqueOrders), 
            'Il y a des ordres de groupe en double');
    }
}