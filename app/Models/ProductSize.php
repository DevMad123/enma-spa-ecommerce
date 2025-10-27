<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'size',
    ];

    /**
     * Variantes liées à cette taille.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'size_id');
    }

    /**
     * Produits liés via les variantes.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_variants', 'size_id', 'product_id')->distinct();
    }

    /**
     * Compter le nombre de produits utilisant cette taille
     */
    public function getProductsCountAttribute()
    {
        return $this->products()->count();
    }
}
