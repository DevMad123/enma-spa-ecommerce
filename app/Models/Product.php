<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    // Mass assignable fields
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
        'status',
    ];

    // Casts pour forcer les types corrects
    protected $casts = [
        'current_purchase_cost' => 'decimal:2',
        'current_sale_price' => 'decimal:2',
        'current_wholesale_price' => 'decimal:2',
        'available_quantity' => 'integer', // Toujours un entier
        'discount' => 'decimal:2',
        'discount_type' => 'integer',
        'is_popular' => 'boolean',
        'is_trending' => 'boolean',
        'status' => 'integer',
    ];

    // Relations
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

    // Variants
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Images
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    // Colors available via variants (pour produits variables)
    public function variantColors()
    {
        return $this->belongsToMany(ProductColor::class, 'product_variants', 'product_id', 'color_id')->distinct();
    }

    // Sizes available via variants (pour produits variables)
    public function variantSizes()
    {
        return $this->belongsToMany(ProductSize::class, 'product_variants', 'product_id', 'size_id')->distinct();
    }
    
    // Colors pour produits simples (relation directe)
    public function directColors()
    {
        return $this->belongsToMany(ProductColor::class, 'product_product_color', 'product_id', 'product_color_id');
    }
    
    // Sizes pour produits simples (relation directe)
    public function directSizes()
    {
        return $this->belongsToMany(ProductSize::class, 'product_product_size', 'product_id', 'product_size_id');
    }

    // Relations intelligentes qui gèrent les deux cas
    public function colors()
    {
        // Si le produit a des variants, utiliser variantColors, sinon directColors
        if ($this->variants()->exists()) {
            return $this->variantColors();
        }
        return $this->directColors();
    }

    public function sizes()
    {
        // Si le produit a des variants, utiliser variantSizes, sinon directSizes  
        if ($this->variants()->exists()) {
            return $this->variantSizes();
        }
        return $this->directSizes();
    }

    // Accessor for image full URL (or default placeholder)
    public function getImageAttribute()
    {
        if ($this->image_path) {
            if (str_starts_with($this->image_path, 'http')) {
                return $this->image_path;
            }
            return asset($this->image_path);
        }
        return asset('images/placeholder.jpg');
    }

    // Wishlists
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    // Reviews
    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    // Approved reviews only
    public function approvedReviews()
    {
        return $this->hasMany(ProductReview::class)->where('is_approved', true);
    }

    // Average rating
    public function getAverageRatingAttribute()
    {
        return $this->approvedReviews()->avg('rating') ?? 0;
    }

    // Reviews count
    public function getReviewsCountAttribute()
    {
        return $this->approvedReviews()->count();
    }

    // Helper scope to eager-load variants and their relations
    public function scopeWithVariants($query)
    {
        return $query->with(['variants.color', 'variants.size', 'variants.images']);
    }

    // Compute price range from variants, fallback to attributes/own price
    public function getPriceRangeAttribute(): array
    {
        $variantPrices = $this->variants()
            ->whereNotNull('sale_price')
            ->pluck('sale_price')
            ->filter(fn ($v) => $v !== null && $v !== '' && $v >= 0)
            ->map(fn ($v) => (float) $v)
            ->all();

        $min = null;
        $max = null;

        if (!empty($variantPrices)) {
            $min = min($variantPrices);
            $max = max($variantPrices);
        } else {
            if (method_exists($this, 'attributes')) {
                $attrMin = $this->attributes()->min('price');
                $attrMax = $this->attributes()->max('price');
                if ($attrMin !== null && $attrMax !== null) {
                    $min = (float) $attrMin;
                    $max = (float) $attrMax;
                }
            }

            if ($min === null || $max === null) {
                $price = (float) ($this->current_sale_price ?? 0);
                $min = $min ?? $price;
                $max = $max ?? $price;
            }
        }

        return [
            'min' => (float) $min,
            'max' => (float) $max,
        ];
    }

    // Calcul du prix final avec réduction
    public function getFinalPriceAttribute(): float
    {
        $basePrice = (float) ($this->current_sale_price ?? 0);
        
        if ($this->discount > 0) {
            if ($this->discount_type == 1) { // Pourcentage
                $discountAmount = $basePrice * ($this->discount / 100);
            } else { // Montant fixe
                $discountAmount = $this->discount;
            }
            return max(0, $basePrice - $discountAmount);
        }
        
        return $basePrice;
    }

    // Prix de départ (avant réduction)
    public function getOriginalPriceAttribute(): float
    {
        return (float) ($this->current_sale_price ?? 0);
    }

    // Y a-t-il une réduction ?
    public function getHasDiscountAttribute(): bool
    {
        return $this->discount > 0;
    }

    // Pourcentage de réduction
    public function getDiscountPercentageAttribute(): float
    {
        if ($this->discount_type == 1) {
            return (float) $this->discount;
        }
        
        $originalPrice = $this->original_price;
        if ($originalPrice > 0) {
            return round(($this->discount / $originalPrice) * 100, 2);
        }
        
        return 0;
    }

    // Calcul des prix min/max avec variants
    public function getPriceRangeWithDiscountAttribute(): array
    {
        $prices = [];
        
        // Prix des variants
        foreach ($this->variants as $variant) {
            if ($variant->sale_price > 0) {
                $prices[] = (float) $variant->sale_price;
            }
        }
        
        // Si pas de variants, utiliser le prix principal avec réduction
        if (empty($prices)) {
            $prices[] = $this->final_price;
        }
        
        return [
            'min' => empty($prices) ? 0 : min($prices),
            'max' => empty($prices) ? 0 : max($prices),
            'from_price' => empty($prices) ? 0 : min($prices),
        ];
    }

    // Appended attributes for frontend
    protected $appends = [
        'image',
        'average_rating',
        'reviews_count',
        'price_range',
        'price_min',
        'price_max',
        'final_price',
        'original_price',
        'has_discount',
        'discount_percentage',
        'price_range_with_discount',
    ];

    // price_min from price_range
    public function getPriceMinAttribute(): float
    {
        $range = $this->price_range;
        return (float) ($range['min'] ?? 0);
    }

    // price_max from price_range
    public function getPriceMaxAttribute(): float
    {
        $range = $this->price_range;
        return (float) ($range['max'] ?? 0);
    }
}

