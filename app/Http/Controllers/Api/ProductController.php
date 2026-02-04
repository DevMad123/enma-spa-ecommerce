<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Return minimal sale price for a product based on variants/attributes.
     */
    public function minPrice(Product $product)
    {
        $minVariant = $product->variants()->min('sale_price');
        $minAttr = $product->attributes()->min('price');
        // Log::info('Product variant data: '. $minVariant);
        $candidates = array_values(array_filter([
            $minVariant,
            $minAttr,
            $product->current_sale_price,
        ], function ($v) {
            return $v !== null && $v !== '' && $v >= 0;
        }));
        // Log::info('Product variant data: ', $candidates);
        $min = !empty($candidates) ? min($candidates) : 0;
        // Log::info('Product variant min: '. $min);
        return response()->json([
            'product_id' => $product->id,
            'min_price' => $minVariant ? (float) $minVariant : 0,
        ]);
    }
    public function homeTrendingProduct()
    {
        return ProductResource::collection(Product::where('is_trending', 1)->paginate(8));
    }

    public function sectionProductList(Request $request): AnonymousResourceCollection|LengthAwarePaginator
    {
        // Note: subcategory_id n'existe plus, utiliser category_id avec le système hiérarchique
        $category_id = $request->category_id;

        if ($request->type == 'trending') {
            return ProductResource::collection(Product::when($category_id && $category_id != 'All', function ($q) use ($category_id) {
                return $q->where('category_id', $category_id);
            })->where('deleted', 0)->where('status', 1)->where('is_trending', 1)->paginate(12));
        }
        if ($request->type == 'popular') {
            return ProductResource::collection(Product::when($category_id && $category_id != 'All', function ($q) use ($category_id) {
                return $q->where('category_id', $category_id);
            })->where('deleted', 0)->where('status', 1)->where('is_popular', 1)->paginate(12));
        }
        if ($request->type == 'newArrival') {
            return ProductResource::collection(Product::when($category_id && $category_id != 'All', function ($q) use ($category_id) {
                return $q->where('category_id', $category_id);
            })->where('deleted', 0)->where('status', 1)->orderBy('id', 'DESC')->paginate(12));
        }
        if ($request->type == 'bestSell') {
            $query = DB::table("sell_details")->join('products', 'sell_details.product_id', '=', 'products.id')
                ->select('products.*', DB::raw("SUM(sell_details.sale_quantity) as total_sell"))
                ->groupBy('sell_details.product_id');
            
            if ($category_id && $category_id != 'All') {
                $query->where('products.category_id', $category_id);
            }
            
            return $query->orderBy('total_sell', 'DESC')->paginate(12);
        }
    }

    public function relatedProductGet(Request $request){
        $plist= explode(",",$request->productlist);

        // Utiliser category_id au lieu de subcategory_id
        $categorylist=[];
        $productlist=[$request->productlist];

        foreach ($plist as $key=>$productid){
            $product= Product::where('id',$productid)->first();
            if ($product && $product->category_id) {
                $categorylist[]=$product->category_id;
            }
        }

        if (empty($categorylist)) {
            return response(ProductResource::collection([]), 200);
        }

        $productlist= ProductResource::collection(
            Product::whereNotIn('id',$plist)
                ->whereIn('category_id', array_unique($categorylist))
                ->where('deleted', 0)
                ->where('status', 1)
                ->inRandomOrder()
                ->limit(10)
                ->get()
        );

        return response($productlist, 200);
    }

    public function minMaxPrice(){
       $minPrice= Product::min('current_sale_price');
       $maxPrice= Product::max('current_sale_price');
       $price=['min'=>$minPrice,'max'=>$maxPrice];

       return response($price,200);


    }


    public function priceRangeSrc(Request $request)
    {
        $min = $request->min;
        $max = $request->max;
        $color = $request->color;
        $size = $request->size;
        $type=$request->type;
        $category = $request->category_id;
        // Note: sub_category_id supprimé - utiliser category_id avec système hiérarchique
        $brand_id = $request->brand_id;
        $srcorderType = $request->srcorderType; /* price_asc price_dsc name_asc name_dsc */


        $product = Product::where('status', 1)->where('deleted', 0)
            ->when(($category > 0), function ($q) use ($category) {
                return $q->where('category_id', '=', $category);
            })
            ->when($brand_id > 0, function ($q) use ($brand_id) {
                return  $q->where('brand_id', '=', $brand_id);
            })
            ->when($color != '0', function ($q) use ($color) {
                return $q->where('color', 'like', '%' . $color . '%');
            })
            ->when($size != '0', function ($q) use ($size) {
               return $q->where('size', 'like', '%' . $size . '%');
            })
            ->when($type == 'trending', function ($q)  {
                return $q->where('is_trending', 1);
            })
            ->when($type == 'popular', function ($q)  {
                return $q->where('is_popular', 1);
            })
            ->when($type == 'newArrival', function ($q)  {
                return $q->orderBy('id', 'DESC');
            })
            ->when(($min>=0)&&($max>0), function ($q) use ($min,$max) {
                $q->whereBetween('current_sale_price', [$min, $max]);
            })
            ->when($srcorderType=='price_asc', function ($q){
                $q->orderBy("current_sale_price", "asc");
            })
            ->when($srcorderType=='price_dsc', function ($q){
                $q->orderBy("current_sale_price", "desc");
            })
            ->when($srcorderType=='name_asc', function ($q){
                $q->orderBy("name", "asc");
            })
            ->when($srcorderType=='name_dsc', function ($q){
                $q->orderBy("name", "desc");
            })
            ->get();

        $productList = ProductResource::collection($product);
        return response($productList, 200);
    }

    public function homePopularProduct()
    {
        $popular = Product::where('is_popular', 1)->take(8)->get();
        $popularList = ProductResource::collection($popular);
        return response($popularList, 200);
    }

    public function newArrivalProduct()
    {
        $newArrival = Product::orderBy('id', 'DESC')->take(12)->get();
        $arrivalList = ProductResource::collection($newArrival);
        return response($arrivalList, 200);
    }

    public function categoryProduct(Request $request)
    {
        $category_id = $request->category_id;
        $category_product = Product::where('category_id', $category_id)->where('deleted', 0)->where('status', 1)->get();
        return ProductResource::collection($category_product);
    }

    /**
     * @deprecated La méthode subCategoryProduct n'est plus disponible.
     * Les sous-catégories sont maintenant gérées via le système parent/enfant dans categories.
     * Utiliser categoryProduct() à la place avec un category_id enfant.
     */
    public function subCategoryProduct(Request $request)
    {
        // Rediriger vers categoryProduct pour compatibilité
        $category_id = $request->subCategory_id ?? $request->category_id;
        if ($category_id) {
            return ProductResource::collection(
                Product::where('category_id', $category_id)
                    ->where('deleted', 0)
                    ->where('status', 1)
                    ->paginate(4)
            );
        }
        return ProductResource::collection(Product::where('deleted', 0)->where('status', 1)->paginate(4));
    }

    public function bestSellProduct()
    {
        $best_sell_listt = DB::table("sell_details")->join('products', 'sell_details.product_id', '=', 'products.id')
            ->select('products.*', DB::raw("SUM(sell_details.sale_quantity) as total_sell"))
            ->groupBy('sell_details.product_id')
            ->orderBy('total_sell', 'DESC')
            ->take(12)->get();
        return response($best_sell_listt, 200);
    }

    public function productDetails(Request $request)
    {
        $productDetails = Product::with('productCategory')->with('productImage')->find($request->id);

//        return $productDetails = Product::with('productCategory')->with('productImage')->find($request->id);
        return response()->json($productDetails);
    }
    public function srcProductList(Request $request)
    {
        return Product::where('name', 'LIKE', "%{$request->name}%")->where('status', 1)->where('deleted', 0)->get();
    }

    public function productSizList(Request $request)
    {
        $productSizList = Product::select('size')->whereNotNull('size')->where('status', 1)->where('deleted', 0)->get();
        return response()->json($productSizList);
    }
    public function productColorList(Request $request)
    {
        $productSizList = Product::select('color')->whereNotNull('color')->where('status', 1)->where('deleted', 0)->get();
        return response()->json($productSizList);
    }

    public function allColor(){
       $allColor= ProductColor::get();
        return response()->json($allColor);
    }

    public function allSize(){
        $allSize= ProductSize::get();
        return response()->json($allSize);

    }

    /**
     * Retourne une variante en fonction d'un triplet (product_id, color_id, size_id).
     * Paramètres via query string: color_id, size_id (optionnels mais au moins un recommandé).
     * Exemple: GET /api/products/{product}/variant?color_id=1&size_id=2
     * Retourne un objet de variante normalisé ou null si non trouvée.
     */
    public function getVariantByAttributes(Request $request, Product $product)
    {
        $colorId = $request->query('color_id');
        $sizeId = $request->query('size_id');

        $query = $product->variants()->with(['color', 'size', 'images']);
        if (!is_null($colorId) && $colorId !== '') {
            $query->where('color_id', $colorId);
        }
        if (!is_null($sizeId) && $sizeId !== '') {
            $query->where('size_id', $sizeId);
        }

        $variant = $query->first();

        if (!$variant) {
            return response()->json(null);
        }

        $firstImage = optional($variant->images->first());
        $payload = [
            'id' => $variant->id,
            'sku' => $variant->sku,
            'product_id' => $product->id,
            'color_id' => $variant->color_id,
            'color' => optional($variant->color)->name,
            'size_id' => $variant->size_id,
            'size' => optional($variant->size)->size,
            'price' => (float) ($variant->price ?? $variant->sale_price ?? 0),
            'sale_price' => (float) ($variant->sale_price ?? 0),
            'stock' => (int) ($variant->stock ?? 0),
            'image_id' => $firstImage?->id,
            'image' => $firstImage?->image ? asset($firstImage->image) : null,
        ];

        return response()->json($payload);
    }
}
