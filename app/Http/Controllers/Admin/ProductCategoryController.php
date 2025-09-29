<?php

namespace App\Http\Controllers\Admin;


use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;
use App\Models\ProductCategory;
use App\Models\ProductSubCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class ProductCategoryController extends Controller
{
     /**
     * Display a list of product categories.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function listCategory(Request $request)
    {
        // Start a new query for the ProductCategory model, excluding deleted records.
        $query = ProductCategory::query()
            ->with(['subcategory', 'products']) // Eager load subcategories and products
            ->withCount('products') // Count products for each category
            ->whereNull('deleted_at');

        // Global search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('note', 'like', "%$search%")
                  ->orWhere('slug', 'like', "%$search%");
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
        return Inertia::render('Admin/categories/Index', [
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
    public function storeCategory(Request $request)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product category store request data: ', $request->all());

            // Décoder les JSON strings si nécessaire (pour la cohérence avec ProductController)
            $requestData = $request->all();
            
            // Validation
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_categories,name',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
                'note' => 'nullable|string',
                'is_popular' => 'required|in:0,1',
                'status' => 'required|in:0,1'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->categoryImageSave($request->file('image'));
            }

            $category = new ProductCategory();
            $category->name = $validated['name'];
            $category->note = $validated['note'] ?? '';
            $category->is_popular = $validated['is_popular'];
            $category->status = $validated['status'];
            $category->image = $imagePath;
            $category->created_by = auth()->id();
            $category->save();

            \Log::info('Product category data before commit: ', $category->toArray());

            DB::commit();

            \Log::info('Product category data after commit: ', $category->fresh()->toArray());

            // Utiliser le même format de flash message que ProductController
            return redirect()->route('admin.categories.list')->with([
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
            $img = $imageManager->read($image);
            
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

            $logo_image = Image::make(file_get_contents($image))->resize(400, 400);
            $logo_image->brightness(8);
            $logo_image->contrast(11);
            $logo_image->sharpen(5);
            $logo_image->encode('webp', 70);
            $logo_image->save($logo_path);

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
    public function updateCategory(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product category update request data: ', $request->all());

            // Décoder les JSON strings si nécessaire (pour la cohérence avec ProductController)
            $requestData = $request->all();

            // Trouver la catégorie
            $category = ProductCategory::findOrFail($id);

            // Validation
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_categories,name,' . $id,
                'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
                'note' => 'nullable|string',
                'is_popular' => 'required|in:0,1',
                'status' => 'required|in:0,1'
            ]);

            // Gestion de l'image
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($category->image) {
                    $oldPath = str_replace('storage/', '', $category->image);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
                
                // Sauvegarder la nouvelle image
                $category->image = $this->categoryImageSave($request->file('image'));
            }

            // Mise à jour des autres champs
            $category->name = $validated['name'];
            $category->note = $validated['note'] ?? '';
            $category->is_popular = $validated['is_popular'];
            $category->status = $validated['status'];
            $category->updated_by = auth()->id();
            $category->save();

            \Log::info('Product category data before commit: ', $category->toArray());

            DB::commit();

            \Log::info('Product category updated successfully: ', $category->fresh()->toArray());

            // Utiliser le même format de flash message que ProductController
            return redirect()->route('admin.categories.list')->with([
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
}
