<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TaxRule;

class TaxRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxRules = [
            [
                'country_code' => 'CI',
                'country_name' => 'Côte d\'Ivoire',
                'tax_rate' => 0.00,
                'is_default' => true,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA standard'
            ],
            [
                'country_code' => 'FR',
                'country_name' => 'France',
                'tax_rate' => 20.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 30,
                'notes' => 'TVA standard française'
            ],
            [
                'country_code' => 'BE',
                'country_name' => 'Belgique',
                'tax_rate' => 21.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 50,
                'notes' => 'TVA belge avec montant minimum'
            ],
            [
                'country_code' => 'CH',
                'country_name' => 'Suisse',
                'tax_rate' => 7.70,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 100,
                'notes' => 'TVA suisse'
            ],
            [
                'country_code' => 'LU',
                'country_name' => 'Luxembourg',
                'tax_rate' => 17.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA luxembourgeoise'
            ],
            [
                'country_code' => 'DE',
                'country_name' => 'Allemagne',
                'tax_rate' => 19.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA allemande'
            ],
            [
                'country_code' => 'ES',
                'country_name' => 'Espagne',
                'tax_rate' => 21.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA espagnole'
            ],
            [
                'country_code' => 'IT',
                'country_name' => 'Italie',
                'tax_rate' => 22.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA italienne'
            ],
            [
                'country_code' => 'SN',
                'country_name' => 'Sénégal',
                'tax_rate' => 18.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA sénégalaise'
            ],
            [
                'country_code' => 'MA',
                'country_name' => 'Maroc',
                'tax_rate' => 20.00,
                'is_default' => false,
                'delivery_allowed' => true,
                'is_active' => true,
                'min_order_amount' => 0,
                'notes' => 'TVA marocaine'
            ]
        ];

        foreach ($taxRules as $taxRule) {
            TaxRule::create($taxRule);
        }
    }
}
