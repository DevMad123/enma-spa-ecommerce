<?php

namespace App\Helpers;

use Illuminate\Support\Str;

/**
 * Helper pour la gestion des URLs et meta tags du blog
 */
class BlogHelper
{
    /**
     * Génère un slug unique pour un article
     */
    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (self::slugExists($slug, $excludeId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Vérifie si un slug existe déjà
     */
    private static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $query = \App\Models\BlogPost::where('slug', $slug);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Calcule le temps de lecture estimé (200 mots/min)
     */
    public static function calculateReadTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, ceil($wordCount / 200));
    }

    /**
     * Génère un excerpt à partir du contenu
     */
    public static function generateExcerpt(string $content, int $maxLength = 160): string
    {
        $text = strip_tags($content);
        $text = preg_replace('/\s+/', ' ', $text);
        
        if (strlen($text) <= $maxLength) {
            return $text;
        }

        return substr($text, 0, $maxLength) . '...';
    }

    /**
     * Formate les meta tags pour SEO
     */
    public static function formatMetaTags(array $data): array
    {
        return [
            'title' => $data['title'] ?? 'Blog Sneakers | ENMA SPA',
            'description' => $data['description'] ?? 'Découvrez nos articles sur la culture sneakers',
            'keywords' => $data['keywords'] ?? 'sneakers, blog, culture, streetwear',
            'og_image' => $data['og_image'] ?? null,
            'og_type' => $data['og_type'] ?? 'website',
            'twitter_card' => $data['twitter_card'] ?? 'summary_large_image',
        ];
    }

    /**
     * Génère l'URL canonique d'un article
     */
    public static function getCanonicalUrl(string $slug): string
    {
        return url('/blog/' . $slug);
    }

    /**
     * Génère le structured data JSON-LD pour un article
     */
    public static function generateArticleSchema(array $article): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $article['title'],
            'description' => $article['excerpt'],
            'image' => $article['cover_image'],
            'datePublished' => $article['published_at']->toIso8601String(),
            'dateModified' => $article['updated_at']->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $article['author']['name'],
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'ENMA SPA',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('images/logo.png'),
                ],
            ],
        ];
    }

    /**
     * Extrait tous les tags uniques des articles
     */
    public static function getAllTags(): array
    {
        return \App\Models\BlogPost::published()
            ->whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->toArray();
    }

    /**
     * Recherche d'articles par mot-clé
     */
    public static function search(string $query, int $limit = 10)
    {
        return \App\Models\BlogPost::published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Articles populaires (basés sur les vues)
     */
    public static function getPopularPosts(int $limit = 5)
    {
        return \App\Models\BlogPost::published()
            ->orderBy('views', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Formate le nombre de vues
     */
    public static function formatViews(int $views): string
    {
        if ($views >= 1000000) {
            return round($views / 1000000, 1) . 'M';
        }
        
        if ($views >= 1000) {
            return round($views / 1000, 1) . 'K';
        }

        return (string) $views;
    }

    /**
     * Génère un sitemap XML pour les articles
     */
    public static function generateSitemap(): string
    {
        $posts = \App\Models\BlogPost::published()
            ->orderBy('updated_at', 'desc')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Page index du blog
        $xml .= '<url>';
        $xml .= '<loc>' . route('blog.index') . '</loc>';
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>0.8</priority>';
        $xml .= '</url>';

        // Articles individuels
        foreach ($posts as $post) {
            $xml .= '<url>';
            $xml .= '<loc>' . route('blog.show', $post->slug) . '</loc>';
            $xml .= '<lastmod>' . $post->updated_at->toW3cString() . '</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.6</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return $xml;
    }
}
