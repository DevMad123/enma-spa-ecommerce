<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FrontCustomization;
use App\Models\FrontCustomizationSlide;
use Illuminate\Support\Facades\Cache;

class CustomizationController extends Controller
{
    public function show()
    {
        $data = Cache::remember('front_customizations', 600, function () {
            $customization = FrontCustomization::with(['heroProduct:id,name,previous_sale_price,current_sale_price'])->first();

            if (!$customization) {
                return [
                    'hero_enabled' => false,
                    'featured_section_enabled' => true,
                    'newsletter_enabled' => true,
                    'theme_color' => null,
                    'logo_image' => null,
                    'hero_background_image' => null,
                    'hero_product' => null,
                    'hero_slides' => [],
                ];
            }

            $slides = FrontCustomizationSlide::with(['product:id,name,image_path,previous_sale_price,current_sale_price'])
                ->where('enabled', true)
                ->orderBy('order')
                ->get()
                ->map(function ($s) {
                    return [
                        'order' => $s->order,
                        'tagline' => $s->tagline,
                        'background_image' => $s->background_image_url,
                        'product' => $s->product ? [
                            'id' => $s->product->id,
                            'name' => $s->product->name,
                            'image' => $s->product->image,
                            'price' => $s->product->previous_sale_price,
                            'current_sale_price' => $s->product->current_sale_price,
                        ] : null,
                    ];
                })->values();

            return [
                'hero_enabled' => (bool) $customization->hero_enabled,
                'featured_section_enabled' => (bool) $customization->featured_section_enabled,
                'newsletter_enabled' => (bool) $customization->newsletter_enabled,
                'theme_color' => $customization->theme_color,
                'logo_image' => $customization->logo_image_url,
                'hero_title' => $customization->hero_title,
                'hero_subtitle' => $customization->hero_subtitle,
                'hero_background_image' => $customization->hero_background_image_url,
                'hero_product' => $customization->heroProduct ? [
                    'id' => $customization->heroProduct->id,
                    'name' => $customization->heroProduct->name,
                    'price' => $customization->heroProduct->previous_sale_price,
                    'current_sale_price' => $customization->heroProduct->current_sale_price,
                ] : null,
                'hero_slides' => $slides,
                '_meta' => [
                    'updated_at' => optional($customization->updated_at)->toRfc7231String(),
                ],
            ];
        });

        // ETag support for client-side caching
        $etag = sha1(json_encode($data));
        $requestEtag = request()->header('If-None-Match');
        if ($requestEtag && trim($requestEtag, '"') === $etag) {
            return response()->noContent(304, [
                'Cache-Control' => 'public, max-age=600',
                'ETag' => '"' . $etag . '"',
            ]);
        }

        $headers = [
            'Cache-Control' => 'public, max-age=600',
            'ETag' => '"' . $etag . '"',
        ];
        if (!empty($data['_meta']['updated_at'])) {
            $headers['Last-Modified'] = $data['_meta']['updated_at'];
        }

        unset($data['_meta']);

        return response()->json($data, 200, $headers, JSON_UNESCAPED_UNICODE);
    }

    /**
     * Minimal settings endpoint returning theme color only.
     */
    public function theme()
    {
        $theme = Cache::remember('front_theme_color', 600, function () {
            $c = FrontCustomization::select('theme_color')->first();
            return [
                'theme_color' => $c?->theme_color,
            ];
        });

        return response()->json($theme);
    }
}
