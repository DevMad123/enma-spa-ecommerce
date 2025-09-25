<?php

namespace App\Console\Commands;

use App\Models\ProductCategory;
use App\Models\ProductSubCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateCategorySlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:category-slugs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate slugs for existing categories and subcategories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating slugs for categories...');

        // Générer les slugs pour les catégories
        $categories = ProductCategory::whereNull('slug')->orWhere('slug', '')->get();
        
        foreach ($categories as $category) {
            $slug = !empty($category->name) ? Str::slug($category->name) : 'category-' . $category->id;
            
            // S'assurer que le slug est unique
            $originalSlug = $slug;
            $counter = 1;
            while (ProductCategory::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $category->slug = $slug;
            $category->save();
            
            $this->line("Category: {$category->name} -> {$slug}");
        }

        // Générer les slugs pour les sous-catégories
        $subCategories = ProductSubCategory::whereNull('slug')->orWhere('slug', '')->get();
        
        foreach ($subCategories as $subCategory) {
            $slug = !empty($subCategory->name) ? Str::slug($subCategory->name) : 'subcategory-' . $subCategory->id;
            
            // S'assurer que le slug est unique
            $originalSlug = $slug;
            $counter = 1;
            while (ProductSubCategory::where('slug', $slug)->where('id', '!=', $subCategory->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $subCategory->slug = $slug;
            $subCategory->save();
            
            $this->line("Sub-category: {$subCategory->name} -> {$slug}");
        }

        $this->info('Slugs generation completed!');
        
        return 0;
    }
}
