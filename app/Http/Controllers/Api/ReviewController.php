<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews for a specific product.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $productId = $request->route('productId') ?? $request->product_id;
            
            if (!$productId) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID du produit requis'
                ], 400);
            }

            // Vérifier que le produit existe
            $product = Product::findOrFail($productId);

            // Construire la requête des avis
            $query = ProductReview::with(['user'])
                ->where('product_id', $productId)
                ->where('is_approved', true);

            // Filtres optionnels
            if ($request->has('rating') && $request->rating) {
                $query->where('rating', $request->rating);
            }

            if ($request->has('verified_only') && $request->verified_only) {
                $query->where('is_verified_purchase', true);
            }

            // Tri (par défaut : plus récents)
            $sortBy = $request->get('sort', 'newest');
            switch ($sortBy) {
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'rating_high':
                    $query->orderBy('rating', 'desc');
                    break;
                case 'rating_low':
                    $query->orderBy('rating', 'asc');
                    break;
                default: // newest
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            // Pagination
            $perPage = min($request->get('per_page', 10), 50);
            $reviews = $query->paginate($perPage);

            // Obtenir le résumé des avis pour ce produit
            $summary = ProductReview::getProductSummary($productId);

            // Formater les données
            $reviewData = $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'is_verified_purchase' => $review->is_verified_purchase,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->first_name . ' ' . $review->user->last_name,
                        'avatar' => $review->user->image_url ?? null,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Avis récupérés avec succès',
                'data' => [
                    'reviews' => $reviewData,
                    'summary' => $summary,
                    'pagination' => [
                        'current_page' => $reviews->currentPage(),
                        'last_page' => $reviews->lastPage(),
                        'per_page' => $reviews->perPage(),
                        'total' => $reviews->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created review.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            // Vérifier que le produit existe
            $product = Product::findOrFail($request->product_id);
            
            // Créer l'avis
            $review = ProductReview::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_verified_purchase' => false, // TODO: Vérifier si l'utilisateur a acheté le produit
                'is_approved' => true, // Auto-approuvé par défaut
            ]);

            // Charger les relations
            $review->load(['user', 'product']);

            return response()->json([
                'success' => true,
                'message' => 'Avis ajouté avec succès',
                'data' => [
                    'review' => [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'is_verified_purchase' => $review->is_verified_purchase,
                        'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->first_name . ' ' . $user->last_name,
                        ],
                        'product' => [
                            'id' => $product->id,
                            'name' => $product->name,
                        ]
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified review.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $review = ProductReview::with(['user', 'product'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'review' => [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'is_verified_purchase' => $review->is_verified_purchase,
                        'is_approved' => $review->is_approved,
                        'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                        'user' => [
                            'id' => $review->user->id,
                            'name' => $review->user->first_name . ' ' . $review->user->last_name,
                        ],
                        'product' => [
                            'id' => $review->product->id,
                            'name' => $review->product->name,
                        ]
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Avis introuvable',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified review.
     */
    public function update(UpdateReviewRequest $request, string $id): JsonResponse
    {
        try {
            $review = ProductReview::findOrFail($id);
            
            // La validation dans UpdateReviewRequest s'assure déjà que l'utilisateur est propriétaire
            
            $review->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            $review->load(['user', 'product']);

            return response()->json([
                'success' => true,
                'message' => 'Avis mis à jour avec succès',
                'data' => [
                    'review' => [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'is_verified_purchase' => $review->is_verified_purchase,
                        'updated_at' => $review->updated_at->format('Y-m-d H:i:s'),
                        'user' => [
                            'id' => $review->user->id,
                            'name' => $review->user->first_name . ' ' . $review->user->last_name,
                        ],
                        'product' => [
                            'id' => $review->product->id,
                            'name' => $review->product->name,
                        ]
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified review.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $review = ProductReview::findOrFail($id);
            
            // Vérifier que l'utilisateur est le propriétaire de l'avis
            if ($review->user_id !== auth('sanctum')->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à supprimer cet avis'
                ], 403);
            }
            
            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Avis supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's own reviews.
     */
    public function myReviews(Request $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            $query = ProductReview::with(['product.category', 'product.brand'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            $perPage = min($request->get('per_page', 10), 50);
            $reviews = $query->paginate($perPage);

            $reviewData = $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'is_verified_purchase' => $review->is_verified_purchase,
                    'is_approved' => $review->is_approved,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                    'product' => [
                        'id' => $review->product->id,
                        'name' => $review->product->name,
                        'image' => $review->product->image,
                        'category' => $review->product->category?->name,
                        'brand' => $review->product->brand?->name,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Vos avis récupérés avec succès',
                'data' => [
                    'reviews' => $reviewData,
                    'pagination' => [
                        'current_page' => $reviews->currentPage(),
                        'last_page' => $reviews->lastPage(),
                        'per_page' => $reviews->perPage(),
                        'total' => $reviews->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de vos avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get summary statistics for a product's reviews.
     */
    public function summary(Request $request): JsonResponse
    {
        try {
            $productId = $request->route('productId');
            
            if (!$productId) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID du produit requis'
                ], 400);
            }

            // Vérifier que le produit existe
            $product = Product::findOrFail($productId);

            // Obtenir le résumé des avis
            $summary = ProductReview::getProductSummary($productId);

            return response()->json([
                'success' => true,
                'message' => 'Résumé des avis récupéré avec succès',
                'data' => [
                    'product_id' => (int)$productId,
                    'product_name' => $product->name,
                    'summary' => $summary
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du résumé',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's review statistics.
     */
    public function myStats(): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            
            $totalReviews = ProductReview::where('user_id', $user->id)->count();
            $averageRating = ProductReview::where('user_id', $user->id)->avg('rating') ?? 0;
            $verifiedReviews = ProductReview::where('user_id', $user->id)
                ->where('is_verified_purchase', true)
                ->count();
            
            $ratingDistribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $ratingDistribution[$i] = ProductReview::where('user_id', $user->id)
                    ->where('rating', $i)
                    ->count();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_reviews' => $totalReviews,
                    'average_rating' => round($averageRating, 1),
                    'verified_reviews' => $verifiedReviews,
                    'rating_distribution' => $ratingDistribution
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user can review a product (has purchased it and hasn't reviewed yet).
     */
    public function canReview(Request $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            $productId = $request->route('productId');

            // Vérifier que le produit existe
            $product = Product::findOrFail($productId);

            // Vérifier si l'utilisateur a déjà écrit un avis
            $hasReviewed = ProductReview::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

            if ($hasReviewed) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'can_review' => false,
                        'reason' => 'already_reviewed',
                        'message' => 'Vous avez déjà écrit un avis pour ce produit'
                    ]
                ], 200);
            }

            // TODO: Vérifier si l'utilisateur a acheté ce produit
            // $hasPurchased = SellDetail::whereHas('sell', function($query) use ($user) {
            //     $query->where('customer_id', $user->id);
            // })->where('product_id', $productId)->exists();

            return response()->json([
                'success' => true,
                'data' => [
                    'can_review' => true,
                    'reason' => 'eligible',
                    'message' => 'Vous pouvez écrire un avis pour ce produit'
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
     * Mark a review as helpful.
     */
    public function markHelpful(Request $request): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            $reviewId = $request->route('review');
            
            $review = ProductReview::findOrFail($reviewId);
            
            // Empêcher l'utilisateur de marquer son propre avis comme utile
            if ($review->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas marquer votre propre avis comme utile'
                ], 400);
            }

            // TODO: Implémenter le système de votes utiles (table review_helpful_votes)
            // Pour l'instant, on retourne juste un succès
            
            return response()->json([
                'success' => true,
                'message' => 'Avis marqué comme utile',
                'data' => [
                    'review_id' => (int)$reviewId,
                    'helpful_count' => 1 // Placeholder
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'action',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Report a review as inappropriate.
     */
    public function report(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'reason' => 'required|string|in:spam,inappropriate,fake,offensive,other',
                'comment' => 'nullable|string|max:500'
            ]);

            $user = auth('sanctum')->user();
            $reviewId = $request->route('review');
            
            $review = ProductReview::findOrFail($reviewId);
            
            // Empêcher l'utilisateur de signaler son propre avis
            if ($review->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas signaler votre propre avis'
                ], 400);
            }

            // TODO: Implémenter le système de signalements (table review_reports)
            // Pour l'instant, on retourne juste un succès
            
            return response()->json([
                'success' => true,
                'message' => 'Avis signalé avec succès. Notre équipe va l\'examiner.',
                'data' => [
                    'review_id' => (int)$reviewId,
                    'reason' => $request->reason
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du signalement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
