<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FrontCustomizationSlide extends Model
{
    protected $fillable = [
        'product_id', 'background_image', 'tagline', 'order', 'enabled'
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'order' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getBackgroundImageUrlAttribute(): ?string
    {
        return $this->background_image ? url('/' . ltrim($this->background_image, '/')) : null;
    }

    protected static function boot()
    {
        parent::boot();
        static::saved(fn() => Cache::forget('front_customizations'));
        static::deleted(fn() => Cache::forget('front_customizations'));
    }
}

