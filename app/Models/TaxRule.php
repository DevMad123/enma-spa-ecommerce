<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class TaxRule extends Model
{
    protected $fillable = [
        'country_code',
        'country_name',
        'tax_rate',
        'is_default',
        'delivery_allowed',
        'is_active',
        'delivery_zones',
        'min_order_amount',
        'notes'
    ];

    protected $casts = [
        'tax_rate' => 'decimal:4',
        'min_order_amount' => 'decimal:2',
        'is_default' => 'boolean',
        'delivery_allowed' => 'boolean',
        'is_active' => 'boolean',
        'delivery_zones' => 'array'
    ];

    /**
     * Scope pour récupérer les règles actives
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour récupérer les pays avec livraison autorisée
     */
    public function scopeDeliveryAllowed(Builder $query): Builder
    {
        return $query->where('delivery_allowed', true);
    }

    /**
     * Récupère la règle de TVA pour un pays donné
     */
    public static function getByCountryCode(string $countryCode): ?self
    {
        return Cache::remember(
            "tax_rule_{$countryCode}",
            now()->addHours(24),
            fn() => self::active()
                ->where('country_code', strtoupper($countryCode))
                ->first()
        );
    }

    /**
     * Récupère la règle de TVA par défaut
     */
    public static function getDefault(): ?self
    {
        if (!Schema::hasTable('tax_rules')) {
            return null;
        }
        return Cache::remember(
            'tax_rule_default',
            now()->addHours(24),
            fn() => self::active()
                ->where('is_default', true)
                ->first()
        );
    }

    /**
     * Calcule la TVA pour un montant donné
     */
    public function calculateTax(float $amount): float
    {
        return round($amount * ($this->tax_rate / 100), 2);
    }

    /**
     * Calcule le montant TTC
     */
    public function calculateTotalWithTax(float $amount): float
    {
        return round($amount + $this->calculateTax($amount), 2);
    }

    /**
     * Vérifie si la livraison est possible pour ce montant
     */
    public function isDeliveryPossible(float $orderAmount): bool
    {
        if (!$this->delivery_allowed) {
            return false;
        }

        if ($this->min_order_amount && $orderAmount < $this->min_order_amount) {
            return false;
        }

        return true;
    }

    /**
     * Récupère tous les pays avec livraison autorisée
     */
    public static function getDeliveryCountries(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember(
            'delivery_countries',
            now()->addHours(12),
            fn() => self::active()
                ->deliveryAllowed()
                ->orderBy('country_name')
                ->get(['country_code', 'country_name', 'min_order_amount'])
        );
    }

    /**
     * Vide le cache des règles de TVA
     */
    public static function clearCache(): void
    {
        Cache::forget('tax_rule_default');
        Cache::forget('delivery_countries');
        
        // Supprimer tous les caches par pays
        $countries = self::pluck('country_code');
        foreach ($countries as $code) {
            Cache::forget("tax_rule_{$code}");
        }
    }

    /**
     * Obtenir la liste des pays avec leurs taux de TVA (compatible avec AppSettingsService)
     */
    public static function getCountriesWithTaxRates(): array
    {
        return Cache::remember(
            'countries_with_tax_rates',
            now()->addHours(12),
            function () {
                $countries = [];
                $rules = self::active()->get(['country_code', 'country_name', 'tax_rate']);
                
                foreach ($rules as $rule) {
                    $countries[$rule->country_code] = [
                        'name' => $rule->country_name,
                        'tax_rate' => $rule->tax_rate / 100 // Convertir en décimal pour compatibilité
                    ];
                }
                
                return $countries;
            }
        );
    }

    /**
     * Obtenir le code pays par défaut
     */
    public static function getDefaultCountryCode(): string
    {
        $default = self::getDefault();
        return $default ? $default->country_code : 'CI';
    }

    /**
     * Event listeners pour vider le cache lors des modifications
     */
    protected static function booted(): void
    {
        static::saved(function () {
            self::clearCache();
        });

        static::deleted(function () {
            self::clearCache();
        });
    }

    /**
     * Validation : un seul pays par défaut
     */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (self $taxRule) {
            if ($taxRule->is_default) {
                // Retirer le statut par défaut des autres pays
                self::where('id', '!=', $taxRule->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });
    }
}
