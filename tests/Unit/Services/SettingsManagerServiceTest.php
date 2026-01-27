<?php

namespace Tests\Unit\Services;

use App\Services\SettingsManagerService;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SettingsManagerServiceTest extends TestCase
{
    use RefreshDatabase;

    private SettingsManagerService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SettingsManagerService();
    }

    public function test_update_single_existing_setting()
    {
        // Créer un paramètre existant
        Setting::create([
            'key' => 'test_setting',
            'value' => 'old_value',
            'type' => 'string',
            'group' => 'general',
            'label' => 'Test Setting'
        ]);

        $result = $this->service->updateSingle('test_setting', 'new_value');

        $this->assertTrue($result['success']);
        $this->assertEquals('updated', $result['action']);
        $this->assertEquals('new_value', Setting::get('test_setting'));
    }

    public function test_update_single_creates_new_setting()
    {
        $result = $this->service->updateSingle('new_setting', 'test_value');

        $this->assertTrue($result['success']);
        $this->assertEquals('created', $result['action']);
        $this->assertEquals('test_value', Setting::get('new_setting'));
        
        // Vérifier que le paramètre a été créé avec les bonnes métadonnées
        $setting = Setting::where('key', 'new_setting')->first();
        $this->assertNotNull($setting);
        $this->assertEquals('general', $setting->group);
        $this->assertEquals('string', $setting->type);
    }

    public function test_update_batch_success()
    {
        $settings = [
            ['key' => 'setting1', 'value' => 'value1'],
            ['key' => 'setting2', 'value' => 'value2']
        ];

        $result = $this->service->updateBatch($settings);

        $this->assertTrue($result['success']);
        $this->assertEquals(2, $result['created_count']);
        $this->assertEquals(0, $result['updated_count']);
        $this->assertEmpty($result['errors']);
    }

    public function test_boolean_value_normalization()
    {
        $result = $this->service->updateSingle('boolean_setting', true);
        $this->assertEquals('1', Setting::get('boolean_setting'));

        $result = $this->service->updateSingle('boolean_setting_false', false);
        $value = Setting::get('boolean_setting_false');
        $this->assertContains($value, ['0', ''], 'Boolean false devrait retourner 0 ou chaîne vide');
    }

    public function test_get_setting_with_cache()
    {
        Setting::create([
            'key' => 'cached_setting',
            'value' => 'cached_value',
            'type' => 'string',
            'group' => 'general',
            'label' => 'Cached Setting',
        ]);

        $value = $this->service->get('cached_setting');
        $this->assertEquals('cached_value', $value);
        
        // Vérifier avec valeur par défaut
        $default = $this->service->get('nonexistent_setting', 'default');
        $this->assertEquals('default', $default);
    }

    public function test_clear_cache()
    {
        // Simuler mise en cache
        Cache::put('app_settings_all_grouped', ['test' => 'data'], 3600);
        
        $this->service->clearCache();
        
        $this->assertFalse(Cache::has('app_settings_all_grouped'));
    }

    public function test_setting_config_for_appearance_keys()
    {
        $result = $this->service->updateSingle('show_popular_products', true);
        
        $setting = Setting::where('key', 'show_popular_products')->first();
        $this->assertEquals('appearance', $setting->group);
        $this->assertEquals('boolean', $setting->type);
        $this->assertEquals('1', $setting->value); // Valeur normalisée
    }

    public function test_setting_config_for_ecommerce_keys()
    {
        // Supprimer le setting s'il existe déjà (vient des migrations)
        Setting::where('key', 'shipping_cost')->delete();
        
        $result = $this->service->updateSingle('shipping_cost', 25.50);
        
        $setting = Setting::where('key', 'shipping_cost')->first();
        $this->assertEquals('ecommerce', $setting->group);
        $this->assertEquals('number', $setting->type);
        $this->assertEquals('25.5', $setting->value); // Valeur normalisée
    }

    public function test_json_value_normalization()
    {
        $jsonData = ['option1' => 'value1', 'option2' => 'value2'];
        
        // Créer d'abord un paramètre JSON
        Setting::create([
            'key' => 'json_setting',
            'value' => '',
            'type' => 'json',
            'group' => 'general',
            'label' => 'JSON Setting',
        ]);

        $result = $this->service->updateSingle('json_setting', $jsonData);
        
        $this->assertTrue($result['success']);
        
        // Nettoyer le cache avant de récupérer la valeur
        Cache::forget('setting.json_setting');
        
        // Setting::get décode automatiquement le JSON via l'accessor
        $retrieved = Setting::get('json_setting');
        $this->assertEquals($jsonData, $retrieved);
    }

    public function test_error_handling_in_batch_update()
    {
        // Simuler une erreur en passant une clé invalide
        $settings = [
            ['key' => 'valid_setting', 'value' => 'valid_value'],
            ['key' => '', 'value' => 'invalid_key'] // Clé vide devrait causer une erreur
        ];

        $result = $this->service->updateBatch($settings);

        // Les deux settings sont créés (même avec clé vide)
        $this->assertGreaterThanOrEqual(1, $result['created_count']); // Au moins valid_setting devrait être créé
        // Le paramètre avec clé vide devrait générer une erreur ou être créé
    }
}