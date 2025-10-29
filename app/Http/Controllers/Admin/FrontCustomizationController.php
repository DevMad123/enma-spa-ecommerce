<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FrontCustomization;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\FrontCustomizationSlide;
use App\Models\FrontGalleryItem;
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

        $categories = ProductCategory::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $gallery = FrontGalleryItem::query()
            ->orderBy('order')
            ->get()
            ->map(function ($g) {
                return [
                    'id' => $g->id,
                    'order' => $g->order,
                    'enabled' => (bool) $g->enabled,
                    'title' => $g->title,
                    'url' => $g->url,
                    'image' => $g->image_url,
                ];
            });

        $customization = $custom ? [
            'id' => $custom->id,
            'hero_enabled' => (bool) $custom->hero_enabled,
            'hero_product_id' => $custom->hero_product_id,
            'hero_title' => $custom->hero_title,
            'hero_subtitle' => $custom->hero_subtitle,
            'featured_section_enabled' => (bool) $custom->featured_section_enabled,
            'featured_category_id' => $custom->featured_category_id,
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
            'categories' => $categories,
            'gallery' => $gallery,
        ]);
    }

    public function update(Request $request)
    {
        Log::info('Requests received for front customization update:', [
            'all' => $request->all(),
            'files' => array_keys($request->allFiles()),
            'content_type' => $request->header('Content-Type')
        ]);
        $this->authorize('manage-customizations');

        $errors = $this->validateCustomization($request);
        if (!empty($errors)) {
            return back()->withErrors($errors)->withInput();
        }

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
        if ($request->has('featured_category_id')) {
            $val = $request->input('featured_category_id');
            $data['featured_category_id'] = ($val === '' || is_null($val)) ? null : (int) $val;
        }
        foreach (['hero_enabled','featured_section_enabled','newsletter_enabled'] as $b) {
            if ($request->has($b)) {
                $data[$b] = $request->boolean($b);
            }
        }

        $customization = FrontCustomization::first();
        if (!$customization) {
            $customization = new FrontCustomization();
        }

        // Upload hero background
        if ($request->hasFile('hero_background_image')) {
            if ($customization->hero_background_image) {
                $this->deletePublicFileIfExists($customization->hero_background_image);
            }
            $path = $request->file('hero_background_image')->store('customizations', 'public');
            $data['hero_background_image'] = '/' . ltrim('storage/' . $path, '/');
        }

        // Upload logo image
        if ($request->hasFile('logo_image')) {
            if ($customization->logo_image) {
                $this->deletePublicFileIfExists($customization->logo_image);
            }
            $path = $request->file('logo_image')->store('customizations', 'public');
            $data['logo_image'] = '/' . ltrim('storage/' . $path, '/');
        }

        $customization->fill($data);
        $customization->save();

        // Slides (up to 3)
        $slides = $request->input('slides', []);
        $slideFiles = $request->file('slides', []);
        foreach ([1,2,3] as $position) {
            $payload = collect($slides)->firstWhere('order', $position) ?? ($slides[$position-1] ?? null);
            $slide = FrontCustomizationSlide::firstOrNew(['order' => $position]);
            if (!$payload) {
                continue;
            }
            if (array_key_exists('enabled', $payload)) {
                $enabled = filter_var($payload['enabled'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                $slide->enabled = is_null($enabled) ? false : (bool) $enabled;
            } elseif (!$slide->exists) {
                $slide->enabled = false;
            }
            if (array_key_exists('product_id', $payload)) {
                $slide->product_id = ($payload['product_id'] === '' || is_null($payload['product_id'])) ? null : (int) $payload['product_id'];
            }
            if (array_key_exists('tagline', $payload)) {
                $slide->tagline = (string) $payload['tagline'];
            }
            $fileKey = 'slides.' . ($position-1) . '.background_image';
            $uploaded = null;
            if ($request->hasFile($fileKey)) {
                $uploaded = $request->file($fileKey);
            } elseif (isset($slideFiles[$position-1]['background_image'])) {
                $uploaded = $slideFiles[$position-1]['background_image'];
            }
            if ($uploaded) {
                if ($slide->background_image) {
                    $this->deletePublicFileIfExists($slide->background_image);
                }
                $path = $uploaded->store('customizations', 'public');
                $slide->background_image = '/' . ltrim('storage/' . $path, '/');
            }
            $slide->order = $position;
            $slide->save();
        }

        // Gallery items (up to 6)
        $galleryPayloads = $request->input('gallery', []);
        $galleryFiles = $request->file('gallery', []);
        for ($i = 0; $i < 6; $i++) {
            $payload = $galleryPayloads[$i] ?? null;
            $fileKey = 'gallery.' . $i . '.image';
            if (!$payload && !$request->hasFile($fileKey) && !isset($galleryFiles[$i])) continue;
            $item = FrontGalleryItem::firstOrNew(['order' => $i+1]);
            if (array_key_exists('enabled', $payload)) {
                $enabled = filter_var($payload['enabled'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                $item->enabled = is_null($enabled) ? true : (bool) $enabled;
            } elseif (!$item->exists) {
                $item->enabled = true;
            }
            $item->title = $payload['title'] ?? null;
            $item->url = $payload['url'] ?? null;
            $uploaded = null;
            if ($request->hasFile($fileKey)) {
                $uploaded = $request->file($fileKey);
            } elseif (isset($galleryFiles[$i])) {
                $candidate = $galleryFiles[$i];
                if ($candidate instanceof \Illuminate\Http\UploadedFile) {
                    $uploaded = $candidate;
                } elseif (is_array($candidate) && isset($candidate['image'])) {
                    $uploaded = $candidate['image'];
                }
            }
            if ($uploaded) {
                if ($item->image_path) {
                    $this->deletePublicFileIfExists($item->image_path);
                }
                $path = $uploaded->store('customizations', 'public');
                $item->image_path = '/' . ltrim('storage/' . $path, '/');
            }
            $item->order = $i+1;
            $item->save();
        }

        Cache::forget('front_customizations');

        return back()->with('success', 'Personnalisation mise a jour avec succes.');
    }

    private function deletePublicFileIfExists(?string $path): void
    {
        if (!$path) return;
        $relative = ltrim(str_replace('storage/', '', $path), '/');
        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }

    private function validateCustomization(Request $request): array
    {
        $errors = [];
        $allowedMimes = [
            'image/jpeg','image/png','image/webp','image/avif','image/jpg','image/pjpeg','image/x-png',
        ];

        $checkFile = function($file, $maxBytes, $key) use (&$errors, $allowedMimes) {
            if (!$file) return;
            if (!($file instanceof \Illuminate\Http\UploadedFile) && !($file instanceof \Symfony\Component\HttpFoundation\File\UploadedFile)) {
                $errors[$key][] = "Le fichier n'a pas ete televerse correctement.";
                return;
            }
            if (method_exists($file, 'isValid') && !$file->isValid()) {
                $err = method_exists($file, 'getError') ? $file->getError() : null;
                if (in_array($err, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
                    $errors[$key][] = "L'image est trop volumineuse (limite serveur).";
                } else {
                    $errors[$key][] = "Le fichier n'a pas ete televerse correctement.";
                }
                return;
            }
            $path = method_exists($file, 'getPathname') ? $file->getPathname() : null;
            if (!$path || !@is_file($path) || !@is_readable($path)) {
                $errors[$key][] = "Le fichier est illisible (reessayez).";
                return;
            }
            $mime = $file->getMimeType();
            if ($mime && !in_array($mime, $allowedMimes, true)) {
                $errors[$key][] = "Format non supporte (JPG, PNG, WEBP, AVIF).";
            }
            $size = (int) $file->getSize();
            if ($size > $maxBytes) {
                $mb = (int) round($maxBytes / (1024*1024));
                $errors[$key][] = "L'image est trop lourde (max {$mb} Mo).";
            }
        };

        // Hero & logo (3 Mo)
        if ($request->hasFile('hero_background_image')) {
            $checkFile($request->file('hero_background_image'), 3*1024*1024, 'hero_background_image');
        }
        if ($request->hasFile('logo_image')) {
            $checkFile($request->file('logo_image'), 3*1024*1024, 'logo_image');
        }

        // Slides (0..2) - 4 Mo
        $slideFiles = $request->file('slides', []);
        for ($i = 0; $i < 3; $i++) {
            $fileKey = 'slides.' . $i . '.background_image';
            $uploaded = null;
            if ($request->hasFile($fileKey)) {
                $uploaded = $request->file($fileKey);
            } elseif (isset($slideFiles[$i]['background_image'])) {
                $uploaded = $slideFiles[$i]['background_image'] ?? null;
            }
            if ($uploaded) {
                $checkFile($uploaded, 4*1024*1024, 'slides.' . $i . '.background_image');
            }
            $pid = $request->input('slides.' . $i . '.product_id');
            if ($pid !== null && $pid !== '' && !Product::where('id', $pid)->exists()) {
                $errors['slides.' . $i . '.product_id'][] = "Produit de slide invalide.";
            }
            $tag = $request->input('slides.' . $i . '.tagline');
            if ($tag !== null && mb_strlen((string)$tag) > 255) {
                $errors['slides.' . $i . '.tagline'][] = "Le texte d'accroche ne doit pas depasser 255 caracteres.";
            }
        }

        // Hero product id
        $hpid = $request->input('hero_product_id');
        if ($hpid !== null && $hpid !== '' && !Product::where('id', $hpid)->exists()) {
            $errors['hero_product_id'][] = "Produit hero invalide.";
        }

        // Featured category id
        $fcid = $request->input('featured_category_id');
        if ($fcid !== null && $fcid !== '' && !ProductCategory::where('id', $fcid)->exists()) {
            $errors['featured_category_id'][] = "Categorie mise en avant invalide.";
        }

        // Gallery images (up to 6) - 3 Mo
        $galleryFiles = $request->file('gallery', []);
        for ($i = 0; $i < 6; $i++) {
            $fileKey = 'gallery.' . $i . '.image';
            $uploaded = null;
            if ($request->hasFile($fileKey)) {
                $uploaded = $request->file($fileKey);
            } elseif (isset($galleryFiles[$i])) {
                $candidate = $galleryFiles[$i];
                if ($candidate instanceof \Illuminate\Http\UploadedFile) {
                    $uploaded = $candidate;
                } elseif (is_array($candidate) && isset($candidate['image'])) {
                    $uploaded = $candidate['image'];
                }
            }
            if ($uploaded) {
                $checkFile($uploaded, 3*1024*1024, 'gallery.' . $i . '.image');
            }
        }

        return $errors;
    }
}
