<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        // Build variants payload with relations if loaded
        $variants = $this->whenLoaded('variants', function () {
            return $this->variants->map(function ($variant) {
                $firstImage = optional($variant->images->first());
                return [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
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
            })->values();
        }, function () {
            // Lazy-load minimal variant info if not eager loaded
            return $this->variants()->with(['color', 'size', 'images'])->get()->map(function ($variant) {
                $firstImage = optional($variant->images->first());
                return [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
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
            })->values();
        });

        $priceRange = $this->price_range ?? ['min' => (float) ($this->current_sale_price ?? 0), 'max' => (float) ($this->current_sale_price ?? 0)];
        $minPrice = (float) ($priceRange['min'] ?? 0);
        $maxPrice = (float) ($priceRange['max'] ?? 0);
        // Format string: either "A partir de ..." or single price
        $formattedPriceRange = $minPrice === $maxPrice
            ? format_currency($minPrice)
            : 'A partir de ' . format_currency($minPrice);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'category_id' => $this->category_id,
            'subcategory_id' => $this->subcategory_id,
            'image_path' => $this->image_path,
            'supplier_id' => $this->supplier_id,
            'code' => $this->code,
            'color' => $this->color,
            'size' => $this->size,
            'brand_id' => $this->brand_id,
            'current_sale_price' => round($this->current_sale_price),
            'current_purchase_cost' => $this->current_purchase_cost,
            'current_wholesale_price' => $this->current_wholesale_price,
            'wholesale_minimum_qty' => $this->wholesale_minimum_qty,
            'previous_wholesale_price' => $this->previous_wholesale_price,
            'previous_sale_price' => $this->previous_sale_price,
            'previous_purchase_cost' => $this->previous_purchase_cost,
            'available_quantity' => $this->available_quantity,
            'discount_type' => $this->discount_type,
            'discount' => $this->discount,
            'unit_type' => $this->unit_type,
            'description' => $this->description,
            'offer_amount' => 0,
            'offer_type' => 0,
            'is_popular' => $this->is_popular,
            'is_trending' => $this->is_trending,
            'category_info' => new ProductCategoryResource($this->productCategory),
            'sub_category_info' => new ProductSubCategoryResource($this->productSubcategory),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'created_by' => $this->created_by,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'deleted' => $this->deleted,
            'deleted_at' => $this->deleted_at,
            'deleted_by' => $this->deleted_by,
            // Variants + min/max prices
            'variants' => $variants,
            'price_min' => $minPrice,
            'price_max' => $maxPrice,
            'price_range' => $formattedPriceRange,
        ];
    }
}

