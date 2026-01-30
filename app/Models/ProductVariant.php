<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'color_id',
        'size_id',
        'sku',
        'purchase_cost',
        'sale_price',
        'wholesale_price',
        'available_quantity',
    ];

    protected $casts = [
        'purchase_cost' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'available_quantity' => 'integer', // Toujours un entier (pas de demi-produit)
    ];

    // Les relations du modèle
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function color()
    {
        return $this->belongsTo(ProductColor::class, 'color_id');
    }

    public function size()
    {
        return $this->belongsTo(ProductSize::class, 'size_id');
    }

    /**
     * Une variante peut avoir plusieurs images.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_variant_id');
    }

    /**
     * Alias logique pour stock attendu par le front.
     * Mappe sur la colonne available_quantity (DB actuelle).
     */
    public function getStockAttribute(): int
    {
        $qty = $this->available_quantity ?? 0;
        return (int) floor((float) $qty);
    }

    /**
     * Alias logique pour price attendu par certaines intégrations.
     * Par défaut, on retourne sale_price (prix de vente).
     */
    public function getPriceAttribute(): float
    {
        return (float) ($this->sale_price ?? 0);
    }

    public function getVariantNameAttribute()
    {
        $parts = [];

        if ($this->color) {
            $parts[] = $this->color->name;
        }

        if ($this->size) {
            $parts[] = $this->size->name;
        }

        return count($parts) > 0
            ? implode(' / ', $parts)
            : 'Standard'; // valeur par défaut
    }
}
