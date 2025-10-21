<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use App\Models\ProductSubCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Inertia\Inertia;
use Image;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Facades\Log;

class ProductSubcategoryController extends Controller
{
    /**
     * Display a list of product subcategories.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function index(Request $request)
    {
        // Start a new query for the ProductSubCategory model
        $query = ProductSubCategory::query()
            ->with(['category', 'products']) // Eager load parent categories and products
            ->withCount('products') // Count products for each subcategory
            ->whereNull('deleted_at');

        // Global search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('category', function($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
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

        if ($sort === 'category') {
        //     $query->join('product_categories', 'product_sub_categories.category_id', '=', 'product_categories.id')
        //         ->select('product_sub_categories.*')
        //         ->orderBy('product_categories.name', $direction);
        } else {
            $query->orderBy('product_sub_categories.' . $sort, $direction);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $subcategoryList = $query->paginate($perPage)->appends($request->all());

        // Get categories for filter dropdown
        $categories = ProductCategory::where('status', 1)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Calculate statistics
        $stats = [
            'total_subcategories' => ProductSubCategory::whereNull('deleted_at')->count(),
            'active_subcategories' => ProductSubCategory::whereNull('deleted_at')->where('status', 1)->count(),
            'subcategories_with_products' => ProductSubCategory::whereNull('deleted_at')->has('products')->count(),
            'subcategories_by_category' => ProductSubCategory::whereNull('deleted_at')
                ->with('category')
                ->get()
                ->groupBy('category.name')
                ->map->count()
                ->take(5)
        ];

        // Return the Inertia view with the necessary data
        return Inertia::render('Admin/Subcategories/Index', [
            'title' => 'Subcategory List',
            'subcategoryList' => $subcategoryList,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'category_id' => $request->category_id,
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
                'products_count_filter' => $request->products_count_filter ?? '',
                'per_page' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'categoryList' => $categories, // Pour les filtres et modal
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
        ]);
    }

    /**
     * Store a newly created product subcategory in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product subcategory store request data: ', $request->all());

            // Décoder les JSON strings si nécessaire (pour la cohérence avec ProductController)
            $requestData = $request->all();

            // Validation
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:product_categories,id',
                'note' => 'nullable|string',
                'status' => 'required|in:0,1',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->subcategoryImageSave($request->file('image'));
            }

            $subcategory = new ProductSubCategory();
            $subcategory->name = $validated['name'];
            $subcategory->category_id = $validated['category_id'];
            $subcategory->note = $validated['note'] ?? '';
            $subcategory->status = $validated['status'];
            $subcategory->image = $imagePath;
            $subcategory->created_by = auth()->id();
            $subcategory->save();

            \Log::info('Product subcategory data before commit: ', $subcategory->toArray());

            DB::commit();

            \Log::info('Product subcategory data after commit: ', $subcategory->fresh()->toArray());

            // Utiliser le même format de flash message que ProductController
            return redirect()->route('admin.subcategories.index')->with([
                'flash' => [
                    'success' => 'Subcategory created successfully!'
                ]
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation errors during subcategory creation: ', $e->errors());
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating subcategory: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création'])->withInput();
        }
    }

    /**
     * Update the specified product subcategory in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product subcategory update request data: ', $request->all());

            // Décoder les JSON strings si nécessaire
            $requestData = $request->all();

            // Validation - utiliser des règles compatibles avec FormData
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:product_categories,id',
                'note' => 'nullable|string',
                'status' => 'nullable',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'image_deleted' => 'nullable'
            ]);

            $subcategory = ProductSubCategory::findOrFail($id);

            // Gérer l'image
            if ($request->boolean('image_deleted')) {
                // Supprimer l'image existante
                if ($subcategory->image) {
                    $oldImagePath = str_replace('storage/', '', $subcategory->image);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $subcategory->image = null;
            } elseif ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($subcategory->image) {
                    $oldImagePath = str_replace('storage/', '', $subcategory->image);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                // Sauvegarder la nouvelle image
                $subcategory->image = $this->subcategoryImageSave($request->file('image'));
            }

            $subcategory->name = $validated['name'];
            $subcategory->category_id = $validated['category_id'];
            $subcategory->note = $validated['note'] ?? '';
            // Convertir le booléen explicitement
            $subcategory->status = $request->boolean('status');
            $subcategory->updated_by = auth()->id();
            $subcategory->save();

            \Log::info('Product subcategory data before commit: ', $subcategory->toArray());

            DB::commit();

            \Log::info('Product subcategory data after commit: ', $subcategory->fresh()->toArray());

            // Utiliser le même format de flash message que ProductController
            return redirect()->route('admin.subcategories.index')->with([
                'flash' => [
                    'success' => 'Subcategory updated successfully!'
                ]
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            \Log::error('Subcategory not found during update: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Sous-catégorie non trouvée'])->withInput();
        } catch (ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation errors during subcategory update: ', $e->errors());
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error updating subcategory: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la mise à jour'])->withInput();
        }
    }

    /**
     * Sauvegarde l'image de la sous-catégorie avec redimensionnement et optimisation.
     *
     * @param  \Illuminate\Http\UploadedFile $image
     * @return string|null
     */
    protected function subcategoryImageSave($image)
    {
        if ($image) {
            $fileName = "subcategory-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'subcategory_images/' . $fileName;

            // Créer l'instance du gestionnaire d'image
            $imageManager = new ImageManager(new GdDriver());

            // Charger l'image téléchargée pour la manipulation
            try {
                $img = $imageManager->read($image);
            } catch (\Throwable $e) {
                \Log::warning('GD failed to read subcategory image, trying Imagick: ' . $e->getMessage());
                try {
                    $imageManager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                    $img = $imageManager->read($image);
                } catch (\Throwable $e2) {
                    \Log::error('Imagick failed to read subcategory image: ' . $e2->getMessage());
                    throw ValidationException::withMessages([
                        'image' => "Format d'image non supporté (activez AVIF ou utilisez JPG/PNG/WEBP)."
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

    /**
     * Remove the specified subcategory from storage (soft delete).
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function delete($id)
    {
        DB::beginTransaction();

        try {
            $subcategory = ProductSubCategory::findOrFail($id);

            $subcategory->deleted_at = now();
            $subcategory->deleted_by = auth()->id();
            $subcategory->save();

            DB::commit();

            return redirect()->route('admin.subcategories.index')->with([
                'flash' => [
                    'success' => 'Subcategory deleted successfully!'
                ]
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Sous-catégorie non trouvée']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting subcategory: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression']);
        }
    }
    /**
     * Show the form for creating a new subcategory.
     */
    public function create()
    {
        $categories = ProductCategory::where('status', 1)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Subcategories/create', [
            'categories' => $categories
        ]);
    }

    /**
     * Display the specified subcategory.
     */
    public function show(ProductSubCategory $subcategory)
    {
        $subcategory->load(['category', 'products']);
        $subcategory->loadCount('products');

        return Inertia::render('Admin/Subcategories/show', [
            'subcategory' => $subcategory
        ]);
    }

    /**
     * Show the form for editing the specified subcategory.
     */
    public function edit(ProductSubCategory $subcategory)
    {
        $categories = ProductCategory::where('status', 1)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Subcategories/edit', [
            'subcategory' => $subcategory,
            'categories' => $categories
        ]);
    }
}
