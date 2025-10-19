<?php

namespace Database\Seeders;

use App\Models\Shipping;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShippingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shippingMethods = [
            [
                'name' => 'Livraison Standard',
                'price' => 4.99,
                'description' => 'Livraison standard sous 3-5 jours ouvrés. Idéale pour les commandes non urgentes.',
                'estimated_days' => 4,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Livraison Express',
                'price' => 9.99,
                'description' => 'Livraison rapide sous 24-48h. Parfaite pour vos achats urgents.',
                'estimated_days' => 2,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Livraison Gratuite',
                'price' => 0.00,
                'description' => 'Livraison gratuite pour les commandes de plus de 50€. Délai de 5-7 jours ouvrés.',
                'estimated_days' => 6,
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Livraison Premium',
                'price' => 15.99,
                'description' => 'Livraison premium en 24h avec suivi en temps réel et assurance.',
                'estimated_days' => 1,
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Point Relais',
                'price' => 2.99,
                'description' => 'Retrait dans un point relais près de chez vous sous 3-4 jours.',
                'estimated_days' => 3,
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Livraison Weekend',
                'price' => 12.99,
                'description' => 'Livraison spéciale le weekend pour plus de flexibilité.',
                'estimated_days' => 2,
                'sort_order' => 6,
                'is_active' => false, // Désactivée par défaut pour tester les filtres
            ],
        ];

        foreach ($shippingMethods as $method) {
            Shipping::updateOrCreate(
                ['name' => $method['name']],
                $method
            );
        }

        $this->command->info('Méthodes de livraison créées avec succès !');
    }
}
