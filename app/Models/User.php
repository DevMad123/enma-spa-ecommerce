<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function ecommerceCustomer()
    {
        return $this->hasOne(Ecommerce_customer::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    /**
     * Relation avec la wishlist
     */
    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Relation avec les avis produits
     */
    public function productReviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    /**
     * Vérifier si un produit est dans la wishlist
     */
    public function hasInWishlist($productId)
    {
        return $this->wishlistItems()->where('product_id', $productId)->exists();
    }

    /**
     * Ajouter un produit à la wishlist
     */
    public function addToWishlist($productId)
    {
        if (!$this->hasInWishlist($productId)) {
            return $this->wishlistItems()->create(['product_id' => $productId]);
        }
        return false;
    }

    /**
     * Retirer un produit de la wishlist
     */
    public function removeFromWishlist($productId)
    {
        return $this->wishlistItems()->where('product_id', $productId)->delete();
    }

    public function hasRole($roleName)
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    public function hasPermission($permissionName)
    {
        return $this->roles()
            ->whereHas('permissions', function($q) use ($permissionName) {
                $q->where('name', $permissionName);
            })
            ->exists();
    }

    public function assignRole($roleNameOrId)
    {
        $role = is_numeric($roleNameOrId) 
            ? Role::find($roleNameOrId)
            : Role::where('name', $roleNameOrId)->first();
        
        if ($role && !$this->hasRole($role->name)) {
            $this->roles()->attach($role->id);
        }
    }

    public function removeRole($roleNameOrId)
    {
        $role = is_numeric($roleNameOrId) 
            ? Role::find($roleNameOrId)
            : Role::where('name', $roleNameOrId)->first();
        
        if ($role) {
            $this->roles()->detach($role->id);
        }
    }

    // Helper pour vérifier si c'est un admin (pour compatibilité avec le middleware existant)
    public function getIsAdminAttribute()
    {
        return $this->hasRole('admin');
    }

    // Scope pour filtrer par rôle
    public function scopeWithRole($query, $roleName)
    {
        return $query->whereHas('roles', function($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }
}
