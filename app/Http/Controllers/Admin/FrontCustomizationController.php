<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FrontCustomizationRequest;
use App\Models\FrontCustomization;
use App\Models\Product;
use App\Models\FrontCustomizationSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Log;

class FrontCustomizationController extends Controller
{
    public function edit()
    {
        $this->authorize('manage-customizations');
        $custom = FrontCustomization::first();
        $products = Product::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        // Adapter les URLs des images pour l'aperçu côté admin
        $customization = $custom ? [
            'id' => $custom->id,
            'hero_enabled' => (bool) $custom->hero_enabled,
            'hero_product_id' => $custom->hero_product_id,
            'hero_title' => $custom->hero_title,
            'hero_subtitle' => $custom->hero_subtitle,
            'featured_section_enabled' => (bool) $custom->featured_section_enabled,
            'newsletter_enabled' => (bool) $custom->newsletter_enabled,
            'theme_color' => $custom->theme_color,
            'hero_background_image' => $custom->hero_background_image ? url('/' . ltrim($custom->hero_background_image, '/')) : null,
            'logo_image' => $custom->logo_image ? url('/' . ltrim($custom->logo_image, '/')) : null,
            'slides' => FrontCustomizationSlide::query()->orderBy('order')->get()->map(function ($s) {
                return [
                    'id' => $s->id,
                    'order' => $s->order,
                    'enabled' => (bool) $s->enabled,
                    'product_id' => $s->product_id,
                    'tagline' => $s->tagline,
                    'background_image' => $s->background_image ? url('/' . ltrim($s->background_image, '/')) : null,
                ];
            })->values(),
        ] : null;

        return Inertia::render('Admin/Settings/Customization', [
            'customization' => $customization,
            'products' => $products,
        ]);
    }

    public function update(FrontCustomizationRequest $request)
    {
        Log::info('Requests received for front customization update:', [
            'all' => $request->all(),
            'files' => array_keys($request->allFiles()),
            'content_type' => $request->header('Content-Type')
        ]);
        $this->authorize('manage-customizations');
        $validated = $request->validated();

        // Construire une payload robuste: ne pas dépendre uniquement de validated() si vide
        $data = [];
        foreach (['hero_title','hero_subtitle','theme_color'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }
        if ($request->has('hero_product_id')) {
            $val = $request->input('hero_product_id');
            $data['hero_product_id'] = $val === '' ? null : $val;
        }
        foreach (['hero_enabled','featured_section_enabled','newsletter_enabled'] as $b) {
            if ($request->has($b)) {
                $data[$b] = $request->boolean($b);
            }
        }

        // Fusionner avec validated (priorité aux données spécifiques)
        $data = array_merge($validated, $data);

        Log::info('Data received for front customization update:', $data);

        $customization = FrontCustomization::first();
        if (!$customization) {
            $customization = new FrontCustomization();
        }

        // Handle hero background image upload
        if ($request->hasFile('hero_background_image')) {
            if ($customization->hero_background_image) {
                $this->deletePublicFileIfExists($customization->hero_background_image);
            }
            $path = $request->file('hero_background_image')->store('customizations', 'public');
            $data['hero_background_image'] = '/' . ltrim('storage/' . $path, '/');
        }

        // Handle logo image upload
        if ($request->hasFile('logo_image')) {
            if ($customization->logo_image) {
                $this->deletePublicFileIfExists($customization->logo_image);
            }
            $path = $request->file('logo_image')->store('customizations', 'public');
            $data['logo_image'] = '/' . ltrim('storage/' . $path, '/');
        }

        // Normalize booleans safely (avoid casting 'false' string to true)
        if ($request->has('hero_enabled')) {
            $data['hero_enabled'] = $request->boolean('hero_enabled');
        }
        if ($request->has('featured_section_enabled')) {
            $data['featured_section_enabled'] = $request->boolean('featured_section_enabled');
        }
        if ($request->has('newsletter_enabled')) {
            $data['newsletter_enabled'] = $request->boolean('newsletter_enabled');
        }

        $customization->fill($data);
        $customization->save();

                // Handle slides (up to 3)
        $slides = $request->input('slides', []);
        foreach ([1,2,3] as $position) {
            $payload = collect($slides)->firstWhere('order', $position) ?? ($slides[$position-1] ?? null);
            $slide = FrontCustomizationSlide::firstOrNew(['order' => $position]);
            if (!$payload) {
                continue;
            }
            $slide->enabled = array_key_exists('enabled', $payload) ? (bool)$payload['enabled'] : ($slide->exists ? $slide->enabled : false);
            $slide->product_id = $payload['product_id'] ?? null;
            $slide->tagline = $payload['tagline'] ?? null;
            $fileKey = 'slides.' . ($position-1) . '.background_image';
            if ($request->hasFile($fileKey)) {
                if ($slide->background_image) {
                    $this->deletePublicFileIfExists($slide->background_image);
                }
                $path = $request->file($fileKey)->store('customizations', 'public');
                $slide->background_image = '/' . ltrim('storage/' . $path, '/');
            }
            $slide->order = $position;
            $slide->save();
        }Cache::forget('front_customizations');

        return back()->with('success', 'Personnalisation mise à jour avec succès.');
    }

    private function deletePublicFileIfExists(?string $path): void
    {
        if (!$path) return;
        $relative = ltrim(str_replace('storage/', '', $path), '/');
        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}



