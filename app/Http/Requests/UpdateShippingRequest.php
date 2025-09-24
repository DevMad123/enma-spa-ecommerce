<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShippingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autorisation gérée par middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $shipping = $this->route('shipping');
        
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('shippings', 'name')->ignore($shipping->id)],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'estimated_days' => ['nullable', 'integer', 'min:0', 'max:365'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nom du mode de livraison',
            'price' => 'prix',
            'description' => 'description',
            'is_active' => 'statut actif',
            'sort_order' => 'ordre d\'affichage',
            'estimated_days' => 'délai estimé en jours',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du mode de livraison est obligatoire.',
            'name.unique' => 'Ce nom de mode de livraison existe déjà.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'price.max' => 'Le prix ne peut pas dépasser 999 999,99.',
            'estimated_days.min' => 'Le délai estimé ne peut pas être négatif.',
            'estimated_days.max' => 'Le délai estimé ne peut pas dépasser 365 jours.',
        ];
    }
}
