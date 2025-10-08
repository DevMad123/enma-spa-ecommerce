<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'config',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config' => 'array',
        'sort_order' => 'integer',
    ];

    /**
     * Scope pour récupérer uniquement les méthodes actives
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour trier par ordre de priorité
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Retourne la configuration formatée
     */
    public function getConfigAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    /**
     * Vérifie si la méthode de paiement est configurée
     */
    public function isConfigured(): bool
    {
        return !empty($this->config);
    }

    /**
     * Retourne l'icône de la méthode de paiement
     */
    public function getIcon(): string
    {
        $icons = [
            'paypal' => 'fab fa-paypal',
            'orange_money' => 'fas fa-mobile-alt text-orange-500',
            'mtn_money' => 'fas fa-mobile-alt text-yellow-500',
            'wave' => 'fas fa-mobile-alt text-blue-500',
            'moov_money' => 'fas fa-mobile-alt text-green-500',
            'visa' => 'fab fa-cc-visa',
            'cash_on_delivery' => 'fas fa-hand-holding-usd',
        ];

        return $icons[$this->code] ?? 'fas fa-credit-card';
    }

    /**
     * Retourne les champs de configuration requis selon le type
     */
    public function getRequiredConfigFields(): array
    {
        $fields = [
            'paypal' => ['client_id', 'client_secret', 'mode'],
            'orange_money' => ['merchant_key', 'api_url'],
            'mtn_money' => ['api_key', 'api_secret', 'subscription_key'],
            'wave' => ['api_key', 'secret_key'],
            'moov_money' => ['merchant_id', 'api_key'],
            'visa' => ['merchant_id', 'api_key', 'secret_key'],
            'cash_on_delivery' => [],
        ];

        return $fields[$this->code] ?? [];
    }
}
