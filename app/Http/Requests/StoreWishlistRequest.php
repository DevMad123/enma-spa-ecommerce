<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWishlistRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth('sanctum')->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
                // Vérifier que le produit n'est pas déjà dans la wishlist
                'unique:wishlists,product_id,NULL,id,user_id,' . auth('sanctum')->id()
            ]
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'L\'identifiant du produit est requis.',
            'product_id.integer' => 'L\'identifiant du produit doit être un nombre entier.',
            'product_id.exists' => 'Ce produit n\'existe pas.',
            'product_id.unique' => 'Ce produit est déjà dans votre liste de souhaits.',
        ];
    }
}
