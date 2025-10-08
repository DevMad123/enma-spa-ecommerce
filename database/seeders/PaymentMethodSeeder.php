<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'Paiement à la livraison',
                'code' => 'cash_on_delivery',
                'description' => 'Paiement en espèces à la réception de la commande',
                'is_active' => true,
                'sort_order' => 1,
                'config' => [],
            ],
            [
                'name' => 'PayPal',
                'code' => 'paypal',
                'description' => 'Paiement sécurisé via PayPal',
                'is_active' => false,
                'sort_order' => 2,
                'config' => [
                    'client_id' => '',
                    'client_secret' => '',
                    'mode' => 'sandbox'
                ],
            ],
            [
                'name' => 'Orange Money',
                'code' => 'orange_money',
                'description' => 'Paiement mobile via Orange Money',
                'is_active' => false,
                'sort_order' => 3,
                'config' => [
                    'merchant_key' => '',
                    'api_url' => ''
                ],
            ],
            [
                'name' => 'MTN Mobile Money',
                'code' => 'mtn_money',
                'description' => 'Paiement mobile via MTN Mobile Money',
                'is_active' => false,
                'sort_order' => 4,
                'config' => [
                    'api_key' => '',
                    'api_secret' => '',
                    'subscription_key' => ''
                ],
            ],
            [
                'name' => 'Wave',
                'code' => 'wave',
                'description' => 'Paiement mobile via Wave',
                'is_active' => false,
                'sort_order' => 5,
                'config' => [
                    'api_key' => '',
                    'secret_key' => ''
                ],
            ],
            [
                'name' => 'Moov Money',
                'code' => 'moov_money',
                'description' => 'Paiement mobile via Moov Money',
                'is_active' => false,
                'sort_order' => 6,
                'config' => [
                    'merchant_id' => '',
                    'api_key' => ''
                ],
            ],
            [
                'name' => 'VISA',
                'code' => 'visa',
                'description' => 'Paiement par carte bancaire VISA',
                'is_active' => false,
                'sort_order' => 7,
                'config' => [
                    'merchant_id' => '',
                    'api_key' => '',
                    'secret_key' => ''
                ],
            ],
        ];

        foreach ($paymentMethods as $paymentMethod) {
            PaymentMethod::updateOrCreate(
                ['code' => $paymentMethod['code']],
                $paymentMethod
            );
        }
    }
}
