<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSellRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:ecommerce_customers,id',
            'shipping_cost' => 'nullable|numeric|min:0|max:9999999',
            'shipping_method' => 'nullable|string|max:255',
            'total_discount' => 'nullable|numeric|min:0|max:9999999',
            'payment_type' => 'nullable|integer|in:0,1',
            'payment_status' => 'nullable|integer|in:0,1,2,3',
            'order_status' => 'nullable|integer|in:0,1,2,3,4,5,6',
            'notes' => 'nullable|string|max:1000',
            'total_paid' => 'nullable|numeric|min:0|max:9999999',
            
            // Validation des articles de commande
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|numeric|min:0.01|max:9999',
            'items.*.unit_cost' => 'nullable|numeric|min:0|max:9999999',
            'items.*.discount' => 'nullable|numeric|min:0|max:9999999',
            'items.*.vat_percentage' => 'nullable|numeric|min:0|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Veuillez sélectionner un client.',
            'customer_id.exists' => 'Le client sélectionné n\'existe pas.',
            'shipping_cost.numeric' => 'Le coût de livraison doit être un nombre.',
            'shipping_cost.min' => 'Le coût de livraison ne peut pas être négatif.',
            'total_discount.numeric' => 'La remise totale doit être un nombre.',
            'total_discount.min' => 'La remise totale ne peut pas être négative.',
            'payment_type.in' => 'Le type de paiement sélectionné est invalide.',
            'payment_status.in' => 'Le statut de paiement sélectionné est invalide.',
            'order_status.in' => 'Le statut de commande sélectionné est invalide.',
            'notes.max' => 'Les notes ne peuvent pas dépasser 1000 caractères.',
            'total_paid.numeric' => 'Le montant payé doit être un nombre.',
            'total_paid.min' => 'Le montant payé ne peut pas être négatif.',
            
            // Messages pour les articles
            'items.required' => 'Vous devez ajouter au moins un article à la commande.',
            'items.array' => 'Les articles doivent être fournis sous forme de liste.',
            'items.min' => 'Vous devez ajouter au moins un article à la commande.',
            'items.*.product_id.required' => 'Chaque article doit avoir un produit sélectionné.',
            'items.*.product_id.exists' => 'Un des produits sélectionnés n\'existe pas.',
            'items.*.product_variant_id.exists' => 'Une des variantes sélectionnées n\'existe pas.',
            'items.*.quantity.required' => 'Chaque article doit avoir une quantité.',
            'items.*.quantity.numeric' => 'La quantité doit être un nombre.',
            'items.*.quantity.min' => 'La quantité doit être supérieure à 0.',
            'items.*.quantity.max' => 'La quantité ne peut pas dépasser 9999.',
            'items.*.unit_cost.numeric' => 'Le coût unitaire doit être un nombre.',
            'items.*.unit_cost.min' => 'Le coût unitaire ne peut pas être négatif.',
            'items.*.discount.numeric' => 'La remise doit être un nombre.',
            'items.*.discount.min' => 'La remise ne peut pas être négative.',
            'items.*.vat_percentage.numeric' => 'Le taux de TVA doit être un nombre.',
            'items.*.vat_percentage.min' => 'Le taux de TVA ne peut pas être négatif.',
            'items.*.vat_percentage.max' => 'Le taux de TVA ne peut pas dépasser 100%.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'client',
            'shipping_cost' => 'coût de livraison',
            'shipping_method' => 'méthode de livraison',
            'total_discount' => 'remise totale',
            'payment_type' => 'type de paiement',
            'payment_status' => 'statut de paiement',
            'order_status' => 'statut de commande',
            'notes' => 'notes',
            'total_paid' => 'montant payé',
            'items' => 'articles',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Nettoyer et préparer les données si nécessaire
        if ($this->has('shipping_cost')) {
            $this->merge([
                'shipping_cost' => $this->shipping_cost ?: 0
            ]);
        }

        if ($this->has('total_discount')) {
            $this->merge([
                'total_discount' => $this->total_discount ?: 0
            ]);
        }

        if ($this->has('total_paid')) {
            $this->merge([
                'total_paid' => $this->total_paid ?: 0
            ]);
        }
    }
}
