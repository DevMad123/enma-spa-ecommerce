<?php

namespace App\Models;

use App\Services\AppSettingsService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Shipping extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'is_active',
        'sort_order',
        'estimated_days',
        'supports_free_shipping',
        'free_shipping_threshold',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'is_active' => 'boolean',
        'supports_free_shipping' => 'boolean',
        'sort_order' => 'integer',
        'estimated_days' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    // Relations
    public function sells()
    {
        return $this->hasMany(Sell::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if free shipping applies for the given cart total
     *
     * @param float $cartTotal
     * @return bool
     */
    public function isFreeShipping(float $cartTotal): bool
    {
        if (!$this->supports_free_shipping) {
            return false;
        }

        // Use method-specific threshold if set, otherwise use global threshold
        $threshold = $this->free_shipping_threshold ?? AppSettingsService::getFreeShippingThreshold();
        
        return $cartTotal >= $threshold;
    }

    /**
     * Get the calculated shipping cost for the given cart total
     *
     * @param float $cartTotal
     * @return float
     */
    public function getShippingCost(float $cartTotal): float
    {
        return $this->isFreeShipping($cartTotal) ? 0.0 : $this->price;
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Accessors
    public function getFormattedPriceAttribute(): string
    {
        return number_format((float) $this->price, 2, ',', ' ') . ' XOF';
    }

    public function getStatusTextAttribute(): string
    {
        return $this->is_active ? 'Actif' : 'Inactif';
    }

    public function getEstimatedDeliveryAttribute(): string
    {
        if (!$this->estimated_days) {
            return 'Non défini';
        }

        if ($this->estimated_days == 1) {
            return '1 jour';
        }

        return $this->estimated_days . ' jours';
    }

    // Méthodes métier
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    public function toggleStatus(): bool
    {
        return $this->update(['is_active' => !$this->is_active]);
    }

    // Méthodes statiques
    public static function getActiveShippings()
    {
        return self::active()->ordered()->get();
    }

    public static function getCheapestShipping()
    {
        return self::active()->orderBy('price')->first();
    }

    public static function getFreeShipping()
    {
        return self::active()->where('price', 0)->first();
    }
}
