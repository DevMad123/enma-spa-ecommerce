<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ProductReview extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
        'is_verified_purchase',
        'is_approved',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that wrote the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the product that was reviewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope a query to only include approved reviews.
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include reviews for a specific product.
     */
    public function scopeForProduct(Builder $query, int $productId): Builder
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope a query to only include reviews by a specific user.
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include verified purchase reviews.
     */
    public function scopeVerifiedPurchase(Builder $query): Builder
    {
        return $query->where('is_verified_purchase', true);
    }

    /**
     * Scope a query to filter by rating.
     */
    public function scopeWithRating(Builder $query, int $rating): Builder
    {
        return $query->where('rating', $rating);
    }

    /**
     * Get the review summary for a product.
     */
    public static function getProductSummary(int $productId): array
    {
        $reviews = static::approved()->forProduct($productId);
        
        return [
            'total_reviews' => $reviews->count(),
            'average_rating' => round($reviews->avg('rating') ?? 0, 1),
            'rating_distribution' => static::getRatingDistribution($productId),
            'verified_purchases_count' => $reviews->verifiedPurchase()->count(),
        ];
    }

    /**
     * Get rating distribution for a product.
     */
    public static function getRatingDistribution(int $productId): array
    {
        $distribution = [];
        
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = static::approved()
                ->forProduct($productId)
                ->withRating($i)
                ->count();
        }
        
        return $distribution;
    }

    /**
     * Check if a user can review a product (hasn't reviewed it yet).
     */
    public static function canUserReviewProduct(int $userId, int $productId): bool
    {
        return !static::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();
    }
}
