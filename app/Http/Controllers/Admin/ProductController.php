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
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Supplier;
use Illuminate\Http\Request;
use PhpParser\Node\Expr\Array_;
use PDF;
use App\Traits\HandleImageUploads;

class ProductController extends Controller
{
    use HandleImageUploads;
    public function index(Request $request)
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

        // Recherche globale - Sécurisée
        if ($request->filled('search')) {
            $search = $request->search;
            $escapedSearch = addcslashes($search, '%_\\');
            $searchPattern = "%{$escapedSearch}%";
            $query->where(function($q) use ($searchPattern) {
                $q->where('name', 'like', $searchPattern)
                  ->orWhere('code', 'like', $searchPattern)
                  ->orWhereHas('category', function($catQuery) use ($searchPattern) {
                      $catQuery->where('name', 'like', $searchPattern);
                  })
                  ->orWhereHas('brand', function($brandQuery) use ($searchPattern) {
                      $brandQuery->where('brand_name', 'like', $searchPattern);
                  });
            });
        }

        // Filtre par catégorie
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtre par marque
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtre par prix
        if ($request->filled('price_min')) {
            $query->where('current_sale_price', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('current_sale_price', '<=', $request->price_max);
        }

        // Filtre par stock
        if ($request->filled('stock_status')) {
            switch ($request->stock_status) {
                case 'in_stock':
                    $query->where('available_quantity', '>', 10);
                    break;
                case 'low_stock':
                    $query->where('available_quantity', '>', 0)
                          ->where('available_quantity', '<=', 10);
                    break;
                case 'out_of_stock':
                    $query->where('available_quantity', '<=', 0);
                    break;
            }
        }

        // Tri
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');
        $query->orderBy($sort, $direction);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $productList = $query->paginate($perPage)->appends($request->all());

        // Récupérer les données pour les filtres
        $categories = ProductCategory::whereNull('deleted_at')->where('status', 1)->get();
        $brands = Brand::whereNull('deleted_at')->where('status', 1)->get();
        $supplierList = Supplier::whereNull('deleted_at')->where('status', 1)->get();
        $color = ProductColor::get();
        $size = ProductSize::get();

        // Calculer les statistiques
        $stats = [
            'total_products' => Product::whereNull('deleted_at')->count(),
            'active_products' => Product::whereNull('deleted_at')->where('status', 1)->count(),
            'low_stock_products' => Product::whereNull('deleted_at')
                ->where('available_quantity', '>', 0)
                ->where('available_quantity', '<=', 10)
                ->count(),
            'out_of_stock_products' => Product::whereNull('deleted_at')
                ->where('available_quantity', '<=', 0)
                ->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'title' => 'Product List',
            'productList' => $productList,
            'categories' => $categories,
            'brands' => $brands,
            'supplierList' => $supplierList,
            'color' => $color,
            'size' => $size,
            'stats' => $stats,
            'localeConfig' => get_js_locale_config(),
            'filters' => [
                'search' => $request->search ?? '',
                'category_id' => $request->category_id ?? '',
                'brand_id' => $request->brand_id ?? '',
                'status' => $request->status ?? '',
                'price_min' => $request->price_min ?? '',
                'price_max' => $request->price_max ?? '',
                'stock_status' => $request->stock_status ?? '',
                'per_page' => $perPage,
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
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            Log::info('Product store request data: ', $request->all());

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
                'main_image' => 'required|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048',

                'purchase_cost' => 'required_if:type,simple|nullable|numeric',
                'sale_price' => 'required_if:type,simple|nullable|numeric',
                'wholesale_price' => 'nullable|numeric',
                'available_quantity' => 'required_if:type,simple|nullable|integer',

                // Relations directes pour produits simples
                'simple_colors' => 'nullable|array',
                'simple_colors.*' => 'exists:product_colors,id',
                'simple_sizes' => 'nullable|array',
                'simple_sizes.*' => 'exists:product_sizes,id',

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
                'product_images.*' => 'file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048',
            ]);

            $productData = $request->only([
                'name', 'category_id', 'subcategory_id', 'brand_id',
                'supplier_id', 'description', 'unit_type',
                'discount', 'discount_type',
                'purchase_cost', 'sale_price', 'wholesale_price', 'available_quantity'
            ]);

            // Convertir les booléens explicitement pour éviter les erreurs MySQL
            $productData['is_popular'] = $request->boolean('is_popular');
            $productData['is_trending'] = $request->boolean('is_trending');

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
            $product->image_path = $this->uploadProductImage($request->file('main_image'));
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

                // Mettre à jour les champs agrégés du produit parent
                $minVariantPrice = $product->variants()->min('sale_price');
                $sumVariantQty   = $product->variants()->sum('available_quantity');

                // Fallback: si aucune variante ou prix nul, tenter via attributes.price
                if (empty($minVariantPrice)) {
                    $attrMin = $product->attributes()->min('price');
                    if (!empty($attrMin)) {
                        $minVariantPrice = $attrMin;
                    }
                }

                $product->update([
                    'current_sale_price' => $minVariantPrice ?? 0,
                    'available_quantity' => $sumVariantQty ?? 0,
                ]);
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

            // Gestion des relations directes pour produits simples
            if ($request->type === 'simple') {
                // Associer les couleurs directement (nouveau système)
                if ($request->has('simple_colors') && !empty($request->simple_colors)) {
                    $product->directColors()->attach($request->simple_colors);
                }
                
                // Associer les tailles directement (nouveau système)  
                if ($request->has('simple_sizes') && !empty($request->simple_sizes)) {
                    $product->directSizes()->attach($request->simple_sizes);
                }
            }

            // Gestion des images additionnelles
            if ($request->hasFile('product_images')) {
                foreach ($request->file('product_images') as $img) {
                    $product->images()->create([
                        'image' => $this->uploadProductImage($img),
                    ]);
                }
            }

            DB::commit();

            // Remplace redirect()->back() par redirect()->route(...)
            return redirect()->route('admin.products.index')->with('flash', ['success' => 'Produit créé avec succès !']);

        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation failed during product creation: ' . json_encode($e->errors()));
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création du produit : ' . $e->getMessage() . ' - Ligne: ' . $e->getLine());
            return back()->withErrors(['error' => 'Erreur lors de la création du produit. Veuillez réessayer.'])->withInput();
        }
    }

    public function update(Request $request, $id)
    {
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
                
                // Relations directes pour produits simples
                'simple_colors' => 'nullable|array',
                'simple_colors.*' => 'exists:product_colors,id',
                'simple_sizes' => 'nullable|array',
                'simple_sizes.*' => 'exists:product_sizes,id',
                
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
                'product_images.*' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048',
                'existing_images' => 'nullable|array',
                'existing_images.*' => 'nullable|string',
            ];

            if ($request->hasFile('main_image')) {
                $rules['main_image'] = 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/jpg,image/pjpeg,image/x-png,image/avif,application/octet-stream|mimes:jpg,jpeg,png,webp,avif|max:2048';
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
                        'image' => $this->uploadProductImage($img),
                    ]);
                }
            }
            if ($request->boolean('main_image_deleted')) {
                $product->image_path = null;
            } elseif ($request->hasFile('main_image')) {
                $product->image_path = $this->updateProductImage($request->file('main_image'), $product->image_path);
            }

            // Préparer les données avec conversion des booléens
            $productData = $request->only([
                'name', 'category_id', 'subcategory_id', 'brand_id', 'supplier_id',
                'description', 'unit_type', 'discount', 'discount_type'
            ]);

            // Convertir les booléens explicitement pour éviter les erreurs MySQL
            $productData['is_popular'] = $request->boolean('is_popular');
            $productData['is_trending'] = $request->boolean('is_trending');

            $product->fill($productData);
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

                // Recalculer le prix minimal et le stock agrégé
                $minVariantPrice = $product->variants()->min('sale_price');
                $sumVariantQty   = $product->variants()->sum('available_quantity');

                if (empty($minVariantPrice)) {
                    $attrMin = $product->attributes()->min('price');
                    if (!empty($attrMin)) {
                        $minVariantPrice = $attrMin;
                    }
                }

                $product->update([
                    'current_sale_price' => $minVariantPrice ?? 0,
                    'available_quantity' => $sumVariantQty ?? 0,
                ]);
            }
            // Récupérer les attributs décodés (déjà traités par le merge() ci-dessus)
            $decodedAttributes = $request->input('attributes', []);

            if (!empty($decodedAttributes)) {
                $product->attributes()->delete();
                foreach ($decodedAttributes as $attr) {
                    $product->attributes()->create([
                        'color_id' => $attr['color_id'] ?? null,
                        'size_id'  => $attr['size_id'] ?? null,
                        'stock'    => $attr['stock'] ?? 0,
                        'price'    => $attr['price'] ?? null,
                    ]);
                }
            } else {
                Log::info('⚠️ Aucun attribut à traiter');
            }

            // Gestion des relations directes pour produits simples
            if ($product->type === 'simple') {
                // Synchroniser les couleurs directes (nouveau système)
                if ($request->has('simple_colors')) {
                    $colors = $request->simple_colors ?? [];
                    $product->directColors()->sync($colors);
                } else {
                    $product->directColors()->detach();
                }
                
                // Synchroniser les tailles directes (nouveau système)  
                if ($request->has('simple_sizes')) {
                    $sizes = $request->simple_sizes ?? [];
                    $product->directSizes()->sync($sizes);
                } else {
                    $product->directSizes()->detach();
                }
            }

            DB::commit();

            // ✅ Redirection Inertia (et non JSON)
            return redirect()->route('admin.products.index')->with('flash', ['success' => 'Produit mis à jour avec succès !']);

        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation failed during product update: ' . json_encode($e->errors()));
            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur update product : ' . $e->getMessage() . ' - Ligne: ' . $e->getLine());
            return back()->withErrors(['error' => 'Erreur lors de la mise à jour du produit.'])->withInput();
        }
    }
    public function createProduct()
    {
        $categories = ProductCategory::orderBy('name', 'asc')->get();
        $subcategories = ProductSubCategory::orderBy('name', 'asc')->get();
        $brands = Brand::orderBy('name', 'asc')->get();
        $suppliers = Supplier::orderBy('supplier_name', 'asc')->get();
        $colors = ProductColor::orderBy('name', 'asc')->get();
        $sizes = ProductSize::orderBy('size', 'asc')->get();

        return Inertia::render('Admin/Products/create', [
            'categories' => $categories,
            'subcategories' => $subcategories,
            'brands' => $brands,
            'suppliers' => $suppliers,
            'colors' => $colors,
            'sizes' => $sizes,
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Afficher un produit spécifique
     */
    public function show(Product $product)
    {
        $product->load([
            'category',
            'subcategory',
            'brand',
            'supplier',
            'attributes.color',
            'attributes.size',
            'variants.color',
            'variants.size',
            'images'
        ]);

        return Inertia::render('Admin/Products/show', [
            'product' => $product,
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Afficher le formulaire d'édition d'un produit
     */
    public function edit(Product $product)
    {
        $product->load([
            'category',
            'subcategory',
            'brand',
            'supplier',
            'attributes.color',
            'attributes.size',
            'variants.color',
            'variants.size',
            'images',
            // Charger les nouvelles relations directes
            'directColors',
            'directSizes'
        ]);

        $categories = ProductCategory::orderBy('name', 'asc')->get();
        $subcategories = ProductSubCategory::orderBy('name', 'asc')->get();
        $brands = Brand::orderBy('name', 'asc')->get();
        $suppliers = Supplier::orderBy('supplier_name', 'asc')->get();
        $colors = ProductColor::orderBy('name', 'asc')->get();
        $sizes = ProductSize::orderBy('size', 'asc')->get();

        return Inertia::render('Admin/Products/edit', [
            'product' => $product,
            'categories' => $categories,
            'subcategories' => $subcategories,
            'brands' => $brands,
            'suppliers' => $suppliers,
            'colors' => $colors,
            'sizes' => $sizes,
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Supprimer un produit (méthode RESTful)
     */
    public function destroy(Product $product)
    {
        try {
            // Soft delete du produit
            $product->delete();

            return redirect()
                ->route('admin.products.index')
                ->with('flash', ['success' => 'Produit supprimé avec succès !']);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression du produit: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('flash', ['error' => 'Erreur lors de la suppression du produit.']);
        }
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

    /**
     * Obtenir les sous-catégories par ID de catégorie (pour AJAX)
     */
    public function getSubcategoriesByCategory($category_id)
    {
        try {
            $subcategories = ProductSubCategory::where('category_id', $category_id)
                ->where('status', 1)
                ->whereNull('deleted_at')
                ->select('id', 'name', 'category_id')
                ->get();

            return response()->json($subcategories);
        } catch (\Exception $e) {
            Log::error('Erreur lors du chargement des sous-catégories: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement des sous-catégories'], 500);
        }
    }
}
