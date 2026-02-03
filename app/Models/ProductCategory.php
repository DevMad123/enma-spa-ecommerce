<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProductCategory extends Model
{
    use HasFactory;

    public $timestamps=false;
    protected $fillable=[
        'name',
        'slug',
        'note',
        'image',
        'is_popular',
        'status',
        'parent_id',
        'depth',
        'type',
        'created_by'
    ];
    protected $appends = ['category_icon', 'image'];

    public function getCategoryIconAttribute()
    {
        if($this->image){
            return $this->image;
        }else{
            return "storage/category_icons/empty2.png";
        }

    }

    /**
     * Relation: Catégories enfants (système hiérarchique)
     */
    public function children(){
        return $this->hasMany(ProductCategory::class, 'parent_id', 'id')->where('status', true);
    }

    /**
     * Relation: Catégories enfants récursives (tous les niveaux)
     */
    public function childrenRecursive(){
        return $this->children()->with('childrenRecursive');
    }

    /**
     * Relation: Catégorie parente
     */
    public function parent(){
        return $this->belongsTo(ProductCategory::class, 'parent_id');
    }

    /**
     * Scope: Récupérer seulement les catégories racines (sans parent)
     */
    public function scopeRoots($query){
        return $query->whereNull('parent_id')->where('status', true);
    }

    /**
     * Scope: Récupérer les catégories par type
     */
    public function scopeOfType($query, $type){
        return $query->where('type', $type)->where('status', true);
    }

    public function products(){
        return $this->hasMany(Product::class,'category_id','id');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = static::generateUniqueSlug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name')) {
                $category->slug = static::generateUniqueSlug($category->name, $category->id);
            }
        });
    }

    /**
     * Generate a unique slug for the category.
     */
    protected static function generateUniqueSlug($name, $excludeId = null)
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        $query = static::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
            $query = static::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }

    /**
     * Accesseur pour l'attribut image - utilise le même logic que category_icon.
     */
    public function getImageAttribute()
    {
        if(isset($this->attributes['image']) && $this->attributes['image']){
            // Si l'image commence par 'http', c'est une URL complète
            if (str_starts_with($this->attributes['image'], 'http')) {
                return $this->attributes['image'];
            }
            // Sinon, on construit l'URL complète
            return asset($this->attributes['image']);
        }else{
            return asset('images/category-placeholder.jpg');
        }
    }
}
