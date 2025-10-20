<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FrontCustomization;

class FrontCustomizationSeeder extends Seeder
{
    public function run(): void
    {
        if (!FrontCustomization::query()->exists()) {
            FrontCustomization::create([
                'hero_enabled' => false,
                'hero_product_id' => null,
                'hero_background_image' => null,
                'hero_title' => 'Découvrez nos nouveautés',
                'hero_subtitle' => 'Des sélections exclusives au meilleur prix',
                'featured_section_enabled' => true,
                'newsletter_enabled' => true,
                'theme_color' => '#f97316', // orange-500
                'logo_image' => null,
            ]);
        }
    }
}

