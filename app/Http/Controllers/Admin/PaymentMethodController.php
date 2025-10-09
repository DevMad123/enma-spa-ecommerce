<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the payment methods.
     */
    public function index()
    {
        $paymentMethods = PaymentMethod::ordered()->get();

        return Inertia::render('Admin/PaymentMethods/Index', [
            'paymentMethods' => $paymentMethods,
            'localeConfig' => get_js_locale_config()
        ]);
    }

    /**
     * Show the form for creating a new payment method.
     */
    public function create()
    {
        $availableMethods = [
            'paypal' => 'PayPal',
            'orange_money' => 'Orange Money',
            'mtn_money' => 'MTN Money',
            'wave' => 'Wave',
            'moov_money' => 'Moov Money',
            'visa' => 'VISA',
            'cash_on_delivery' => 'Paiement à la livraison',
        ];

        return Inertia::render('Admin/PaymentMethods/Create', [
            'availableMethods' => $availableMethods,
            'localeConfig' => get_js_locale_config()
        ]);
    }

    /**
     * Store a newly created payment method in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'config' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $paymentMethod = PaymentMethod::create([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $request->sort_order ?? ((PaymentMethod::max('sort_order') ?? 0) + 1),
                'config' => $request->config ?? [],
            ]);

            DB::commit();

            return redirect()
                ->route('admin.payment-methods.index')
                ->with('flash', ['success' => "Méthode de paiement '{$paymentMethod->name}' créée avec succès!"]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()
                ->back()
                ->withInput()
                ->with('flash', ['error' => 'Erreur lors de la création : ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified payment method.
     */
    public function show(PaymentMethod $paymentMethod)
    {
        return Inertia::render('Admin/PaymentMethods/Show', [
            'paymentMethod' => $paymentMethod,
            'localeConfig' => get_js_locale_config()
        ]);
    }

    /**
     * Show the form for editing the specified payment method.
     */
    public function edit(PaymentMethod $paymentMethod)
    {
        return Inertia::render('Admin/PaymentMethods/Edit', [
            'paymentMethod' => $paymentMethod,
            'localeConfig' => get_js_locale_config()
        ]);
    }

    /**
     * Update the specified payment method in storage.
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('payment_methods', 'code')->ignore($paymentMethod->id)
            ],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'config' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $paymentMethod->update([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active'),
                'sort_order' => $request->sort_order ?? $paymentMethod->sort_order,
                'config' => $request->config ?? [],
            ]);

            DB::commit();

            return redirect()
                ->route('admin.payment-methods.index')
                ->with('flash', ['success' => "Méthode de paiement '{$paymentMethod->name}' mise à jour avec succès!"]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()
                ->back()
                ->withInput()
                ->with('flash', ['error' => 'Erreur lors de la mise à jour : ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified payment method from storage.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        try {
            DB::beginTransaction();

            // Vérifier s'il y a des commandes liées (si relation existe)
            // Note: Ajustez selon votre modèle de données
            /*
            if ($paymentMethod->sells()->exists()) {
                return redirect()
                    ->back()
                    ->with('flash', ['error' => 'Impossible de supprimer cette méthode de paiement car elle est utilisée dans des commandes.']);
            }
            */

            $paymentMethodName = $paymentMethod->name;
            $paymentMethod->delete();

            DB::commit();

            return redirect()
                ->route('admin.payment-methods.index')
                ->with('flash', ['success' => "Méthode de paiement '{$paymentMethodName}' supprimée avec succès!"]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()
                ->back()
                ->with('flash', ['error' => 'Erreur lors de la suppression : ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle the status of the specified payment method.
     */
    public function toggleStatus(PaymentMethod $paymentMethod)
    {
        try {
            $paymentMethod->update([
                'is_active' => !$paymentMethod->is_active
            ]);

            $status = $paymentMethod->is_active ? 'activée' : 'désactivée';

            return response()->json([
                'success' => true,
                'message' => "Méthode de paiement '{$paymentMethod->name}' {$status} avec succès!",
                'is_active' => $paymentMethod->is_active,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de statut : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the sort order of payment methods.
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:payment_methods,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->items as $item) {
                PaymentMethod::where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ordre des méthodes de paiement mis à jour avec succès!',
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Suppression groupée de méthodes de paiement (AJAX)
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:payment_methods,id'
        ]);

        try {
            DB::beginTransaction();

            $paymentMethods = PaymentMethod::whereIn('id', $request->ids)->get();
            $deletedCount = 0;

            foreach ($paymentMethods as $paymentMethod) {
                // Vérifier s'il y a des commandes liées (si relation existe)
                // Note: Ajustez selon votre modèle de données
                /*
                if (!$paymentMethod->sells()->exists()) {
                    $paymentMethod->delete();
                    $deletedCount++;
                }
                */
                $paymentMethod->delete();
                $deletedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$deletedCount méthode(s) de paiement supprimée(s) avec succès!",
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
     * Activation groupée de méthodes de paiement (AJAX)
     */
    public function bulkActivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:payment_methods,id'
        ]);

        try {
            DB::beginTransaction();

            $count = PaymentMethod::whereIn('id', $request->ids)
                            ->update(['is_active' => true]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$count méthode(s) de paiement activée(s) avec succès!",
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
     * Désactivation groupée de méthodes de paiement (AJAX)
     */
    public function bulkDeactivate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:payment_methods,id'
        ]);

        try {
            DB::beginTransaction();

            $count = PaymentMethod::whereIn('id', $request->ids)
                            ->update(['is_active' => false]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$count méthode(s) de paiement désactivée(s) avec succès!",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation groupée: ' . $e->getMessage(),
            ], 422);
        }
    }
}
