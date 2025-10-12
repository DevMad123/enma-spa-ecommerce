<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Payment;

class StorePaymentRequest extends FormRequest
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
            'sell_id' => [
                'required',
                'integer',
                'exists:sells,id'
            ],
            'method' => [
                'required',
                'string',
                Rule::in(array_keys(Payment::METHODS))
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:999999.99'
            ],
            'currency' => [
                'sometimes',
                'string',
                'size:3'
            ],
            'transaction_reference' => [
                'nullable',
                'string',
                'max:255'
            ],
            // 'payment_date' => [  // Champ non existant dans payment_infos
            //     'sometimes',
            //     'date'
            // ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'metadata' => [
                'nullable',
                'array'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'sell_id.required' => 'La commande est obligatoire.',
            'sell_id.exists' => 'La commande sélectionnée n\'existe pas.',
            'method.required' => 'La méthode de paiement est obligatoire.',
            'method.in' => 'La méthode de paiement sélectionnée n\'est pas valide.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.numeric' => 'Le montant doit être un nombre.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'amount.max' => 'Le montant ne peut pas dépasser 999 999,99.',
            'currency.size' => 'La devise doit contenir exactement 3 caractères.',
            'transaction_reference.max' => 'La référence de transaction ne peut pas dépasser 255 caractères.',
            'payment_date.date' => 'La date de paiement doit être une date valide.',
            'notes.max' => 'Les notes ne peuvent pas dépasser 1000 caractères.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'currency' => $this->currency ?? 'XOF',
            'payment_date' => $this->payment_date ?? now(),
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->sell_id) {
                $sell = \App\Models\Sell::find($this->sell_id);
                if ($sell) {
                    $totalPaid = $sell->payments()->successful()->sum('total_paid');
                    $remainingAmount = $sell->total_payable_amount - $totalPaid;

                    if ($this->amount > $remainingAmount) {
                        $currency = $this->currency ?? 'XOF';
                        $validator->errors()->add(
                            'amount',
                            "Le montant ne peut pas dépasser le solde restant de {$remainingAmount} {$currency}."
                        );
                    }
                }
            }
        });
    }
}
