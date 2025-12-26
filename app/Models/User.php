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
        'first_name',
        'last_name',
        'email',
        'password',
        'email_verified_at',
        'status',
        'avatar',
        'last_login_at'
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
     * The attributes that should be appended to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'avatar_url',
        'default_avatar_url',
        'formatted_last_login'
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
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'integer',
        ];
    }

    /**
     * Send the email verification notification using custom notification.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification());
    }

    /**
     * Get the full URL for the user's avatar
     *
     * @return string
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar && \Storage::disk('public')->exists($this->avatar)) {
            return \Storage::url($this->avatar);
        }
        
        // Image par défaut avec initiales
        return $this->default_avatar_url;
    }

    /**
     * Get default avatar URL with user initials
     *
     * @return string
     */
    public function getDefaultAvatarUrlAttribute()
    {
        return $this->getDefaultAvatarUrl();
    }

    /**
     * Get default avatar URL with user initials
     *
     * @return string
     */
    public function getDefaultAvatarUrl()
    {
        $initials = strtoupper(substr($this->name, 0, 1));
        return "https://ui-avatars.com/api/?name=" . urlencode($this->name) . "&color=7F9CF5&background=EBF4FF&size=200";
    }

    /**
     * Get formatted last login date
     *
     * @return string|null
     */
    public function getFormattedLastLoginAttribute()
    {
        if (!$this->last_login_at) {
            return 'Jamais connecté';
        }

        return $this->last_login_at->format('d F Y à H\hi');
    }

    /**
     * Update last login timestamp
     *
     * @return void
     */
    public function updateLastLogin()
    {
        $this->update(['last_login_at' => now()]);
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

    /**
     * Explicitly route mail notifications to the user's email address.
     */
    public function routeNotificationForMail($notification)
    {
        return $this->email;
    }

    // Helper pour vérifier si c'est un admin (pour compatibilité avec le middleware existant)
    public function getIsAdminAttribute()
    {
        return $this->hasRole('Admin') || $this->hasRole('Manager');
    }

    // Scope pour filtrer par rôle
    public function scopeWithRole($query, $roleName)
    {
        return $query->whereHas('roles', function($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    // Scope pour filtrer par statut
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }

    // Accessor pour le nom complet
    public function getFullNameAttribute()
    {
        return $this->first_name && $this->last_name 
            ? $this->first_name . ' ' . $this->last_name 
            : $this->name;
    }

    // Accessor pour le statut texte
    public function getStatusTextAttribute()
    {
        return $this->status ? 'Actif' : 'Inactif';
    }
}
