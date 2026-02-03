<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;

class MenuController extends Controller
{
    /**
     * Récupère les catégories hiérarchiques pour le menu
     * Nouveau système avec parent_id pour une hiérarchie illimitée
     */
    public function categories()
    {
        // Récupérer les catégories racines avec leurs enfants récursifs
        $rootCategories = ProductCategory::query()
            ->roots() // Catégories sans parent
            ->orderBy('name')
            ->with(['childrenRecursive' => function ($q) {
                $q->select('id', 'parent_id', 'name', 'slug', 'type', 'depth', 'image')
                  ->where('status', 1)
                  ->orderBy('name');
            }])
            ->get(['id', 'name', 'slug', 'type', 'image', 'is_popular']);

        $payload = $rootCategories->map(function ($category) {
            return $this->formatCategory($category);
        })->values();

        return response()->json($payload);
    }

    /**
     * Formate récursivement une catégorie avec ses enfants
     */
    private function formatCategory($category)
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'type' => $category->type,
            'image' => $category->image,
            'is_popular' => $category->is_popular ?? false,
            'children' => $category->childrenRecursive->map(function ($child) {
                return $this->formatCategory($child);
            })->values(),
        ];
    }

    /**
     * Récupère les catégories d'un type spécifique (sneakers, streetwear, etc.)
     */
    public function categoriesByType($type)
    {
        $categories = ProductCategory::query()
            ->where('type', $type)
            ->where('status', 1)
            ->with(['childrenRecursive' => function ($q) {
                $q->where('status', 1)->orderBy('name');
            }])
            ->get();

        $payload = $categories->map(function ($category) {
            return $this->formatCategory($category);
        })->values();

        return response()->json($payload);
    }
}
