<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Traits\HandleImageUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SupplierController extends Controller
{
    use HandleImageUploads;

    /**
     * Display a listing of the suppliers.
     */
    public function index(Request $request)
    {
        $query = Supplier::query()->whereNull('deleted_at');

        // Ajouter le comptage des produits
        $query->withCount('products');

        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('supplier_name', 'like', '%' . $search . '%')
                  ->orWhere('company_name', 'like', '%' . $search . '%')
                  ->orWhere('supplier_email', 'like', '%' . $search . '%')
                  ->orWhere('company_email', 'like', '%' . $search . '%')
                  ->orWhere('supplier_phone_one', 'like', '%' . $search . '%');
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
        $supplierList = $query->paginate($perPage)->appends($request->all());

        // Calcul des statistiques
        $stats = [
            'total_suppliers' => Supplier::whereNull('deleted_at')->count(),
            'active_suppliers' => Supplier::whereNull('deleted_at')->where('status', true)->count(),
            'inactive_suppliers' => Supplier::whereNull('deleted_at')->where('status', false)->count(),
            'suppliers_with_products' => Supplier::whereNull('deleted_at')->has('products')->count(),
        ];

        return Inertia::render('Admin/Suppliers/Index', [
            'title' => 'Liste des fournisseurs',
            'supplierList' => $supplierList,
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
     * Show the form for creating a new supplier.
     */
    public function create()
    {
        return Inertia::render('Admin/Suppliers/Create', [
            'title' => 'Créer un fournisseur',
        ]);
    }

    /**
     * Store a newly created supplier in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'supplier_name' => 'required|string|max:255',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,gif,webp,avif|max:2048',
                'supplier_phone_one' => 'required|string|max:255',
                'supplier_phone_two' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
                'company_address' => 'nullable|string|max:500',
                'supplier_address' => 'nullable|string|max:500',
                'company_email' => 'nullable|email|max:255',
                'company_phone' => 'nullable|string|max:255',
                'supplier_email' => 'nullable|email|max:255',
                'previous_due' => 'nullable|numeric|min:0',
                'status' => 'nullable',
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->uploadSupplierImage($request->file('image'));
            }

            $supplier = Supplier::create([
                'supplier_name' => $validated['supplier_name'],
                'image' => $imagePath,
                'supplier_phone_one' => $validated['supplier_phone_one'],
                'supplier_phone_two' => $validated['supplier_phone_two'],
                'company_name' => $validated['company_name'],
                'company_address' => $validated['company_address'],
                'supplier_address' => $validated['supplier_address'],
                'company_email' => $validated['company_email'],
                'company_phone' => $validated['company_phone'],
                'supplier_email' => $validated['supplier_email'],
                'previous_due' => $validated['previous_due'] ?? 0,
                'status' => $request->boolean('status'), // Utiliser la méthode boolean() de Laravel
                'created_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('admin.suppliers.index')->with([
                'success' => 'Fournisseur créé avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création du fournisseur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création du fournisseur'])->withInput();
        }
    }

    /**
     * Display the specified supplier.
     */
    public function show(Supplier $supplier)
    {
        $supplier->loadCount('products');
        $supplier->load(['products' => function($query) {
            $query->with(['category', 'brand'])->take(10);
        }]);

        return Inertia::render('Admin/Suppliers/Show', [
            'title' => 'Détails du fournisseur - ' . $supplier->supplier_name,
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified supplier.
     */
    public function edit(Supplier $supplier)
    {
        return Inertia::render('Admin/Suppliers/Edit', [
            'title' => 'Modifier le fournisseur - ' . $supplier->supplier_name,
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified supplier in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        DB::beginTransaction();
        try {
            \Log::info('Supplier update request data: ', $request->all());
            $validated = $request->validate([
                'supplier_name' => 'required|string|max:255',
                'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,gif,webp,avif|max:2048',
                'supplier_phone_one' => 'required|string|max:255',
                'supplier_phone_two' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
                'company_address' => 'nullable|string|max:500',
                'supplier_address' => 'nullable|string|max:500',
                'company_email' => 'nullable|email|max:255',
                'company_phone' => 'nullable|string|max:255',
                'supplier_email' => 'nullable|email|max:255',
                'previous_due' => 'nullable|numeric|min:0',
                'status' => 'nullable',
            ]);

            // Gérer l'image
            $imagePath = $supplier->image;
            if ($request->hasFile('image')) {
                $imagePath = $this->updateSupplierImage($request->file('image'), $supplier->image);
            }

            $supplier->update([
                'supplier_name' => $validated['supplier_name'],
                'image' => $imagePath,
                'supplier_phone_one' => $validated['supplier_phone_one'],
                'supplier_phone_two' => $validated['supplier_phone_two'],
                'company_name' => $validated['company_name'],
                'company_address' => $validated['company_address'],
                'supplier_address' => $validated['supplier_address'],
                'company_email' => $validated['company_email'],
                'company_phone' => $validated['company_phone'],
                'supplier_email' => $validated['supplier_email'],
                'previous_due' => $validated['previous_due'] ?? 0,
                'status' => $request->boolean('status'), // Utiliser la méthode boolean() de Laravel
                'updated_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('admin.suppliers.index')->with([
                'success' => 'Fournisseur modifié avec succès!'
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la modification du fournisseur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la modification du fournisseur'])->withInput();
        }
    }

    /**
     * Remove the specified supplier from storage (soft delete).
     */
    public function destroy(Supplier $supplier)
    {
        DB::beginTransaction();
        try {
            // Vérifier si le fournisseur a des produits
            if ($supplier->products()->count() > 0) {
                return back()->withErrors(['error' => 'Impossible de supprimer ce fournisseur car il est associé à ' . $supplier->products()->count() . ' produit(s).']);
            }

            $supplier->update([
                'deleted_at' => now(),
                'deleted_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('admin.suppliers.index')->with([
                'success' => 'Fournisseur supprimé avec succès!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression du fournisseur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression du fournisseur']);
        }
    }
}
