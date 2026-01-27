<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'category_id',
        'author_id',
        'tags',
        'views',
        'read_time',
        'published_at',
        'is_featured',
        'seo_meta',
    ];

    protected $casts = [
        'tags' => 'array',
        'seo_meta' => 'array',
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
    ];

    /**
     * Relation : un article appartient à une catégorie
     */
    public function category()
    {
        return $this->belongsTo(BlogCategory::class);
    }

    /**
     * Relation : un article appartient à un auteur
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope : articles publiés seulement
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope : articles mis en avant
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope : articles récents
     */
    public function scopeRecent($query, $limit = 3)
    {
        return $query->orderBy('published_at', 'desc')->limit($limit);
    }

    /**
     * Scope : recherche par catégorie
     */
    public function scopeInCategory($query, $categorySlug)
    {
        return $query->whereHas('category', function ($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    /**
     * Accesseur : URL complète de l'image de couverture
     */
    public function getCoverImageUrlAttribute()
    {
        if (Str::startsWith($this->cover_image, ['http://', 'https://'])) {
            return $this->cover_image;
        }
        return asset('storage/' . $this->cover_image);
    }

    /**
     * Accesseur : temps de lecture formaté
     */
    public function getReadTimeFormattedAttribute()
    {
        return $this->read_time . ' min';
    }

    /**
     * Accesseur : date publiée formatée
     */
    public function getPublishedAtFormattedAttribute()
    {
        return $this->published_at ? $this->published_at->format('d M Y') : null;
    }

    /**
     * Accesseur : SEO title (fallback sur title)
     */
    public function getSeoTitleAttribute()
    {
        return $this->seo_meta['title'] ?? $this->title;
    }

    /**
     * Accesseur : SEO description (fallback sur excerpt)
     */
    public function getSeoDescriptionAttribute()
    {
        return $this->seo_meta['description'] ?? $this->excerpt;
    }

    /**
     * Incrémenter le compteur de vues
     */
    public function incrementViews()
    {
        $this->increment('views');
    }

    /**
     * Génère automatiquement le slug et le temps de lecture
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }

            // Calcul automatique du temps de lecture (200 mots/min)
            if (empty($post->read_time)) {
                $wordCount = str_word_count(strip_tags($post->content));
                $post->read_time = max(1, ceil($wordCount / 200));
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }

            if ($post->isDirty('content')) {
                $wordCount = str_word_count(strip_tags($post->content));
                $post->read_time = max(1, ceil($wordCount / 200));
            }
        });
    }

    /**
     * Route key name pour le routing
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
