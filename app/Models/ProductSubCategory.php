<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductSubCategory extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'category_id',
        'name',
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
}
