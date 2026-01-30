<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Traits\HandleImageUploads;

class BlogPostController extends Controller
{
    use HandleImageUploads;

    public function index(Request $request)
    {
        $query = BlogPost::query()
            ->with(['category', 'author'])
            ->withTrashed();

        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function($q) use ($searchPattern) {
                $q->where('title', 'like', $searchPattern)
                  ->orWhere('excerpt', 'like', $searchPattern)
                  ->orWhereHas('category', function($catQuery) use ($searchPattern) {
                      $catQuery->where('name', 'like', $searchPattern);
                  });
            });
        }

        // Filtre par catégorie
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtre par auteur
        if ($request->filled('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        // Filtre par statut de publication
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->whereNotNull('published_at')->where('published_at', '<=', now());
            } elseif ($request->status === 'draft') {
                $query->whereNull('published_at');
            } elseif ($request->status === 'scheduled') {
                $query->whereNotNull('published_at')->where('published_at', '>', now());
            }
        }

        // Filtre par featured
        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->is_featured);
        }

        // Tri
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $blogPosts = $query->paginate($perPage)->appends($request->all());

        // Récupérer les données pour les filtres
        $categories = BlogCategory::where('is_active', true)->orderBy('order')->get();
        $authors = User::whereHas('blogPosts')->get();

        // Calculer les statistiques
        $stats = [
            'total_posts' => BlogPost::count(),
            'published_posts' => BlogPost::whereNotNull('published_at')->where('published_at', '<=', now())->count(),
            'draft_posts' => BlogPost::whereNull('published_at')->count(),
            'scheduled_posts' => BlogPost::whereNotNull('published_at')->where('published_at', '>', now())->count(),
            'total_views' => BlogPost::sum('views'),
        ];

        return Inertia::render('Admin/Blog/Index', [
            'title' => 'Gestion des Articles',
            'blogPosts' => $blogPosts,
            'categories' => $categories,
            'authors' => $authors,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'category_id' => $request->category_id ?? '',
                'author_id' => $request->author_id ?? '',
                'status' => $request->status ?? '',
                'is_featured' => $request->is_featured ?? '',
                'per_page' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
        ]);
    }

    public function create()
    {
        $categories = BlogCategory::where('is_active', true)->orderBy('order')->get();

        return Inertia::render('Admin/Blog/Create', [
            'title' => 'Créer un Article',
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
                'excerpt' => 'required|string|max:500',
                'content' => 'required|string',
                'category_id' => 'required|exists:blog_categories,id',
                'cover_image' => 'required|image|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'published_at' => 'nullable|date',
                'is_featured' => 'nullable|boolean',
                'seo_title' => 'nullable|string|max:255',
                'seo_description' => 'nullable|string|max:500',
                'seo_keywords' => 'nullable|array',
                'seo_keywords.*' => 'string|max:50',
            ]);

            // Gérer le slug
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['title']);
            } else {
                $validated['slug'] = Str::slug($validated['slug']);
            }

            // Vérifier l'unicité du slug
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (BlogPost::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Upload de l'image de couverture
            if ($request->hasFile('cover_image')) {
                $coverImage = $request->file('cover_image');
                $coverImageName = time() . '_' . Str::slug(pathinfo($coverImage->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $coverImage->getClientOriginalExtension();
                $coverImage->storeAs('blog/covers', $coverImageName, 'public');
                $validated['cover_image'] = 'blog/covers/' . $coverImageName;
            }

            // Définir l'auteur
            $validated['author_id'] = auth()->id();

            // Calculer le temps de lecture (environ 200 mots par minute)
            $wordCount = str_word_count(strip_tags($validated['content']));
            $validated['read_time'] = max(1, ceil($wordCount / 200));

            // Gérer les métadonnées SEO
            $validated['seo_meta'] = [
                'title' => $validated['seo_title'] ?? $validated['title'],
                'description' => $validated['seo_description'] ?? $validated['excerpt'],
                'keywords' => $validated['seo_keywords'] ?? [],
            ];

            // Retirer les champs temporaires
            unset($validated['seo_title'], $validated['seo_description'], $validated['seo_keywords']);

            // Créer l'article
            $blogPost = BlogPost::create($validated);

            DB::commit();

            return redirect()->route('admin.blog.index')->with('flash.success', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => "L'article \"{$blogPost->title}\" a été créé avec succès."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création de l\'article de blog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withInput()->withErrors([
                'error' => 'Une erreur est survenue lors de la création de l\'article : ' . $e->getMessage()
            ]);
        }
    }

    public function show(BlogPost $blogPost)
    {
        $blogPost->load(['category', 'author']);

        return Inertia::render('Admin/Blog/Show', [
            'title' => 'Détails de l\'Article',
            'blogPost' => [
                'id' => $blogPost->id,
                'title' => $blogPost->title,
                'slug' => $blogPost->slug,
                'excerpt' => $blogPost->excerpt,
                'content' => $blogPost->content,
                'cover_image' => $blogPost->cover_image,
                'cover_image_url' => $blogPost->cover_image_url,
                'category' => $blogPost->category,
                'author' => $blogPost->author ? [
                    'id' => $blogPost->author->id,
                    'name' => $blogPost->author->name,
                ] : null,
                'tags' => $blogPost->tags ?? [],
                'views' => $blogPost->views,
                'read_time' => $blogPost->read_time,
                'published_at' => $blogPost->published_at?->format('Y-m-d H:i:s'),
                'is_featured' => $blogPost->is_featured,
                'seo_meta' => $blogPost->seo_meta ?? [],
                'created_at' => $blogPost->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $blogPost->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(BlogPost $blogPost)
    {
        $categories = BlogCategory::where('is_active', true)->orderBy('order')->get();
        $blogPost->load(['category', 'author']);

        return Inertia::render('Admin/Blog/Edit', [
            'title' => 'Modifier l\'Article',
            'blogPost' => [
                'id' => $blogPost->id,
                'title' => $blogPost->title,
                'slug' => $blogPost->slug,
                'excerpt' => $blogPost->excerpt,
                'content' => $blogPost->content,
                'cover_image' => $blogPost->cover_image,
                'cover_image_url' => $blogPost->cover_image_url,
                'category_id' => $blogPost->category_id,
                'tags' => $blogPost->tags ?? [],
                'published_at' => $blogPost->published_at?->format('Y-m-d\TH:i'),
                'is_featured' => $blogPost->is_featured,
                'seo_meta' => $blogPost->seo_meta ?? [],
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_posts,slug,' . $blogPost->id,
                'excerpt' => 'required|string|max:500',
                'content' => 'required|string',
                'category_id' => 'required|exists:blog_categories,id',
                'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'published_at' => 'nullable|date',
                'is_featured' => 'nullable|boolean',
                'seo_title' => 'nullable|string|max:255',
                'seo_description' => 'nullable|string|max:500',
                'seo_keywords' => 'nullable|array',
                'seo_keywords.*' => 'string|max:50',
            ]);

            // Gérer le slug
            if (!empty($validated['slug']) && $validated['slug'] !== $blogPost->slug) {
                $validated['slug'] = Str::slug($validated['slug']);
                
                // Vérifier l'unicité du slug
                $originalSlug = $validated['slug'];
                $counter = 1;
                while (BlogPost::where('slug', $validated['slug'])->where('id', '!=', $blogPost->id)->exists()) {
                    $validated['slug'] = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }

            // Upload de la nouvelle image de couverture
            if ($request->hasFile('cover_image')) {
                // Supprimer l'ancienne image
                if ($blogPost->cover_image && Storage::disk('public')->exists($blogPost->cover_image)) {
                    Storage::disk('public')->delete($blogPost->cover_image);
                }

                $coverImage = $request->file('cover_image');
                $coverImageName = time() . '_' . Str::slug(pathinfo($coverImage->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $coverImage->getClientOriginalExtension();
                $coverImage->storeAs('blog/covers', $coverImageName, 'public');
                $validated['cover_image'] = 'blog/covers/' . $coverImageName;
            }

            // Calculer le temps de lecture
            $wordCount = str_word_count(strip_tags($validated['content']));
            $validated['read_time'] = max(1, ceil($wordCount / 200));

            // Gérer les métadonnées SEO
            $validated['seo_meta'] = [
                'title' => $validated['seo_title'] ?? $validated['title'],
                'description' => $validated['seo_description'] ?? $validated['excerpt'],
                'keywords' => $validated['seo_keywords'] ?? [],
            ];

            // Retirer les champs temporaires
            unset($validated['seo_title'], $validated['seo_description'], $validated['seo_keywords']);

            // Mettre à jour l'article
            $blogPost->update($validated);

            DB::commit();

            return redirect()->route('admin.blog.index')->with('flash.success', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => "L'article \"{$blogPost->title}\" a été mis à jour avec succès."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la mise à jour de l\'article de blog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withInput()->withErrors([
                'error' => 'Une erreur est survenue lors de la mise à jour de l\'article : ' . $e->getMessage()
            ]);
        }
    }

    public function destroy(BlogPost $blogPost)
    {
        try {
            $title = $blogPost->title;
            
            // Supprimer l'image de couverture
            if ($blogPost->cover_image && Storage::disk('public')->exists($blogPost->cover_image)) {
                Storage::disk('public')->delete($blogPost->cover_image);
            }

            $blogPost->delete();

            return redirect()->route('admin.blog.index')->with('flash.success', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => "L'article \"{$title}\" a été supprimé avec succès."
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de l\'article de blog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Une erreur est survenue lors de la suppression de l\'article : ' . $e->getMessage()
            ]);
        }
    }
}
