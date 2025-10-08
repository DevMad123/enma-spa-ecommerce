<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
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

        $paymentMethod = PaymentMethod::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->sort_order ?? 0,
            'config' => $request->config ?? [],
        ]);

        return redirect()->route('admin.payment-methods.index')
            ->with('success', 'Méthode de paiement créée avec succès.');
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

        $paymentMethod->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->boolean('is_active'),
            'sort_order' => $request->sort_order ?? $paymentMethod->sort_order,
            'config' => $request->config ?? [],
        ]);

        return redirect()->route('admin.payment-methods.index')
            ->with('success', 'Méthode de paiement mise à jour avec succès.');
    }

    /**
     * Remove the specified payment method from storage.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();

        return redirect()->route('admin.payment-methods.index')
            ->with('success', 'Méthode de paiement supprimée avec succès.');
    }

    /**
     * Toggle the status of the specified payment method.
     */
    public function toggleStatus(PaymentMethod $paymentMethod)
    {
        $paymentMethod->update([
            'is_active' => !$paymentMethod->is_active
        ]);

        $status = $paymentMethod->is_active ? 'activée' : 'désactivée';

        return back()->with('success', "Méthode de paiement {$status} avec succès.");
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

        foreach ($request->items as $item) {
            PaymentMethod::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Ordre des méthodes de paiement mis à jour avec succès.');
    }
}
