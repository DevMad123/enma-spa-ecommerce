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
     * Relation avec les produits via la table product_attributes
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_attributes', 'color_id', 'product_id');
    }

    /**
     * Compter le nombre de produits utilisant cette couleur
     */
    public function getProductsCountAttribute()
    {
        return $this->products()->count();
    }
}
