<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductCategory;
use Illuminate\Support\Str;

class ProductCategoryHierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // SNEAKERS - Catégorie racine
        $sneakers = ProductCategory::create([
            'name' => 'Sneakers',
            'slug' => 'sneakers',
            'type' => 'sneakers',
            'parent_id' => null,
            'depth' => 0,
            'status' => true,
            'is_popular' => true,
        ]);

        // Marques Sneakers (niveau 1)
        $nikeSneakers = ProductCategory::create([
            'name' => 'Nike',
            'slug' => 'nike-sneakers',
            'type' => 'sneakers',
            'parent_id' => $sneakers->id,
            'depth' => 1,
            'status' => true,
        ]);

        $adidasSneakers = ProductCategory::create([
            'name' => 'Adidas',
            'slug' => 'adidas-sneakers',
            'type' => 'sneakers',
            'parent_id' => $sneakers->id,
            'depth' => 1,
            'status' => true,
        ]);

        $jordanSneakers = ProductCategory::create([
            'name' => 'Jordan',
            'slug' => 'jordan-sneakers',
            'type' => 'sneakers',
            'parent_id' => $sneakers->id,
            'depth' => 1,
            'status' => true,
        ]);

        $newBalanceSneakers = ProductCategory::create([
            'name' => 'New Balance',
            'slug' => 'new-balance-sneakers',
            'type' => 'sneakers',
            'parent_id' => $sneakers->id,
            'depth' => 1,
            'status' => true,
        ]);

        // Modèles Nike (niveau 2)
        $nikeModels = [
            'Air Force 1' => 'nike-air-force-1',
            'Air Jordan 1' => 'nike-air-jordan-1',
            'Air Max 90' => 'nike-air-max-90',
            'Dunk Low' => 'nike-dunk-low',
            'Blazer Mid' => 'nike-blazer-mid',
            'React' => 'nike-react',
        ];

        foreach ($nikeModels as $name => $slug) {
            ProductCategory::create([
                'name' => $name,
                'slug' => $slug,
                'type' => 'sneakers',
                'parent_id' => $nikeSneakers->id,
                'depth' => 2,
                'status' => true,
            ]);
        }

        // Modèles Adidas (niveau 2)
        $adidasModels = [
            'Stan Smith' => 'adidas-stan-smith',
            'Gazelle' => 'adidas-gazelle',
            'Forum Low' => 'adidas-forum-low',
            'Superstar' => 'adidas-superstar',
            'Samba OG' => 'adidas-samba-og',
            'Campus 00s' => 'adidas-campus-00s',
        ];

        foreach ($adidasModels as $name => $slug) {
            ProductCategory::create([
                'name' => $name,
                'slug' => $slug,
                'type' => 'sneakers',
                'parent_id' => $adidasSneakers->id,
                'depth' => 2,
                'status' => true,
            ]);
        }

        // Modèles Jordan (niveau 2)
        $jordanModels = [
            'Air Jordan 1' => 'jordan-air-jordan-1',
            'Air Jordan 3' => 'jordan-air-jordan-3',
            'Air Jordan 4' => 'jordan-air-jordan-4',
            'Air Jordan 11' => 'jordan-air-jordan-11',
            'Air Jordan 6' => 'jordan-air-jordan-6',
        ];

        foreach ($jordanModels as $name => $slug) {
            ProductCategory::create([
                'name' => $name,
                'slug' => $slug,
                'type' => 'sneakers',
                'parent_id' => $jordanSneakers->id,
                'depth' => 2,
                'status' => true,
            ]);
        }

        // Modèles New Balance (niveau 2)
        $nbModels = [
            '550' => 'new-balance-550',
            '574' => 'new-balance-574',
            '327' => 'new-balance-327',
            '2002R' => 'new-balance-2002r',
            '9060' => 'new-balance-9060',
        ];

        foreach ($nbModels as $name => $slug) {
            ProductCategory::create([
                'name' => $name,
                'slug' => $slug,
                'type' => 'sneakers',
                'parent_id' => $newBalanceSneakers->id,
                'depth' => 2,
                'status' => true,
            ]);
        }

        // STREETWEAR - Catégorie racine
        $streetwear = ProductCategory::create([
            'name' => 'Streetwear',
            'slug' => 'streetwear',
            'type' => 'streetwear',
            'parent_id' => null,
            'depth' => 0,
            'status' => true,
            'is_popular' => true,
        ]);

        // Marques Streetwear (niveau 1)
        $supremeStreet = ProductCategory::create([
            'name' => 'Supreme',
            'slug' => 'supreme-streetwear',
            'type' => 'streetwear',
            'parent_id' => $streetwear->id,
            'depth' => 1,
            'status' => true,
        ]);

        $offWhiteStreet = ProductCategory::create([
            'name' => 'Off-White',
            'slug' => 'off-white-streetwear',
            'type' => 'streetwear',
            'parent_id' => $streetwear->id,
            'depth' => 1,
            'status' => true,
        ]);

        $stussyStreet = ProductCategory::create([
            'name' => 'Stussy',
            'slug' => 'stussy-streetwear',
            'type' => 'streetwear',
            'parent_id' => $streetwear->id,
            'depth' => 1,
            'status' => true,
        ]);

        // Types de vêtements Supreme (niveau 2)
        $supremeTypes = [
            'Box Logo' => 'supreme-box-logo',
            'T-Shirts' => 'supreme-t-shirts',
            'Hoodies' => 'supreme-hoodies',
            'Jackets' => 'supreme-jackets',
            'Accessories' => 'supreme-accessories',
        ];

        foreach ($supremeTypes as $name => $slug) {
            ProductCategory::create([
                'name' => $name,
                'slug' => $slug,
                'type' => 'streetwear',
                'parent_id' => $supremeStreet->id,
                'depth' => 2,
                'status' => true,
            ]);
        }

        // Types de vêtements Off-White (niveau 2)
        $offWhiteTypes = [
            'Graphic Tees' => 'off-white-graphic-tees',
            'Hoodies' => 'off-white-hoodies',
            'Jeans' => 'off-white-jeans',
            'Bags' => 'off-white-bags',
            'Belts' => 'off-white-belts',
        ];

        foreach ($offWhiteTypes as $name => $slug) {
            ProductCategory::create([
                'name' => $name,
                'slug' => $slug,
                'type' => 'streetwear',
                'parent_id' => $offWhiteStreet->id,
                'depth' => 2,
                'status' => true,
            ]);
        }

        $this->command->info('✅ Hiérarchie de catégories créée avec succès !');
        $this->command->info('📊 Total catégories: ' . ProductCategory::count());
        $this->command->info('🔝 Catégories racines: ' . ProductCategory::roots()->count());
    }
}
