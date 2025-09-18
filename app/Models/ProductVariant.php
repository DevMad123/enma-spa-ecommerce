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
}