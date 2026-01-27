<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TaxRuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $query = TaxRule::query();
        
        // Recherche par nom ou code pays - Sécurisée
        if (request('search')) {
            $search = request('search');
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function ($q) use ($searchPattern) {
                $q->where('country_name', 'like', $searchPattern)
                  ->orWhere('country_code', 'like', $searchPattern);
            });
        }
        
        // Filtre par statut
        if (request('status')) {
            if (request('status') === 'active') {
                $query->where('is_active', true);
            } elseif (request('status') === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        // Filtre par livraison
        if (request('delivery')) {
            if (request('delivery') === 'allowed') {
                $query->where('delivery_allowed', true);
            } elseif (request('delivery') === 'not_allowed') {
                $query->where('delivery_allowed', false);
            }
        }
        
        // Filtre par défaut
        if (request('is_default')) {
            if (request('is_default') === 'default') {
                $query->where('is_default', true);
            } elseif (request('is_default') === 'not_default') {
                $query->where('is_default', false);
            }
        }
        
        // Tri
        $sortBy = request('sort_by', 'country_name');
        $sortOrder = request('sort_order', 'asc');
        
        $allowedSortFields = ['country_name', 'country_code', 'tax_rate', 'min_order_amount', 'created_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('country_name', 'asc');
        }
        
        // Statistiques pour le dashboard
        $stats = [
            'total' => TaxRule::count(),
            'active' => TaxRule::where('is_active', true)->count(),
            'with_delivery' => TaxRule::where('delivery_allowed', true)->count(),
            'default_country' => TaxRule::where('is_default', true)->first()?->country_name,
            'average_tax_rate' => TaxRule::where('is_active', true)->avg('tax_rate') ?? 0
        ];
        
        $taxRules = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/TaxRules/Index', [
            'taxRules' => $taxRules,
            'filters' => request()->only(['search', 'status', 'delivery', 'is_default', 'sort_by', 'sort_order']),
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/TaxRules/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'country_code' => 'required|string|size:2|unique:tax_rules,country_code',
            'country_name' => 'required|string|max:100',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'is_default' => 'boolean',
            'delivery_allowed' => 'boolean',
            'is_active' => 'boolean',
            'delivery_zones' => 'nullable|array',
            'min_order_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Convertir le code pays en majuscules
        $validated['country_code'] = strtoupper($validated['country_code']);

        TaxRule::create($validated);

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', 'Règle de TVA créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TaxRule $taxRule): Response
    {
        return Inertia::render('Admin/TaxRules/Show', [
            'taxRule' => $taxRule
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TaxRule $taxRule): Response
    {
        return Inertia::render('Admin/TaxRules/Edit', [
            'taxRule' => $taxRule
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaxRule $taxRule): RedirectResponse
    {
        $validated = $request->validate([
            'country_code' => 'required|string|size:2|unique:tax_rules,country_code,' . $taxRule->id,
            'country_name' => 'required|string|max:100',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'is_default' => 'boolean',
            'delivery_allowed' => 'boolean',
            'is_active' => 'boolean',
            'delivery_zones' => 'nullable|array',
            'min_order_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Convertir le code pays en majuscules
        $validated['country_code'] = strtoupper($validated['country_code']);

        $taxRule->update($validated);

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', 'Règle de TVA mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaxRule $taxRule): RedirectResponse
    {
        // Empêcher la suppression du pays par défaut
        if ($taxRule->is_default) {
            return redirect()
                ->route('admin.tax-rules.index')
                ->with('error', 'Impossible de supprimer le pays par défaut.');
        }

        $taxRule->delete();

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', 'Règle de TVA supprimée avec succès.');
    }

    /**
     * Définir un pays comme défaut
     */
    public function setDefault(TaxRule $taxRule): RedirectResponse
    {
        $taxRule->update(['is_default' => true]);

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', "Le pays {$taxRule->country_name} est maintenant défini par défaut.");
    }

    /**
     * Basculer le statut actif/inactif
     */
    public function toggleActive(TaxRule $taxRule): RedirectResponse
    {
        $taxRule->update(['is_active' => !$taxRule->is_active]);

        $status = $taxRule->is_active ? 'activée' : 'désactivée';
        
        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', "Règle de TVA {$status} avec succès.");
    }

    /**
     * API pour récupérer les informations de TVA d'un pays
     */
    public function getTaxInfo(string $countryCode)
    {
        $taxRule = TaxRule::getByCountryCode($countryCode);
        
        if (!$taxRule) {
            $taxRule = TaxRule::getDefault();
        }

        if (!$taxRule) {
            return response()->json([
                'error' => 'Aucune règle de TVA configurée'
            ], 404);
        }

        return response()->json([
            'country_code' => $taxRule->country_code,
            'country_name' => $taxRule->country_name,
            'tax_rate' => $taxRule->tax_rate,
            'delivery_allowed' => $taxRule->delivery_allowed,
            'min_order_amount' => $taxRule->min_order_amount
        ]);
    }

    /**
     * API pour calculer la TVA
     */
    public function calculateTax(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'country_code' => 'required|string|size:2'
        ]);

        $taxRule = TaxRule::getByCountryCode($request->country_code);
        
        if (!$taxRule) {
            $taxRule = TaxRule::getDefault();
        }

        if (!$taxRule) {
            return response()->json([
                'error' => 'Aucune règle de TVA configurée'
            ], 404);
        }

        $amount = (float) $request->amount;
        $taxAmount = $taxRule->calculateTax($amount);
        $totalWithTax = $taxRule->calculateTotalWithTax($amount);

        return response()->json([
            'amount_ht' => $amount,
            'tax_rate' => $taxRule->tax_rate,
            'tax_amount' => $taxAmount,
            'amount_ttc' => $totalWithTax,
            'delivery_possible' => $taxRule->isDeliveryPossible($amount),
            'country_info' => [
                'code' => $taxRule->country_code,
                'name' => $taxRule->country_name
            ]
        ]);
    }

    /**
     * Actions en lot - Activer plusieurs règles
     */
    public function bulkActivate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tax_rules,id'
        ]);

        $count = TaxRule::whereIn('id', $request->ids)->update(['is_active' => true]);

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', "{$count} règle(s) de TVA activée(s) avec succès.");
    }

    /**
     * Actions en lot - Désactiver plusieurs règles
     */
    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tax_rules,id'
        ]);

        $count = TaxRule::whereIn('id', $request->ids)->update(['is_active' => false]);

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', "{$count} règle(s) de TVA désactivée(s) avec succès.");
    }

    /**
     * Actions en lot - Supprimer plusieurs règles
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tax_rules,id'
        ]);

        // Empêcher la suppression des pays par défaut
        $defaultRules = TaxRule::whereIn('id', $request->ids)->where('is_default', true)->count();
        
        if ($defaultRules > 0) {
            return redirect()
                ->route('admin.tax-rules.index')
                ->with('error', 'Impossible de supprimer des pays par défaut.');
        }

        $count = TaxRule::whereIn('id', $request->ids)->delete();

        return redirect()
            ->route('admin.tax-rules.index')
            ->with('success', "{$count} règle(s) de TVA supprimée(s) avec succès.");
    }

    /**
     * Exporter les règles de TVA
     */
    public function export(Request $request)
    {
        $query = TaxRule::query();
        
        // Appliquer les mêmes filtres que l'index
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('country_name', 'like', "%{$search}%")
                  ->orWhere('country_code', 'like', "%{$search}%");
            });
        }
        
        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }
        
        if ($request->delivery === 'allowed') {
            $query->where('delivery_allowed', true);
        } elseif ($request->delivery === 'not_allowed') {
            $query->where('delivery_allowed', false);
        }
        
        if ($request->is_default === 'default') {
            $query->where('is_default', true);
        } elseif ($request->is_default === 'not_default') {
            $query->where('is_default', false);
        }
        
        $taxRules = $query->orderBy('country_name')->get();
        
        $filename = 'regles-tva-' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($taxRules) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, [
                'Code Pays',
                'Nom du Pays', 
                'Taux TVA (%)',
                'Montant Minimum',
                'Livraison Autorisée',
                'Statut',
                'Par Défaut',
                'Date de Création'
            ]);
            
            // Données
            foreach ($taxRules as $rule) {
                fputcsv($file, [
                    $rule->country_code,
                    $rule->country_name,
                    $rule->tax_rate,
                    $rule->min_order_amount ?: 0,
                    $rule->delivery_allowed ? 'Oui' : 'Non',
                    $rule->is_active ? 'Actif' : 'Inactif',
                    $rule->is_default ? 'Oui' : 'Non',
                    $rule->created_at->format('d/m/Y H:i')
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}
