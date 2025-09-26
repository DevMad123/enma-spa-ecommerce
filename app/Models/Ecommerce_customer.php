<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Ecommerce_customer extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $table = 'ecommerce_customers';

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'image',
        'email',
        'phone_one',
        'phone_two',
        'present_address',
        'permanent_address',
        'password',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'status' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'deleted_by' => 'integer',
        'password' => 'hashed',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sells()
    {
        return $this->hasMany(Sell::class, 'customer_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getImageUrlAttribute()
    {
        if ($this->image && \Storage::exists('public/' . $this->image)) {
            return \Storage::url($this->image);
        }
        return asset('assets/front/imgs/default-user.png');
    }

    public function getStatusTextAttribute()
    {
        return $this->status ? 'Active' : 'Inactive';
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', '%' . $search . '%')
              ->orWhere('last_name', 'like', '%' . $search . '%')
              ->orWhere('email', 'like', '%' . $search . '%')
              ->orWhere('phone_one', 'like', '%' . $search . '%');
        });
    }

    // Methods
    public function getTotalOrdersCount()
    {
        return $this->sells()->count();
    }

    public function getTotalOrdersAmount()
    {
        return $this->sells()->sum('grand_total');
    }

    public function getLastOrderDate()
    {
        return $this->sells()->latest()->first()?->created_at;
    }

    /**
     * Un utilisateur peut avoir plusieurs éléments dans sa wishlist.
     */
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class, 'user_id');
    }

    /**
     * Un utilisateur peut écrire plusieurs avis.
     */
    public function reviews()
    {
        return $this->hasMany(ProductReview::class, 'user_id');
    }

    /**
     * Récupère les produits dans la wishlist de l'utilisateur.
     */
    public function wishlistProducts()
    {
        return $this->belongsToMany(Product::class, 'wishlists', 'user_id', 'product_id')
                    ->withTimestamps();
    }

    /**
     * Vérifie si un produit est dans la wishlist de l'utilisateur.
     */
    public function hasInWishlist($productId)
    {
        return $this->wishlists()->where('product_id', $productId)->exists();
    }

    /**
     * Ajoute un produit à la wishlist.
     */
    public function addToWishlist($productId)
    {
        if (!$this->hasInWishlist($productId)) {
            return $this->wishlists()->create(['product_id' => $productId]);
        }
        return false;
    }

    /**
     * Retire un produit de la wishlist.
     */
    public function removeFromWishlist($productId)
    {
        return $this->wishlists()->where('product_id', $productId)->delete();
    }

    /**
     * Vérifie si l'utilisateur peut écrire un avis pour un produit.
     */
    public function canReviewProduct($productId)
    {
        return !$this->reviews()->where('product_id', $productId)->exists();
    }
}
