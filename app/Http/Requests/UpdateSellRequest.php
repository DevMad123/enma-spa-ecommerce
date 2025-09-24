<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSellRequest extends FormRequest
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
            'payment_status' => 'nullable|integer|in:0,1,2,3',
            'order_status' => 'nullable|integer|in:0,1,2,3,4,5,6',
            'shipping_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'total_paid' => 'nullable|numeric|min:0|max:9999999',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payment_status.in' => 'Le statut de paiement sélectionné est invalide.',
            'order_status.in' => 'Le statut de commande sélectionné est invalide.',
            'shipping_method.max' => 'La méthode de livraison ne peut pas dépasser 255 caractères.',
            'notes.max' => 'Les notes ne peuvent pas dépasser 1000 caractères.',
            'total_paid.numeric' => 'Le montant payé doit être un nombre.',
            'total_paid.min' => 'Le montant payé ne peut pas être négatif.',
            'total_paid.max' => 'Le montant payé est trop élevé.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'payment_status' => 'statut de paiement',
            'order_status' => 'statut de commande',
            'shipping_method' => 'méthode de livraison',
            'notes' => 'notes',
            'total_paid' => 'montant payé',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Nettoyer les données si nécessaire
        if ($this->has('total_paid')) {
            $this->merge([
                'total_paid' => $this->total_paid ?: 0
            ]);
        }
    }
}
