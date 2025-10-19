<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Brand;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Apple',
                'description' => 'Leader mondial en technologie et innovation électronique',
                'status' => true,
            ],
            [
                'name' => 'Samsung',
                'description' => 'Géant sud-coréen de l\'électronique et des smartphones',
                'status' => true,
            ],
            [
                'name' => 'Nike',
                'description' => 'Marque emblématique d\'équipements sportifs et de baskets',
                'status' => true,
            ],
            [
                'name' => 'Sony',
                'description' => 'Spécialiste japonais de l\'électronique grand public',
                'status' => true,
            ],
            [
                'name' => 'Adidas',
                'description' => 'Marque allemande d\'articles de sport et de mode',
                'status' => false, // Une marque inactive pour test
            ],
            [
                'name' => 'LG',
                'description' => 'Constructeur sud-coréen d\'électroménager et d\'électronique',
                'status' => true,
            ],
        ];

        foreach ($brands as $brandData) {
            Brand::updateOrCreate(
                ['name' => $brandData['name']],
                $brandData
            );
        }
    }
}
