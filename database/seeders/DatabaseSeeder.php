<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Shipping;
use App\Models\TaxRule;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Admin',
                'email' => 'admin@enma-shop.com',
                'password' => bcrypt('Admin@Enma2025!'), // Changez ce mot de passe en production !
                'email_verified_at' => now(),
            ]
        );
        User::updateOrCreate(
            ['id' => 2],
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => bcrypt('User@Demo2025!'), // Mot de passe de démonstration
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            AdminDashboardSeeder::class,
            SettingSeeder::class,
            BrandSeeder::class,
            ContactMessageSeeder::class,
            RoleSeeder::class,
            UserRoleSeeder::class,
            BannerSeeder::class,
            ProductCategorySeeder::class,
            ProductSubCategorySeeder::class,
            ProductColorSeeder::class,
            ProductSizeSeeder::class,
            SupplierSeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            CustomerSeeder::class,
            PaymentSeeder::class,
            PaymentMethodSeeder::class,
            ShippingSeeder::class,
            TaxRuleSeeder::class,
            FrontCustomizationSeeder::class,
        ]);
    }
}
