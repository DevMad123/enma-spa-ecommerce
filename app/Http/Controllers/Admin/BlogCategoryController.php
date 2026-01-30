<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class BlogCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogCategory::query()->withCount('posts');

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function($q) use ($searchPattern) {
                $q->where('name', 'like', $searchPattern)
                  ->orWhere('description', 'like', $searchPattern);
            });
        }

        // Filtre par statut
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Tri
        $sort = $request->get('sort', 'order');
        $direction = $request->get('direction', 'asc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $categories = $query->paginate($perPage)->appends($request->all());

        // Statistiques
        $stats = [
            'total_categories' => BlogCategory::count(),
            'active_categories' => BlogCategory::where('is_active', true)->count(),
            'inactive_categories' => BlogCategory::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/BlogCategories/Index', [
            'title' => 'Catégories de Blog',
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'is_active' => $request->is_active ?? '',
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
        return Inertia::render('Admin/BlogCategories/Create', [
            'title' => 'Créer une Catégorie',
        ]);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            // Gérer le slug
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            } else {
                $validated['slug'] = Str::slug($validated['slug']);
            }

            // Vérifier l'unicité du slug
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (BlogCategory::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Upload de l'image
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $image->getClientOriginalExtension();
                $image->storeAs('blog/categories', $imageName, 'public');
                $validated['image'] = 'blog/categories/' . $imageName;
            }

            // Définir l'ordre par défaut
            if (!isset($validated['order'])) {
                $validated['order'] = BlogCategory::max('order') + 1;
            }

            // Définir is_active par défaut
            if (!isset($validated['is_active'])) {
                $validated['is_active'] = true;
            }

            // Créer la catégorie
            $category = BlogCategory::create($validated);

            DB::commit();

            return redirect()->route('admin.blog.categories.index')->with('flash.success', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => "La catégorie \"{$category->name}\" a été créée avec succès."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création de la catégorie de blog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withInput()->withErrors([
                'error' => 'Une erreur est survenue lors de la création de la catégorie : ' . $e->getMessage()
            ]);
        }
    }

    public function edit(BlogCategory $category)
    {
        return Inertia::render('Admin/BlogCategories/Edit', [
            'title' => 'Modifier la Catégorie',
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
                'image_url' => $category->image_url,
                'order' => $category->order,
                'is_active' => $category->is_active,
            ],
        ]);
    }

    public function update(Request $request, BlogCategory $category)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $category->id,
                'description' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'order' => 'nullable|integer|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            // Gérer le slug
            if (!empty($validated['slug']) && $validated['slug'] !== $category->slug) {
                $validated['slug'] = Str::slug($validated['slug']);
                
                // Vérifier l'unicité du slug
                $originalSlug = $validated['slug'];
                $counter = 1;
                while (BlogCategory::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
                    $validated['slug'] = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }

            // Upload de la nouvelle image
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image
                if ($category->image && Storage::disk('public')->exists($category->image)) {
                    Storage::disk('public')->delete($category->image);
                }

                $image = $request->file('image');
                $imageName = time() . '_' . Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $image->getClientOriginalExtension();
                $image->storeAs('blog/categories', $imageName, 'public');
                $validated['image'] = 'blog/categories/' . $imageName;
            }

            // Mettre à jour la catégorie
            $category->update($validated);

            DB::commit();

            return redirect()->route('admin.blog.categories.index')->with('flash.success', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => "La catégorie \"{$category->name}\" a été mise à jour avec succès."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la mise à jour de la catégorie de blog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withInput()->withErrors([
                'error' => 'Une erreur est survenue lors de la mise à jour de la catégorie : ' . $e->getMessage()
            ]);
        }
    }

    public function destroy(BlogCategory $category)
    {
        try {
            // Vérifier si la catégorie contient des articles
            if ($category->posts()->count() > 0) {
                return redirect()->back()->withErrors([
                    'error' => "Impossible de supprimer cette catégorie car elle contient {$category->posts()->count()} article(s)."
                ]);
            }

            $name = $category->name;
            
            // Supprimer l'image
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }

            $category->delete();

            return redirect()->route('admin.blog.categories.index')->with('flash.success', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => "La catégorie \"{$name}\" a été supprimée avec succès."
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de la catégorie de blog', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Une erreur est survenue lors de la suppression de la catégorie : ' . $e->getMessage()
            ]);
        }
    }
}
