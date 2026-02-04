<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;
use App\Models\ProductCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Traits\HandleImageUploads;

class ProductCategoryController extends Controller
{
    use HandleImageUploads;
     /**
     * Display a list of product categories.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function index(Request $request)
    {
        // Start a new query for the ProductCategory model, excluding deleted records.
        $query = ProductCategory::query()
            ->with(['parent', 'children', 'products']) // Eager load parent, children categories and products
            ->withCount('products') // Count products for each category
            ->whereNull('deleted_at');

        // Global search filter - Sécurisé
        if ($request->filled('search')) {
            $search = $request->search;
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function($q) use ($searchPattern) {
                $q->where('name', 'like', $searchPattern)
                  ->orWhere('note', 'like', $searchPattern)
                  ->orWhere('slug', 'like', $searchPattern);
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Popularity filter
        if ($request->filled('is_popular')) {
            $query->where('is_popular', $request->is_popular);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Products count filter
        if ($request->filled('products_count_filter')) {
            if ($request->products_count_filter === 'with_products') {
                $query->has('products');
            } elseif ($request->products_count_filter === 'without_products') {
                $query->doesntHave('products');
            }
        }

        // Sorting
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $categoryList = $query->paginate($perPage)->appends($request->all());

        // Calculate statistics
        $stats = [
            'total_categories' => ProductCategory::whereNull('deleted_at')->count(),
            'active_categories' => ProductCategory::whereNull('deleted_at')->where('status', 1)->count(),
            'popular_categories' => ProductCategory::whereNull('deleted_at')->where('is_popular', 1)->count(),
            'categories_with_products' => ProductCategory::whereNull('deleted_at')->has('products')->count(),
        ];

        // Return the Inertia view with the necessary data.
        return Inertia::render('Admin/Categories/Index', [
            'title' => 'Category List',
            'categoryList' => $categoryList,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'is_popular' => $request->is_popular ?? '',
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
                'products_count_filter' => $request->products_count_filter ?? '',
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
    /**
     * Store a newly created product category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product category store request data: ', $request->all());

            // Décoder les JSON strings si nécessaire (pour la cohérence avec ProductController)
            $requestData = $request->all();
            
            // Validation - utiliser des règles compatibles avec FormData
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_categories,name',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'note' => 'nullable|string',
                'parent_id' => 'nullable|exists:product_categories,id',
                'is_popular' => 'nullable',
                'status' => 'nullable'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->uploadCategoryImage($request->file('image'));
            }

            $category = new ProductCategory();
            $category->name = $validated['name'];
            $category->note = $validated['note'] ?? '';
            $category->parent_id = $validated['parent_id'] ?? null;
            // Convertir les booléens explicitement
            $category->is_popular = $request->boolean('is_popular');
            $category->status = $request->boolean('status');
            $category->image = $imagePath;
            $category->created_by = auth()->id();
            $category->save();

            \Log::info('Product category data before commit: ', $category->toArray());

            DB::commit();

            \Log::info('Product category data after commit: ', $category->fresh()->toArray());

            // Utiliser le même format de flash message que ProductController
            return redirect()->route('admin.categories.index')->with([
                'flash' => [
                    'success' => 'Catégorie créée avec succès'
                ]
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation errors during category creation: ', $e->errors());
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating category: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création'])->withInput();
        }
    }

    /**
     * Sauvegarde l'image de la catégorie avec redimensionnement et optimisation.
     *
     * @param  \Illuminate\Http\UploadedFile $image
     * @return string|null
     */
    protected function categoryImageSave($image)
    {
        if ($image) {
            $fileName = "category-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'category_images/' . $fileName;

            // Créer l'instance du gestionnaire d'image
            $imageManager = new ImageManager(new GdDriver());
            
            // Charger l'image téléchargée pour la manipulation
            try {
                $img = $imageManager->read($image);
            } catch (\Throwable $e) {
                \Log::warning('GD failed to read image, attempting Imagick fallback: ' . $e->getMessage());
                try {
                    $imageManager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                    $img = $imageManager->read($image);
                } catch (\Throwable $e2) {
                    \Log::error('Imagick fallback failed to read image: ' . $e2->getMessage());
                    throw ValidationException::withMessages([
                        'image' => "Format d'image non supporté par le serveur. Utilisez JPG/PNG/WEBP ou activez le support AVIF."
                    ]);
                }
            }
            
            // Redimensionner et optimiser l'image
            $img->resize(400, 400);
            
            // Encoder en WebP avec qualité 70%
            $encodedImageContent = $img->toWebp(70);

            // Sauvegarder dans le stockage public
            Storage::disk('public')->put($filePath, $encodedImageContent);

            return 'storage/' . $filePath;
        }

        return null;
    }

    public function categoryIcon($image)
    {
        if (isset($image) && ($image != '') && ($image != null)) {
            $ext = explode('/', mime_content_type($image))[1];

            $logo_url = "category_icons-" . time() . rand(1000, 9999) . '.' . $ext;
            $logo_directory = getUploadPath() . '/category_icons/';
            $filePath = $logo_directory;
            $logo_path = $filePath . $logo_url;
            $db_media_img_path = 'storage/category_icons/' . $logo_url;

            if (!file_exists($filePath)) {
                mkdir($filePath, 666, true);
            }

            $imageManager = new ImageManager(new GdDriver());
            try {
                $img = $imageManager->read($image);
            } catch (\Throwable $e) {
                \Log::warning('GD failed to read category icon, trying Imagick: ' . $e->getMessage());
                try {
                    $imageManager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                    $img = $imageManager->read($image);
                } catch (\Throwable $e2) {
                    \Log::error('Imagick failed to read category icon: ' . $e2->getMessage());
                    throw ValidationException::withMessages([
                        'image' => "Format d'image non supporté (activez AVIF ou utilisez JPG/PNG/WEBP)."
                    ]);
                }
            }
            $img->resize(400, 400);
            $encoded = $img->toWebp(70);
            file_put_contents($logo_path, $encoded);

            return $db_media_img_path;

        }

    }

    /**
     * Update the specified product category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product category update request data: ', $request->all());

            // Debug MIME/extension pour diagnostic
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                \Log::info('Product category update image debug', [
                    'getMimeType' => $file->getMimeType(),
                    'getClientMimeType' => $file->getClientMimeType(),
                    'getClientOriginalExtension' => $file->getClientOriginalExtension(),
                ]);
            } else {
                \Log::info('Product category update image debug: no file detected via hasFile("image")');
            }

            // Trouver la catégorie
            $category = ProductCategory::findOrFail($id);

            // Validation - utiliser des règles compatibles avec FormData
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_categories,name,' . $id,
                // Règle unifiée: image + mimes (meilleure compatibilité Windows)
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:4096',
                'image_deleted' => 'nullable',
                'note' => 'nullable|string',
                'parent_id' => 'nullable|exists:product_categories,id|not_in:' . $id,
                'is_popular' => 'nullable',
                'status' => 'nullable'
            ]);

            // Convertir les booléens explicitement
            $category->is_popular = $request->boolean('is_popular');
            $category->status = $request->boolean('status');

            // Gestion de l'image
            if ($request->boolean('image_deleted')) {
                // Supprimer l'image existante
                $this->deleteImage($category->image);
                $category->image = null;
            } elseif ($request->hasFile('image')) {
                // Update image avec cleanup automatique
                $category->image = $this->updateCategoryImage($request->file('image'), $category->image);
            }

            // Mise à jour des autres champs
            $category->name = $validated['name'];
            $category->note = $validated['note'] ?? '';
            $category->parent_id = $validated['parent_id'] ?? null;
            $category->updated_by = auth()->id();
            $category->save();

            \Log::info('Product category data before commit: ', $category->toArray());

            DB::commit();

            \Log::info('Product category updated successfully: ', $category->fresh()->toArray());

            // Utiliser le même format de flash message que ProductController
            return redirect()->route('admin.categories.index')->with([
                'flash' => [
                    'success' => 'Catégorie mise à jour avec succès'
                ]
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            \Log::error('Category not found during update: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Catégorie non trouvée'])->withInput();
        } catch (ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation errors during category update: ', $e->errors());
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error updating category: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la mise à jour'])->withInput();
        }
    }

    /**
     * Display the specified category.
     */
    public function show(ProductCategory $category)
    {
        $category->load(['children', 'products']);
        $category->loadCount('products');
        
        return Inertia::render('Admin/Categories/show', [
            'category' => $category
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(ProductCategory $category)
    {
        $categories = ProductCategory::whereNull('deleted_at')
            ->where('status', true)
            ->where('id', '!=', $category->id)
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);

        return Inertia::render('Admin/Categories/edit', [
            'category' => $category,
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        $categories = ProductCategory::whereNull('deleted_at')
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);

        return Inertia::render('Admin/Categories/create', [
            'categories' => $categories
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function delete($id)
    {
        try {
            $category = ProductCategory::findOrFail($id);
            
            // Check if category has children
            if ($category->children()->exists()) {
                return back()->withErrors(['error' => 'Impossible de supprimer une catégorie qui a des sous-catégories']);
            }
            
            // Check if category has products
            if ($category->products()->exists()) {
                return back()->withErrors(['error' => 'Impossible de supprimer une catégorie qui contient des produits']);
            }

            // Delete image if exists
            if ($category->image && Storage::disk('public')->exists(str_replace('storage/', '', $category->image))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $category->image));
            }

            $category->delete();

            return redirect()->route('admin.categories.index')->with([
                'flash' => [
                    'success' => 'Catégorie supprimée avec succès'
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression']);
        }
    }
}
