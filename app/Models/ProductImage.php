<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductImage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'product_variant_id', // Ajout de la relation vers la variante
        'image',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Accesseur pour l'attribut image - retourne l'URL complète.
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // Si l'image commence par 'http', c'est une URL complète
            if (str_starts_with($this->image, 'http')) {
                return $this->image;
            }
            // Sinon, on construit l'URL complète
            return asset($this->image);
        }
        
        return asset('images/placeholder.jpg');
    }

    /**
     * Accesseur pour les propriétés calculées.
     */
    protected $appends = ['image_url'];
}