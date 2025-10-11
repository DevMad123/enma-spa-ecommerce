<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sell_details extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sell_id',
        'product_id',
        'product_variant_id',
        'unit_product_cost',
        'unit_sell_price',
        'unit_vat',
        'sale_quantity',
        'total_discount',
        'total_payable_amount',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'sell_id' => 'integer',
        'product_id' => 'integer',
        'product_variant_id' => 'integer',
        'unit_product_cost' => 'decimal:2',
        'unit_sell_price' => 'decimal:2',
        'unit_vat' => 'decimal:2',
        'sale_quantity' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_payable_amount' => 'decimal:2',
        'status' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'deleted_by' => 'integer',
    ];

    // Relations
    public function sell()
    {
        return $this->belongsTo(Sell::class, 'sell_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Relation vers la couleur via le variant de produit
     */
    public function color()
    {
        return $this->hasOneThrough(
            ProductColor::class,
            ProductVariant::class,
            'id', // Foreign key on ProductVariant table
            'id', // Foreign key on ProductColor table
            'product_variant_id', // Local key on Sell_details table
            'color_id' // Local key on ProductVariant table
        );
    }

    /**
     * Relation vers la taille via le variant de produit
     */
    public function size()
    {
        return $this->hasOneThrough(
            ProductSize::class,
            ProductVariant::class,
            'id', // Foreign key on ProductVariant table
            'id', // Foreign key on ProductSize table
            'product_variant_id', // Local key on Sell_details table
            'size_id' // Local key on ProductVariant table
        );
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
    public function getProductNameAttribute()
    {
        if ($this->product_variant_id && $this->productVariant) {
            return $this->product->name . ' - ' . $this->productVariant->variant_name;
        }
        return $this->product?->name ?? 'Produit supprimé';
    }

    public function getSubtotalAttribute()
    {
        return $this->sale_quantity * $this->unit_sell_price;
    }

    // Methods
    public function calculateTotal()
    {
        $subtotal = $this->sale_quantity * $this->unit_sell_price;
        $vatAmount = $subtotal * ($this->unit_vat / 100);
        $this->total_payable_amount = $subtotal + $vatAmount - $this->total_discount;
        return $this;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($sellDetail) {
            $sellDetail->calculateTotal();
        });
    }
}
