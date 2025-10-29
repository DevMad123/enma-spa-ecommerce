<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FrontGalleryItem extends Model
{
    protected $fillable = [
        'image_path', 'title', 'url', 'order', 'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'order' => 'integer',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) return null;
        if (str_starts_with($this->image_path, 'http')) return $this->image_path;
        return url('/' . ltrim($this->image_path, '/'));
    }
}

