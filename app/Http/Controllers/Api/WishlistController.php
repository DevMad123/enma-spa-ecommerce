<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWishlistRequest;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    /**
     * Display a listing of the user's wishlist.
     */
    public function index(): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            $wishlists = Wishlist::with(['product.category', 'product.brand', 'product.images'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $wishlistData = $wishlists->map(function ($wishlist) {
                $product = $wishlist->product;
                return [
                    'id' => $wishlist->id,
                    'added_at' => $wishlist->created_at->format('Y-m-d H:i:s'),
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price' => $product->current_sale_price,
                        'image' => $product->image,
                        'category' => $product->category?->name,
                        'brand' => $product->brand?->name,
                        'average_rating' => $product->average_rating,
                        'reviews_count' => $product->reviews_count,
                        'status' => $product->status,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Liste de souhaits récupérée avec succès',
                'data' => [
                    'wishlists' => $wishlistData,
                    'total_count' => $wishlists->count()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la liste de souhaits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created wishlist item.
     */
    public function store(StoreWishlistRequest $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            // Vérifier que le produit existe et est actif
            $product = Product::findOrFail($request->product_id);
            
            if (!$product->status) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce produit n\'est plus disponible'
                ], 400);
            }

            // Créer l'élément de wishlist
            $wishlist = Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id
            ]);

            // Charger les relations pour la réponse
            $wishlist->load(['product.category', 'product.brand']);

            return response()->json([
                'success' => true,
                'message' => 'Produit ajouté à la liste de souhaits avec succès',
                'data' => [
                    'wishlist' => [
                        'id' => $wishlist->id,
                        'added_at' => $wishlist->created_at->format('Y-m-d H:i:s'),
                        'product' => [
                            'id' => $product->id,
                            'name' => $product->name,
                            'price' => $product->current_sale_price,
                            'image' => $product->image,
                            'category' => $product->category?->name,
                            'brand' => $product->brand?->name,
                        ]
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout à la liste de souhaits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a product from wishlist by product_id.
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            $productId = $request->route('productId') ?? $request->product_id;
            
            if (!$productId) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID du produit requis'
                ], 400);
            }

            $deleted = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce produit n\'est pas dans votre liste de souhaits'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Produit retiré de la liste de souhaits avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Clear entire wishlist for the user.
     */
    public function clear(): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            $deletedCount = Wishlist::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => "Liste de souhaits vidée avec succès ({$deletedCount} produit(s) supprimé(s))"
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la liste de souhaits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle product in wishlist (add if not exists, remove if exists).
     */
    public function toggle(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:products,id'
            ]);

            $user = auth('sanctum')->user();
            $productId = $request->product_id;
            
            $existingWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingWishlist) {
                // Supprimer de la wishlist
                $existingWishlist->delete();
                $action = 'removed';
                $message = 'Produit retiré de la liste de souhaits';
            } else {
                // Ajouter à la wishlist
                $product = Product::findOrFail($productId);
                
                if (!$product->status) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce produit n\'est plus disponible'
                    ], 400);
                }

                Wishlist::create([
                    'user_id' => $user->id,
                    'product_id' => $productId
                ]);
                $action = 'added';
                $message = 'Produit ajouté à la liste de souhaits';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'action' => $action,
                    'product_id' => $productId,
                    'is_in_wishlist' => $action === 'added'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification de la wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check multiple products in wishlist at once.
     */
    public function check(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_ids' => 'required|array',
                'product_ids.*' => 'integer|exists:products,id'
            ]);

            $user = auth('sanctum')->user();
            $productIds = $request->product_ids;

            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->whereIn('product_id', $productIds)
                ->pluck('product_id')
                ->toArray();

            $result = [];
            foreach ($productIds as $productId) {
                $result[$productId] = in_array($productId, $wishlistItems);
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a single product is in wishlist.
     */
    public function checkSingle(Request $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            $productId = $request->route('productId');

            $isInWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

            return response()->json([
                'success' => true,
                'data' => [
                    'product_id' => $productId,
                    'is_in_wishlist' => $isInWishlist
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get wishlist count for user.
     */
    public function count(): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            $count = Wishlist::where('user_id', $user->id)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du comptage',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle wishlist for specific product (alternative endpoint).
     */
    public function productToggle(Request $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            $productId = $request->route('productId');
            
            $existingWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingWishlist) {
                $existingWishlist->delete();
                $action = 'removed';
                $message = 'Produit retiré de vos favoris';
            } else {
                $product = Product::findOrFail($productId);
                
                if (!$product->status) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce produit n\'est plus disponible'
                    ], 400);
                }

                Wishlist::create([
                    'user_id' => $user->id,
                    'product_id' => $productId
                ]);
                $action = 'added';
                $message = 'Produit ajouté à vos favoris';
            }

            // Compter le nombre total d'éléments dans la wishlist
            $totalCount = Wishlist::where('user_id', $user->id)->count();

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'action' => $action,
                    'product_id' => (int)$productId,
                    'is_in_wishlist' => $action === 'added',
                    'wishlist_count' => $totalCount
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
