<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
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
                // Vérifier que l'utilisateur n'a pas déjà écrit un avis pour ce produit
                'unique:product_reviews,product_id,NULL,id,user_id,' . auth('sanctum')->id()
            ],
            'rating' => [
                'required',
                'integer',
                'between:1,5'
            ],
            'comment' => [
                'nullable',
                'string',
                'max:1000'
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
            'product_id.unique' => 'Vous avez déjà écrit un avis pour ce produit.',
            'rating.required' => 'La note est requise.',
            'rating.integer' => 'La note doit être un nombre entier.',
            'rating.between' => 'La note doit être comprise entre 1 et 5.',
            'comment.string' => 'Le commentaire doit être une chaîne de caractères.',
            'comment.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
        ];
    }
}
