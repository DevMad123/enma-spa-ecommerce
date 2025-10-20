<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;

class MenuController extends Controller
{
    public function categories()
    {
        $cats = ProductCategory::query()
            ->where('status', 1)
            ->orderBy('name')
            ->with(['subcategory' => function ($q) {
                $q->select('id','category_id','name','slug')->active()->orderBy('name');
            }])
            ->get(['id','name','slug','image']);

        $payload = $cats->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'subcategories' => $c->subcategory->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'name' => $s->name,
                        'slug' => $s->slug,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json($payload);
    }
}
