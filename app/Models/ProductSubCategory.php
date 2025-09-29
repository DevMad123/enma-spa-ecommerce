<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ProductSubCategory extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'image',
        'note',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at', 
        'deleted_at'
    ];

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id', 'id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'subcategory_id', 'id');
    }

    // Scope pour filtrer les sous-catégories actives
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    // Scope pour filtrer par catégorie
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subCategory) {
            if (empty($subCategory->slug)) {
                $subCategory->slug = static::generateUniqueSlug($subCategory->name);
            }
        });

        static::updating(function ($subCategory) {
            if ($subCategory->isDirty('name')) {
                $subCategory->slug = static::generateUniqueSlug($subCategory->name, $subCategory->id);
            }
        });
    }

    /**
     * Generate a unique slug for the sub-category.
     */
    protected static function generateUniqueSlug($name, $excludeId = null)
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        $query = static::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
            $query = static::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}
