<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $customerId = $this->route('id') ?? $this->route('customer');

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('ecommerce_customers', 'email')->ignore($customerId)
            ],
            'phone_one' => ['nullable', 'string', 'max:20'],
            'phone_two' => ['nullable', 'string', 'max:20'],
            'present_address' => ['nullable', 'string', 'max:1000'],
            'permanent_address' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'status' => ['required', 'integer', 'in:0,1'],
            'image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream', 'mimes:jpg,jpeg,png,gif,webp,avif', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'email' => 'Email Address',
            'phone_one' => 'Primary Phone',
            'phone_two' => 'Secondary Phone',
            'present_address' => 'Present Address',
            'permanent_address' => 'Permanent Address',
            'password' => 'Password',
            'password_confirmation' => 'Password Confirmation',
            'status' => 'Status',
            'image' => 'Profile Image',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'The first name field is required.',
            'last_name.required' => 'The last name field is required.',
            'email.required' => 'The email address field is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.min' => 'The password must be at least 8 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
            'status.required' => 'The status field is required.',
            'status.in' => 'The selected status is invalid.',
            'image.image' => 'The file must be an image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, webp.',
            'image.max' => 'The image may not be greater than 2048 kilobytes.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Si le mot de passe est vide, on le retire pour ne pas le valider
        if (empty($this->password)) {
            $this->merge([
                'password' => null,
                'password_confirmation' => null,
            ]);
        }

        // Convertir le statut en entier
        if ($this->has('status')) {
            $this->merge([
                'status' => (int) $this->status,
            ]);
        }

        // Convertir remove_image en booléen
        if ($this->has('remove_image')) {
            $this->merge([
                'remove_image' => filter_var($this->remove_image, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
