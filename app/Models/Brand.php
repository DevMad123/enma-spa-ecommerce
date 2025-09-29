<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'image',
        'status',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * Relation avec les produits
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'brand_id');
    }
}
