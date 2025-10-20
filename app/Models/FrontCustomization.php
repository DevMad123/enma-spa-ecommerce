<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FrontCustomization extends Model
{
    protected $fillable = [
        'hero_enabled',
        'hero_product_id',
        'hero_background_image',
        'hero_title',
        'hero_subtitle',
        'featured_section_enabled',
        'newsletter_enabled',
        'theme_color',
        'logo_image',
    ];

    protected $casts = [
        'hero_enabled' => 'boolean',
        'featured_section_enabled' => 'boolean',
        'newsletter_enabled' => 'boolean',
    ];

    public function heroProduct()
    {
        return $this->belongsTo(Product::class, 'hero_product_id');
    }

    public function getHeroBackgroundImageUrlAttribute(): ?string
    {
        return $this->hero_background_image
            ? url('/' . ltrim($this->hero_background_image, '/'))
            : null;
    }

    public function getLogoImageUrlAttribute(): ?string
    {
        return $this->logo_image
            ? url('/' . ltrim($this->logo_image, '/'))
            : null;
    }

    protected static function boot()
    {
        parent::boot();

        static::saved(function () {
            Cache::forget('front_customizations');
        });

        static::deleted(function () {
            Cache::forget('front_customizations');
        });
    }
}

