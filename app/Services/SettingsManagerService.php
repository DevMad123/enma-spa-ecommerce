<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SettingsManagerService
{
    /**
     * Cache des paramètres pour éviter les requêtes répétitives
     */
    private const CACHE_KEY = 'app_settings_all';
    private const CACHE_TTL = 3600; // 1 heure

    /**
     * Met à jour plusieurs paramètres en lot
     */
    public function updateBatch(array $settings): array
    {
        $updatedCount = 0;
        $createdCount = 0;
        $errors = [];

        try {
            foreach ($settings as $settingData) {
                $result = $this->updateSingle(
                    $settingData['key'],
                    $settingData['value']
                );
                
                if ($result['success']) {
                    if ($result['action'] === 'updated') {
                        $updatedCount++;
                    } else {
                        $createdCount++;
                    }
                } else {
                    $errors[] = $result['error'];
                }
            }

            $this->clearCache();

            return [
                'success' => empty($errors),
                'updated_count' => $updatedCount,
                'created_count' => $createdCount,
                'errors' => $errors,
            ];

        } catch (\Exception $e) {
            Log::error('Settings batch update failed', [
                'error' => $e->getMessage(),
                'settings_count' => count($settings),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la mise à jour en lot: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Met à jour un paramètre individuel
     */
    public function updateSingle(string $key, mixed $value): array
    {
        try {
            $setting = Setting::where('key', $key)->first();

            if ($setting) {
                $value = $this->normalizeValue($value, $setting->type);
                $setting->update(['value' => $value]);
                
                // Clear cache
                Cache::forget("setting.{$key}");

                return [
                    'success' => true,
                    'action' => 'updated',
                    'key' => $key,
                ];
            } else {
                // Créer automatiquement le paramètre
                $settingConfig = $this->getSettingConfig($key);
                $value = $this->normalizeValue($value, $settingConfig['type']);

                Setting::create([
                    'key' => $key,
                    'value' => $value,
                    'type' => $settingConfig['type'],
                    'group' => $settingConfig['group'],
                    'label' => $settingConfig['label'],
                    'description' => $settingConfig['description'],
                ]);

                return [
                    'success' => true,
                    'action' => 'created',
                    'key' => $key,
                ];
            }

        } catch (\Exception $e) {
            Log::error('Setting update failed', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => "Erreur pour le paramètre '$key': " . $e->getMessage(),
            ];
        }
    }

    /**
     * Obtient un paramètre avec cache
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return Setting::get($key, $default);
    }

    /**
     * Obtient tous les paramètres groupés
     */
    public function getAllGrouped(): array
    {
        $result = Cache::remember(self::CACHE_KEY . '_grouped', self::CACHE_TTL, function () {
            return Setting::getAllGrouped();
        });
        
        // S'assurer que le résultat est bien un array
        return is_array($result) ? $result : $result->toArray();
    }

    /**
     * Vide le cache des paramètres
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::CACHE_KEY . '_grouped');
    }

    /**
     * Normalise une valeur selon son type
     */
    private function normalizeValue(mixed $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => $value, // Ne pas encoder ici, le mutateur du modèle le fera
            'number' => (string) floatval($value),
            default => (string) $value,
        };
    }

    /**
     * Configuration des nouveaux paramètres
     */
    private function getSettingConfig(string $key): array
    {
        $configs = [
            // Apparence
            'show_popular_products' => [
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Afficher les produits populaires',
                'description' => 'Affiche la section des produits populaires'
            ],
            'show_promotions' => [
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Afficher les promotions',
                'description' => 'Affiche la section des promotions'
            ],
            'show_new_arrivals' => [
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Afficher les nouveautés',
                'description' => 'Affiche la section des nouveaux produits'
            ],
            'show_categories' => [
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Afficher les catégories',
                'description' => 'Affiche la grille des catégories'
            ],
            'hero_banner' => [
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Bannière principale',
                'description' => 'Image de bannière hero'
            ],
            'promo_banner' => [
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Bannière promo',
                'description' => 'Image de bannière promotionnelle'
            ],

            // E-commerce
            'shipping_cost' => [
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Frais de livraison',
                'description' => 'Coût de livraison par défaut'
            ],
            'free_shipping_threshold' => [
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Seuil livraison gratuite',
                'description' => 'Montant minimum pour la livraison gratuite'
            ],
            'tax_rate' => [
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Taux de TVA',
                'description' => 'Pourcentage de TVA appliqué'
            ],
            'allow_guest_checkout' => [
                'type' => 'boolean',
                'group' => 'ecommerce',
                'label' => 'Commande invité',
                'description' => 'Autoriser les commandes sans inscription'
            ],
        ];

        return $configs[$key] ?? [
            'type' => 'string',
            'group' => 'general',
            'label' => ucfirst(str_replace('_', ' ', $key)),
            'description' => 'Paramètre créé automatiquement'
        ];
    }
}