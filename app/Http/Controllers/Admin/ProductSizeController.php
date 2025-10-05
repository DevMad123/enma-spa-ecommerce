<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductSize;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductSizeController extends Controller
{
    /**
     * Display a listing of the sizes.
     */
    public function index(Request $request)
    {
        $query = ProductSize::query()->withCount('products');

        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('size', 'like', '%' . $search . '%');
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $sizeList = $query->paginate($perPage)->appends($request->all());

        // Calcul des statistiques
        $stats = [
            'total_sizes' => ProductSize::count(),
            'sizes_with_products' => ProductSize::has('products')->count(),
            'sizes_without_products' => ProductSize::doesntHave('products')->count(),
            'most_used_size' => ProductSize::withCount('products')->orderBy('products_count', 'desc')->first(),
        ];

        return Inertia::render('Admin/Sizes/Index', [
            'title' => 'Liste des tailles',
            'sizeList' => $sizeList,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
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
     * Show the form for creating a new size.
     */
    public function create()
    {
        return Inertia::render('Admin/Sizes/Create', [
            'title' => 'Créer une taille',
        ]);
    }

    /**
     * Store a newly created size in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'size' => 'required|string|max:255|unique:product_sizes,size',
            ]);

            $size = ProductSize::create([
                'size' => $validated['size'],
            ]);

            DB::commit();

            return redirect()->route('admin.sizes.index')->with([
                'success' => 'Taille créée avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création de la taille: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création de la taille'])->withInput();
        }
    }

    /**
     * Display the specified size.
     */
    public function show(ProductSize $size)
    {
        $size->loadCount('products');
        $size->load(['products' => function($query) {
            $query->with(['category', 'brand'])->take(10);
        }]);

        return Inertia::render('Admin/Sizes/Show', [
            'title' => 'Détails de la taille - ' . $size->size,
            'size' => $size,
        ]);
    }

    /**
     * Show the form for editing the specified size.
     */
    public function edit(ProductSize $size)
    {
        return Inertia::render('Admin/Sizes/Edit', [
            'title' => 'Modifier la taille - ' . $size->size,
            'size' => $size,
        ]);
    }

    /**
     * Update the specified size in storage.
     */
    public function update(Request $request, ProductSize $size)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'size' => 'required|string|max:255|unique:product_sizes,size,' . $size->id,
            ]);

            $size->update([
                'size' => $validated['size'],
            ]);

            DB::commit();

            return redirect()->route('admin.sizes.index')->with([
                'success' => 'Taille modifiée avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la modification de la taille: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la modification de la taille'])->withInput();
        }
    }

    /**
     * Remove the specified size from storage.
     */
    public function destroy(ProductSize $size)
    {
        DB::beginTransaction();
        try {
            // Vérifier si la taille est utilisée par des produits
            if ($size->products()->count() > 0) {
                return back()->withErrors(['error' => 'Impossible de supprimer cette taille car elle est utilisée par ' . $size->products()->count() . ' produit(s).']);
            }

            $size->delete();
            DB::commit();

            return redirect()->route('admin.sizes.index')->with([
                'success' => 'Taille supprimée avec succès!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression de la taille: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression de la taille']);
        }
    }

    // Méthodes legacy pour compatibilité avec le modal existant
    public function storeSizes(Request $request)
    {
        return $this->store($request);
    }

    public function updateSizes(Request $request, $id)
    {
        $size = ProductSize::findOrFail($id);
        return $this->update($request, $size);
    }

    public function deleteSizes($id)
    {
        $size = ProductSize::findOrFail($id);
        return $this->destroy($size);
    }
}
