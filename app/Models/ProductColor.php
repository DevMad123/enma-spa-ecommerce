<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductColor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color_code',
    ];

    /**
     * Variantes liées à cette couleur.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'color_id');
    }

    /**
     * Produits liés via les variantes.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_variants', 'color_id', 'product_id')->distinct();
    }

    /**
     * Compter le nombre de produits utilisant cette couleur
     */
    public function getProductsCountAttribute()
    {
        return $this->products()->count();
    }
}
