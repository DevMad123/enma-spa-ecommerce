<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FrontCustomizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'hero_enabled' => ['sometimes', 'boolean'],
            'hero_product_id' => ['nullable', 'exists:products,id'],
            'hero_background_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:255'],
            'featured_section_enabled' => ['sometimes', 'boolean'],
            'newsletter_enabled' => ['sometimes', 'boolean'],
            // strict HEX format: #RGB or #RRGGBB
            'theme_color' => ['nullable', 'string', 'max:20', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
            'logo_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],

            // Slides
            'slides' => ['sometimes', 'array'],
            'slides.*.product_id' => ['nullable', 'exists:products,id'],
            'slides.*.tagline' => ['nullable', 'string', 'max:255'],
            'slides.*.background_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'slides.*.enabled' => ['sometimes', 'boolean'],
            'slides.*.order' => ['nullable', 'integer', 'min:1', 'max:3'],
        ];
    }
}
