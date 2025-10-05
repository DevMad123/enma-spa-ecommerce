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
     * Relation avec les produits via la table product_attributes
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_attributes', 'size_id', 'product_id');
    }

    /**
     * Compter le nombre de produits utilisant cette taille
     */
    public function getProductsCountAttribute()
    {
        return $this->products()->count();
    }
}
