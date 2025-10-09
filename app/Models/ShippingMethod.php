<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'supports_free_shipping',
        'free_shipping_threshold',
        'active',
        'sort_order'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'supports_free_shipping' => 'boolean',
        'active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Scope pour les méthodes actives
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope pour ordonner par sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
