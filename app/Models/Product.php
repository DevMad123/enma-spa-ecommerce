<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    // Champs pouvant être mass assignable
    protected $fillable = [
        'name',
        'category_id',
        'subcategory_id',
        'brand_id',
        'supplier_id',
        'description',
        'unit_type',
        'type',
        'image_path',
        'code',
        'current_purchase_cost',
        'current_sale_price',
        'current_wholesale_price',
        'available_quantity',
        'discount_type',
        'discount',
        'is_popular',
        'is_trending',
        'status'
    ];
    
    // Les relations du modèle
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(ProductSubCategory::class, 'subcategory_id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * Un produit peut avoir plusieurs variantes.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Un produit peut avoir plusieurs images.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    /**
     * Récupère les couleurs disponibles pour ce produit via les variantes.
     */
    public function colors()
    {
        return $this->belongsToMany(ProductColor::class, 'product_variants', 'product_id', 'color_id')
                    ->distinct();
    }

    /**
     * Récupère les tailles disponibles pour ce produit via les variantes.
     */
    public function sizes()
    {
        return $this->belongsToMany(ProductSize::class, 'product_variants', 'product_id', 'size_id')
                    ->distinct();
    }

    /**
     * Accesseur pour l'attribut image - retourne l'image_path ou une image par défaut.
     */
    public function getImageAttribute()
    {
        if ($this->image_path) {
            // Si l'image_path commence par 'http', c'est une URL complète
            if (str_starts_with($this->image_path, 'http')) {
                return $this->image_path;
            }
            // Sinon, on construit l'URL complète
            return asset($this->image_path);
        }
        
        // Retourne l'image par défaut
        return asset('images/placeholder.jpg');
    }

    /**
     * Accesseur pour les propriétés calculées.
     */
    protected $appends = ['image'];
}
