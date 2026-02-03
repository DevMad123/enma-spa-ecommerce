<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Affiche la liste des articles du blog
     */
    public function index(Request $request)
    {
        $query = BlogPost::with(['category', 'author'])
            ->published()
            ->orderBy('published_at', 'desc');

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filtrer par tag
        if ($request->filled('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }

        $posts = $query->paginate(12);

        // Article mis en avant
        $featuredPost = BlogPost::with(['category', 'author'])
            ->published()
            ->featured()
            ->first();

        // Catégories actives
        $categories = BlogCategory::active()
            ->ordered()
            ->withCount(['posts' => function ($query) {
                $query->published();
            }])
            ->get();

        // Tags populaires (extraction de tous les tags)
        $popularTags = BlogPost::published()
            ->whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->filter()
            ->countBy()
            ->sortDesc()
            ->take(10)
            ->keys()
            ->toArray();

        return Inertia::render('Frontend/Blog/Index', [
            'posts' => $posts,
            'featuredPost' => $featuredPost,
            'categories' => $categories,
            'popularTags' => $popularTags,
            'filters' => [
                'search' => $request->search,
                'tag' => $request->tag,
            ],
        ]);
    }

    /**
     * Affiche un article unique
     */
    public function show(BlogPost $post)
    {
        // Vérifier si l'article est publié (sauf pour les admins)
        if (!$post->published_at || $post->published_at->isFuture()) {
            if (!auth()->check() || !auth()->user()->hasRole('admin')) {
                abort(404);
            }
        }

        // Charger les relations
        $post->load(['category', 'author']);

        // Incrémenter les vues
        $post->incrementViews();

        // Articles liés (même catégorie)
        $relatedPosts = BlogPost::with(['category', 'author'])
            ->published()
            ->where('id', '!=', $post->id)
            ->when($post->category_id, function ($query) use ($post) {
                $query->where('category_id', $post->category_id);
            })
            ->latest('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('Frontend/Blog/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title ?? '',
                'slug' => $post->slug ?? '',
                'excerpt' => $post->excerpt ?? '',
                'content' => $post->content ?? '',
                'cover_image' => $post->cover_image_url ?? '',
                'category' => $post->category ? [
                    'id' => $post->category->id,
                    'name' => $post->category->name ?? '',
                    'slug' => $post->category->slug ?? '',
                ] : null,
                'author' => $post->author ? [
                    'id' => $post->author->id,
                    'name' => $post->author->name ?? '',
                ] : null,
                'tags' => $post->tags ?? [],
                'views' => $post->views ?? 0,
                'read_time' => $post->read_time ?? 5,
                'published_at' => $post->published_at_formatted ?? '',
                'published_at_iso' => $post->published_at?->toIso8601String() ?? null,
                'seo_title' => $post->seo_title ?? $post->title ?? '',
                'seo_description' => $post->seo_description ?? $post->excerpt ?? '',
            ],
            'relatedPosts' => $relatedPosts->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'excerpt' => $p->excerpt,
                    'cover_image' => $p->cover_image_url,
                    'category' => $p->category ? [
                        'name' => $p->category->name,
                        'slug' => $p->category->slug,
                    ] : null,
                    'read_time' => $p->read_time,
                    'published_at' => $p->published_at_formatted,
                ];
            }),
        ]);
    }

    /**
     * Affiche les articles d'une catégorie
     */
    public function category(BlogCategory $category)
    {
        $posts = BlogPost::with(['category', 'author'])
            ->published()
            ->where('category_id', $category->id)
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        // Catégories actives
        $categories = BlogCategory::active()
            ->ordered()
            ->withCount(['posts' => function ($query) {
                $query->published();
            }])
            ->get();

        return Inertia::render('Frontend/Blog/Category', [
            'posts' => $posts,
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
            ],
            'categories' => $categories,
        ]);
    }
}
