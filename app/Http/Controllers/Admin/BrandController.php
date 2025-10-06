<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BrandController extends Controller
{
    /**
     * Display a listing of the brands.
     */
    public function index(Request $request)
    {
        $query = Brand::query()->whereNull('deleted_at');

        // Ajouter le comptage des produits
        $query->withCount('products');

        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('slug', 'like', '%' . $search . '%');
            });
        }

        // Filtres par statut
        if ($request->filled('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $brandList = $query->paginate($perPage)->appends($request->all());

        // Calcul des statistiques
        $stats = [
            'total_brands' => Brand::whereNull('deleted_at')->count(),
            'active_brands' => Brand::whereNull('deleted_at')->where('status', true)->count(),
            'inactive_brands' => Brand::whereNull('deleted_at')->where('status', false)->count(),
            'brands_with_products' => Brand::whereNull('deleted_at')->has('products')->count(),
        ];

        return Inertia::render('Admin/Brands/Index', [
            'title' => 'Liste des marques',
            'brandList' => $brandList,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'per_page' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new brand.
     */
    public function create()
    {
        return Inertia::render('Admin/Brands/Create', [
            'title' => 'Créer une marque',
        ]);
    }

    /**
     * Store a newly created brand in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'description' => 'nullable|string|max:1000',
                'status' => 'nullable',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->brandImageSave($request->file('image'));
            }

            $brand = Brand::create([
                'name' => $validated['name'],
                'image' => $imagePath,
                'description' => $validated['description'] ?? '',
                'status' => $request->boolean('status'),
                'created_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('admin.brands.index')->with([
                'success' => 'Marque créée avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création de la marque: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création de la marque'])->withInput();
        }
    }

    /**
     * Display the specified brand.
     */
    public function show(Brand $brand)
    {
        $brand->loadCount('products');
        $brand->load(['products' => function($query) {
            $query->with(['category', 'supplier'])->take(10);
        }]);

        return Inertia::render('Admin/Brands/Show', [
            'title' => 'Détails de la marque - ' . $brand->name,
            'brand' => $brand,
        ]);
    }

    /**
     * Show the form for editing the specified brand.
     */
    public function edit(Brand $brand)
    {
        return Inertia::render('Admin/Brands/Edit', [
            'title' => 'Modifier la marque - ' . $brand->name,
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified brand in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        DB::beginTransaction();
        try {
            \Log::info('Brand update request data: ', $request->all());
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'description' => 'nullable|string|max:1000',
                'status' => 'nullable',
            ]);

            // Gérer l'image
            $imagePath = $brand->image;
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($brand->image) {
                    $oldImagePath = str_replace('storage/', '', $brand->image);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $imagePath = $this->brandImageSave($request->file('image'));
            }

            $brand->update([
                'name' => $validated['name'],
                'image' => $imagePath,
                'description' => $validated['description'] ?? '',
                'status' => $request->boolean('status'),
                'updated_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('admin.brands.index')->with([
                'success' => 'Marque modifiée avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la modification de la marque: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la modification de la marque'])->withInput();
        }
    }

    /**
     * Remove the specified brand from storage (soft delete).
     */
    public function destroy(Brand $brand)
    {
        // Debug log pour vérifier si la méthode est appelée
        Log::info('Tentative de suppression de la marque: ' . $brand->id);
        Log::info('Utilisateur connecté: ' . (auth()->check() ? auth()->id() : 'Non connecté'));
        
        DB::beginTransaction();
        try {
            // Vérifier si la marque a des produits
            if ($brand->products()->count() > 0) {
                Log::warning('Suppression refusée - marque avec produits: ' . $brand->id);
                return back()->withErrors(['error' => 'Impossible de supprimer cette marque car elle est associée à ' . $brand->products()->count() . ' produit(s).']);
            }

            // Utiliser la méthode delete() du trait SoftDeletes
            $brand->delete();
            Log::info('Marque supprimée avec succès: ' . $brand->id);

            DB::commit();

            return redirect()->route('admin.brands.index')->with([
                'success' => 'Marque supprimée avec succès!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression de la marque: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression de la marque']);
        }
    }

    /**
     * Save and optimize the brand image.
     */
    protected function brandImageSave($image)
    {
        if ($image) {
            $fileName = "brand-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'brand_icons/' . $fileName;

            $imageManager = new ImageManager(new GdDriver());
            $img = $imageManager->read($image);
            $img->resize(200, 200);
            $encodedImageContent = $img->toWebp(70);

            Storage::disk('public')->put($filePath, $encodedImageContent);

            return 'storage/' . $filePath;
        }
        return null;
    }

    /**
     * Suppression en lot
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:brands,id'
        ]);

        try {
            Brand::whereIn('id', $request->ids)->delete();
            
            return redirect()->route('admin.brands.index')
                ->with('success', count($request->ids) . ' marque(s) supprimée(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->route('admin.brands.index')
                ->with('error', 'Erreur lors de la suppression : ' . $e->getMessage());
        }
    }

    // ===========================
    // MÉTHODES LEGACY (compatibilité temporaire)
    // ===========================

    /**
     * Alias pour la liste des marques (legacy)
     */
    public function listBrands(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Alias pour la création de marque (legacy)
     */
    public function storeBrands(Request $request)
    {
        return $this->store($request);
    }

    /**
     * Alias pour la mise à jour de marque (legacy)
     */
    public function updateBrands(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        return $this->update($request, $brand);
    }

    /**
     * Alias pour la suppression de marque (legacy)
     */
    public function deleteBrands($id)
    {
        $brand = Brand::findOrFail($id);
        return $this->destroy($brand);
    }
}
