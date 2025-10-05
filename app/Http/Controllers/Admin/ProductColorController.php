<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductColor;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductColorController extends Controller
{
    /**
     * Display a listing of the colors.
     */
    public function index(Request $request)
    {
        $query = ProductColor::query()->withCount('products');

        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('color_code', 'like', '%' . $search . '%');
            });
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $colorList = $query->paginate($perPage)->appends($request->all());

        // Calcul des statistiques
        $stats = [
            'total_colors' => ProductColor::count(),
            'colors_with_products' => ProductColor::has('products')->count(),
            'colors_without_products' => ProductColor::doesntHave('products')->count(),
            'most_used_color' => ProductColor::withCount('products')->orderBy('products_count', 'desc')->first(),
        ];

        return Inertia::render('Admin/Colors/Index', [
            'title' => 'Liste des couleurs',
            'colorList' => $colorList,
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
     * Show the form for creating a new color.
     */
    public function create()
    {
        return Inertia::render('Admin/Colors/Create', [
            'title' => 'Créer une couleur',
        ]);
    }

    /**
     * Store a newly created color in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_colors,name',
                'color_code' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            ]);

            $color = ProductColor::create([
                'name' => $validated['name'],
                'color_code' => $validated['color_code'],
            ]);

            DB::commit();

            return redirect()->route('admin.colors.index')->with([
                'success' => 'Couleur créée avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création de la couleur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création de la couleur'])->withInput();
        }
    }

    /**
     * Display the specified color.
     */
    public function show(ProductColor $color)
    {
        $color->loadCount('products');
        $color->load(['products' => function($query) {
            $query->with(['category', 'brand'])->take(10);
        }]);

        return Inertia::render('Admin/Colors/Show', [
            'title' => 'Détails de la couleur - ' . $color->name,
            'color' => $color,
        ]);
    }

    /**
     * Show the form for editing the specified color.
     */
    public function edit(ProductColor $color)
    {
        return Inertia::render('Admin/Colors/Edit', [
            'title' => 'Modifier la couleur - ' . $color->name,
            'color' => $color,
        ]);
    }

    /**
     * Update the specified color in storage.
     */
    public function update(Request $request, ProductColor $color)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:product_colors,name,' . $color->id,
                'color_code' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            ]);

            $color->update([
                'name' => $validated['name'],
                'color_code' => $validated['color_code'],
            ]);

            DB::commit();

            return redirect()->route('admin.colors.index')->with([
                'success' => 'Couleur modifiée avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la modification de la couleur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la modification de la couleur'])->withInput();
        }
    }

    /**
     * Remove the specified color from storage.
     */
    public function destroy(ProductColor $color)
    {
        DB::beginTransaction();
        try {
            // Vérifier si la couleur est utilisée par des produits
            if ($color->products()->count() > 0) {
                return back()->withErrors(['error' => 'Impossible de supprimer cette couleur car elle est utilisée par ' . $color->products()->count() . ' produit(s).']);
            }

            $color->delete();
            DB::commit();

            return redirect()->route('admin.colors.index')->with([
                'success' => 'Couleur supprimée avec succès!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression de la couleur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression de la couleur']);
        }
    }

    // Méthodes legacy pour compatibilité avec le modal existant
    public function storeColors(Request $request)
    {
        return $this->store($request);
    }

    public function updateColors(Request $request, $id)
    {
        $color = ProductColor::findOrFail($id);
        return $this->update($request, $color);
    }

    public function deleteColors($id)
    {
        $color = ProductColor::findOrFail($id);
        return $this->destroy($color);
    }
}
