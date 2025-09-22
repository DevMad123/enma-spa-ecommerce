<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductColor;
use App\Models\ProductSize;
use App\Models\ProductSubCategory;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Supplier;
use Illuminate\Http\Request;
use PhpParser\Node\Expr\Array_;
use PDF;

class ProductController extends Controller
{
    public function productList(Request $request)
    {
        $query = Product::query()
            ->with([
                'attributes.color',
                'attributes.size',
                'variants.color',
                'variants.size',
                'brand',
                'supplier',
                'category',
                'subcategory',
                'images',
            ])
            ->whereNull('deleted_at');
        // Recherche globale
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                ->orWhere('code', 'like', "%$search%");
            });
        }

        // Filtre status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $productList = $query->paginate($perPage)->appends($request->all());

        $productCategory = ProductCategory::whereNull('deleted_at')->where('status', 1)->get();
        $supplierList = Supplier::whereNull('deleted_at')->where('status', 1)->get();
        $brand = Brand::get();
        $color = ProductColor::get();
        $size = ProductSize::get();

        return Inertia::render('products/list', [
            'title' => 'Product List',
            'productList' => $productList,
            'productCategory' => $productCategory,
            'supplierList' => $supplierList,
            'brand' => $brand,
            'color' => $color,
            'size' => $size,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
        ]);
    }

    /**
     * Store a new product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeProduct(Request $request)
    {
        DB::beginTransaction();

        try {
            \Log::info('Product store request data: ', $request->all());

            // Décoder les JSON strings en tableaux PHP si nécessaire
            foreach (['attributes', 'variants'] as $field) {
                $value = $request->input($field);
                if (!empty($value) && is_string($value)) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $request->merge([$field => $decoded]);
                    } else {
                        $request->merge([$field => []]);
                    }
                }
            }

            // (Conversion des attributs si besoin…)
            if ($request->has('color') || $request->has('size')) {
                $attributes = [];
                $colors = (array) $request->input('color', []);
                $sizes  = (array) $request->input('size', []);
                $stocks = (array) $request->input('available_quantity', []);
                $prices = (array) $request->input('sale_price', []);
                $count = max(count($colors), count($sizes), count($stocks), count($prices));
                for ($i = 0; $i < $count; $i++) {
                    $attributes[] = [
                        'color_id' => $colors[$i] ?? null,
                        'size_id'  => $sizes[$i] ?? null,
                        'stock'    => $stocks[$i] ?? 0,
                        'price'    => $prices[$i] ?? null,
                    ];
                }
                $request->merge(['attributes' => $attributes]);
            }

            $validated = $request->validate([
                'type' => 'required|in:simple,variable',
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:product_categories,id',
                'subcategory_id' => 'nullable|exists:product_sub_categories,id',
                'brand_id' => 'nullable|exists:brands,id',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'main_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',

                'purchase_cost' => 'required_if:type,simple|nullable|numeric',
                'sale_price' => 'required_if:type,simple|nullable|numeric',
                'wholesale_price' => 'nullable|numeric',
                'available_quantity' => 'required_if:type,simple|nullable|integer',

                'variants' => 'required_if:type,variable|nullable|array|min:1',
                'variants.*.color_id' => 'nullable|exists:product_colors,id',
                'variants.*.size_id' => 'nullable|exists:product_sizes,id',
                'variants.*.sku' => 'nullable|string|max:100',
                'variants.*.purchase_cost' => 'required_if:type,variable|numeric',
                'variants.*.sale_price' => 'required_if:type,variable|numeric',
                'variants.*.wholesale_price' => 'nullable|numeric',
                'variants.*.available_quantity' => 'required_if:type,variable|integer',

                // Note: La validation pour 'attributes' est maintenant correcte
                'attributes' => 'nullable|array',
                'attributes.*.color_id' => 'nullable|exists:product_colors,id',
                'attributes.*.size_id' => 'nullable|exists:product_sizes,id',
                'attributes.*.stock' => 'nullable|integer',
                'attributes.*.price' => 'nullable|numeric',

                'unit_type' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'discount_type' => 'nullable|in:0,1',
                'discount' => 'nullable|numeric|min:0',
                'is_popular' => 'nullable|boolean',
                'is_trending' => 'nullable|boolean',

                'product_images' => 'nullable|array',
                'product_images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);

            $productData = $request->only([
                'name', 'category_id', 'subcategory_id', 'brand_id',
                'supplier_id', 'description', 'unit_type',
                'is_popular', 'is_trending', 'discount', 'discount_type',
                'purchase_cost', 'sale_price', 'wholesale_price', 'available_quantity'
            ]);

            // On s'assure que les champs financiers sont toujours présents
            if ($request->type === 'variable') {
                $productData['current_purchase_cost'] = 0;
                $productData['current_sale_price'] = 0;
                $productData['current_wholesale_price'] = 0;
                $productData['available_quantity'] = 0;
            } else {
                $productData['current_purchase_cost'] = $request->purchase_cost ?? 0;
                $productData['current_sale_price'] = $request->sale_price ?? 0;
                $productData['current_wholesale_price'] = $request->wholesale_price ?? 0;
                $productData['available_quantity'] = $request->available_quantity ?? 0;
            }

            $product = new Product();
            $product->fill($productData);
            $product->type = $request->type;
            $product->image_path = $this->productImageSave($request->file('main_image'));
            $product->save();

            // Générer le code uniquement si aucun code n’a été envoyé
            if (empty($request->code)) {
                $product->update([
                    'code' => 1000 + $product->id,
                ]);
            }

            // Gestion des variantes (uniquement si produit variable)
            if ($request->type === 'variable') {
                foreach ($request->variants as $variant) {
                    $sku = null;
                    if (!empty($variant['color_id']) || !empty($variant['size_id'])) {
                        $sku = $product->code . '-' . ($variant['color_id'] ?? 'c0') . '-' . ($variant['size_id'] ?? 's0');
                    } else {
                        $sku = $product->code . '-' . ($variant['sku'] ?? 's0');
                    }

                    $product->variants()->create([
                        'color_id' => $variant['color_id'] ?? null,
                        'size_id' => $variant['size_id'] ?? null,
                        'sku' => $sku,
                        'purchase_cost' => $variant['purchase_cost'],
                        'sale_price' => $variant['sale_price'],
                        'wholesale_price' => $variant['wholesale_price'] ?? 0,
                        'available_quantity' => $variant['available_quantity'],
                    ]);
                }
            }

            // Gestion des attributs (maintenant que la requête a été corrigée)
            if ($request->has('attributes')) {
                foreach ($request->input('attributes') as $attr) {
                    $product->attributes()->create([
                        'color_id' => $attr['color_id'] ?? null,
                        'size_id' => $attr['size_id'] ?? null,
                        'stock' => $attr['stock'] ?? 0,
                        'price' => $attr['price'] ?? null,
                    ]);
                }
            }

            // Gestion des images additionnelles
            if ($request->hasFile('product_images')) {
                foreach ($request->file('product_images') as $img) {
                    $product->images()->create([
                        'image' => $this->productImageSave($img),
                    ]);
                }
            }

            DB::commit();

            // Remplace redirect()->back() par redirect()->route(...)
            return redirect()->route('admin.products.list')->with('flash', ['success' => 'Produit créé avec succès !']);

        } catch (ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation failed during product creation: ' . json_encode($e->errors()));
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur lors de la création du produit : ' . $e->getMessage() . ' - Ligne: ' . $e->getLine());
            return back()->withErrors(['error' => 'Erreur lors de la création du produit. Veuillez réessayer.'])->withInput();
        }
    }

    public function updateProduct(Request $request, $id)
    {
        \Log::info('UPDATE Product request data: ', $request->all());
        \Log::info('UPDATE Product ID: ' . $id);
        DB::beginTransaction();

        try {

            $product = Product::with(['images', 'variants', 'attributes'])->find($id);
            if (!$product) {
                return response()->json(['message' => 'Produit introuvable.'], 404);
            }

            foreach (['attributes', 'variants'] as $field) {
                $value = $request->input($field);
                if (!empty($value) && is_string($value)) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $request->merge([$field => $decoded]);
                    } else {
                        $request->merge([$field => []]);
                    }
                }
            }

           $rules = [
                'type' => 'required|in:simple,variable',
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:product_categories,id',
                'subcategory_id' => 'nullable|exists:product_sub_categories,id',
                'brand_id' => 'nullable|exists:brands,id',
                'supplier_id' => 'nullable|exists:suppliers,id',
                'purchase_cost' => 'nullable|numeric',
                'sale_price' => 'nullable|numeric',
                'wholesale_price'=> 'nullable|numeric',
                'available_quantity' => 'nullable|numeric',
                'variants' => 'nullable|array',
                'variants.*.color_id' => 'nullable|exists:product_colors,id',
                'variants.*.size_id'  => 'nullable|exists:product_sizes,id',
                'variants.*.sku'      => 'nullable|string|max:100',
                'variants.*.purchase_cost' => 'nullable|numeric',
                'variants.*.sale_price'     => 'nullable|numeric',
                'variants.*.wholesale_price'=> 'nullable|numeric',
                'variants.*.available_quantity' => 'nullable|numeric',
                'attributes' => 'nullable|array',
                'attributes.*.color_id' => 'nullable|exists:product_colors,id',
                'attributes.*.size_id' => 'nullable|exists:product_sizes,id',
                'attributes.*.stock' => 'nullable|numeric',
                'attributes.*.price' => 'nullable|numeric',
                // Pour update, main_image n'est pas requise
                'main_image' => 'nullable|string',
                'main_image_deleted' => 'nullable|boolean',
                'product_images' => 'nullable|array',
                'product_images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
                'existing_images' => 'nullable|array',
                'existing_images.*' => 'nullable|string',
            ];

            if ($request->hasFile('main_image')) {
                $rules['main_image'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048';
            }
            $validated = $request->validate($rules);

            $existingImages = $request->input('existing_images', []);
            if (!empty($existingImages)) {
                $product->images()->whereNotIn('image', $existingImages)->delete();
            } else {
                $product->images()->delete();
            }
            if ($request->hasFile('product_images')) {
                foreach ($request->file('product_images') as $img) {
                    $product->images()->create([
                        'image' => $this->productImageSave($img),
                    ]);
                }
            }
            if ($request->boolean('main_image_deleted')) {
                $product->image_path = null;
            } elseif ($request->hasFile('main_image')) {
                $product->image_path = $this->productImageSave($request->file('main_image'));
            }

            $product->fill($request->only([
                'name', 'category_id', 'subcategory_id', 'brand_id', 'supplier_id',
                'description', 'unit_type', 'is_popular', 'is_trending', 'discount', 'discount_type'
            ]));
            $product->type = $request->type;
            if (empty($request->code) && !$product->code) {
                $product->code = 1000 + $product->id;
            }
            $product->save();

            if ($product->type === 'simple') {
                $product->update([
                    'current_purchase_cost'   => $request->purchase_cost ?? $product->current_purchase_cost,
                    'current_sale_price'      => $request->sale_price ?? $product->current_sale_price,
                    'current_wholesale_price' => $request->wholesale_price ?? $product->current_wholesale_price,
                    'available_quantity'      => $request->available_quantity ?? $product->available_quantity,
                ]);
            }
            if ($product->type === 'variable' && $request->has('variants')) {
                $product->variants()->delete();
                foreach ($request->variants as $variant) {
                    $product->variants()->create($variant);
                }
            }
            if ($request->has('attributes')) {
                $product->attributes()->delete();
                foreach ($request->attributes as $attr) {
                    $product->attributes()->create([
                        'color_id' => $attr['color_id'] ?? null,
                        'size_id'  => $attr['size_id'] ?? null,
                        'stock'    => $attr['stock'] ?? 0,
                        'price'    => $attr['price'] ?? null,
                    ]);
                }
            }

            DB::commit();

            // ✅ Redirection Inertia (et non JSON)
            return redirect()->route('admin.products.list')->with('flash', ['success' => 'Produit mis à jour avec succès !']);

        } catch (ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation failed during product update: ' . json_encode($e->errors()));
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur update product : ' . $e->getMessage() . ' - Ligne: ' . $e->getLine());
            return back()->withErrors(['error' => 'Erreur lors de la mise à jour du produit.'])->withInput();
        }
    }
    /**
     * Sauvegarder une image produit
     */
    protected function productImageSave($image)
    {
        if ($image) {
            // $ext = $image->getClientOriginalExtension();
            $fileName = "product-" . time() . rand(1000, 9999) . '.webp';
            $filePath = 'product_images/' . $fileName;

            // ✅ Créez l'instance du gestionnaire d'image
            $imageManager = new ImageManager(new GdDriver());
            // ✅ Chargez l'image téléchargée pour la manipulation
            $img = $imageManager->read($image);
            // ✅ Redimensionnez et encodez l'image
            $img->resize(400, 400);

            $encodedImageContent = $img->toWebp(70);

            Storage::disk('public')->put($filePath, $encodedImageContent);

            return 'storage/' . $filePath;
        }

        return null;
    }

    public function productBarcodeGenerate(Request $request)
    {
        $product = Product::find($request->product_id);

        $data = [
            'product' => $product,
            'qty' => $request->barcode_qty,
        ];

        $pdf = PDF::loadView('adminPanel.product.barcode_generate', $data);
//      return view('adminPanel.pos.sell_invoice');
//      return $pdf->download('buy_invoice.pdf');
        return $pdf->stream('buy_invoice.pdf');

    }
}
