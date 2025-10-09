<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShippingRequest;
use App\Http\Requests\UpdateShippingRequest;
use App\Models\Shipping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ShippingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Shipping::with(['createdBy', 'updatedBy'])
                        ->withCount('sells');

        // Recherche
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtre par statut
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status);
        }

        // Tri
        $sortBy = $request->get('sort', 'sort_order');
        $sortDirection = $request->get('direction', 'asc');
        
        if (in_array($sortBy, ['name', 'price', 'is_active', 'sort_order', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->ordered();
        }

        $shippings = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Shippings/Index', [
            'shippings' => $shippings,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
            'stats' => [
                'total' => Shipping::count(),
                'active' => Shipping::active()->count(),
                'inactive' => Shipping::inactive()->count(),
                'total_orders' => Shipping::withCount('sells')->get()->sum('sells_count'),
            ],
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Shippings/create', [
            'maxSortOrder' => Shipping::max('sort_order') + 1,
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShippingRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $data['created_by'] = auth()->id();
            $data['updated_by'] = auth()->id();
            
            // Définir l'ordre si pas spécifié
            if (!isset($data['sort_order'])) {
                $data['sort_order'] = (Shipping::max('sort_order') ?? 0) + 1;
            }

            $shipping = Shipping::create($data);

            DB::commit();

            return redirect()
                ->route('admin.shippings.index')
                ->with('flash', ['success' => "Mode de livraison '{$shipping->name}' créé avec succès!"]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()
                ->back()
                ->withInput()
                ->with('flash', ['error' => 'Erreur lors de la création : ' . $e->getMessage()]);
        }
    }

    /**
     * Suppression groupée de modes de livraison (AJAX)
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:shippings,id'
        ]);

        try {
            DB::beginTransaction();

            $shippings = Shipping::whereIn('id', $request->ids)->get();
            $deletedCount = 0;

            foreach ($shippings as $shipping) {
                // Vérifier s'il y a des commandes liées
                if (!$shipping->sells()->exists()) {
                    $shipping->delete();
                    $deletedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$deletedCount mode(s) de livraison supprimé(s) avec succès!",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression groupée: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Activation groupée de modes de livraison (AJAX)
     */
    public function bulkActivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:shippings,id'
        ]);

        try {
            DB::beginTransaction();

            $count = Shipping::whereIn('id', $request->ids)
                            ->update(['is_active' => true, 'updated_by' => auth()->id()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$count mode(s) de livraison activé(s) avec succès!",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation groupée: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Désactivation groupée de modes de livraison (AJAX)
     */
    public function bulkDeactivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:shippings,id'
        ]);

        try {
            DB::beginTransaction();

            $count = Shipping::whereIn('id', $request->ids)
                            ->update(['is_active' => false, 'updated_by' => auth()->id()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$count mode(s) de livraison désactivé(s) avec succès!",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation groupée: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Exporter les modes de livraison en CSV
     */
    public function export(Request $request)
    {
        $query = Shipping::with(['createdBy'])->withCount('sells');

        // Appliquer les mêmes filtres que l'index
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status);
        }

        if ($request->filled('ids')) {
            $query->whereIn('id', explode(',', $request->ids));
        }

        $shippings = $query->get();

        $filename = 'modes_livraison_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($shippings) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, [
                'ID',
                'Nom',
                'Description',
                'Prix',
                'Délai (jours)',
                'Statut',
                'Commandes',
                'Date création',
            ]);

            // Données
            foreach ($shippings as $shipping) {
                fputcsv($file, [
                    $shipping->id,
                    $shipping->name,
                    $shipping->description ?? 'N/A',
                    number_format($shipping->price, 2) . ' XOF',
                    $shipping->estimated_days ?? 'N/A',
                    $shipping->is_active ? 'Actif' : 'Inactif',
                    $shipping->sells_count ?? 0,
                    $shipping->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display the specified resource.
     */
    public function show(Shipping $shipping)
    {
        $shipping->load(['createdBy', 'updatedBy']);
        
        // Statistiques des commandes liées
        $sellsStats = [
            'total' => $shipping->sells()->count(),
            'pending' => $shipping->sells()->where('shipping_status', 'pending')->count(),
            'in_progress' => $shipping->sells()->where('shipping_status', 'in_progress')->count(),
            'delivered' => $shipping->sells()->where('shipping_status', 'delivered')->count(),
            'cancelled' => $shipping->sells()->where('shipping_status', 'cancelled')->count(),
        ];

        return Inertia::render('Admin/Shippings/show', [
            'shipping' => $shipping,
            'sellsStats' => $sellsStats,
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shipping $shipping)
    {
        return Inertia::render('Admin/Shippings/edit', [
            'shipping' => $shipping,
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShippingRequest $request, Shipping $shipping)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $data['updated_by'] = auth()->id();

            $shipping->update($data);

            DB::commit();

            return redirect()
                ->route('admin.shippings.index')
                ->with('flash', ['success' => "Mode de livraison '{$shipping->name}' mis à jour avec succès!"]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()
                ->back()
                ->withInput()
                ->with('flash', ['error' => 'Erreur lors de la mise à jour : ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shipping $shipping)
    {
        try {
            DB::beginTransaction();

            // Vérifier s'il y a des commandes liées
            if ($shipping->sells()->exists()) {
                return redirect()
                    ->back()
                    ->with('flash', ['error' => 'Impossible de supprimer ce mode de livraison car il est utilisé dans des commandes.']);
            }

            $shippingName = $shipping->name;
            $shipping->delete();

            DB::commit();

            return redirect()
                ->route('admin.shippings.index')
                ->with('flash', ['success' => "Mode de livraison '{$shippingName}' supprimé avec succès!"]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()
                ->back()
                ->with('flash', ['error' => 'Erreur lors de la suppression : ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle shipping status (active/inactive)
     */
    public function toggleStatus(Shipping $shipping)
    {
        try {
            $shipping->toggleStatus();
            
            $status = $shipping->is_active ? 'activé' : 'désactivé';
            
            return response()->json([
                'success' => true,
                'message' => "Mode de livraison '{$shipping->name}' {$status} avec succès!",
                'is_active' => $shipping->is_active,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de statut : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get active shippings for forms (API endpoint)
     */
    public function getActiveShippings()
    {
        $shippings = Shipping::active()->ordered()->get();
        
        return response()->json([
            'shippings' => $shippings,
        ]);
    }

    /**
     * Bulk update sort order
     */
    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'shippings' => 'required|array',
            'shippings.*.id' => 'required|exists:shippings,id',
            'shippings.*.sort_order' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->shippings as $shippingData) {
                Shipping::where('id', $shippingData['id'])
                       ->update(['sort_order' => $shippingData['sort_order']]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ordre des modes de livraison mis à jour avec succès!',
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage(),
            ], 500);
        }
    }
}
