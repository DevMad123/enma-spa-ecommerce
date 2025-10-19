<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Sell;
use App\Models\User;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if payments already seeded to avoid duplicates
        if (\App\Models\Payment::query()->exists()) {
            if (isset($this->command)) {
                $this->command->info('Payments already exist, skipping PaymentSeeder');
            }
            return;
        }
        // Récupérer quelques commandes existantes
        $sells = Sell::with('customer')->take(5)->get();
        
        if ($sells->isEmpty()) {
            $this->command->info('Aucune commande trouvée. Créez d\'abord des commandes avant d\'exécuter ce seeder.');
            return;
        }

        $admin = User::first(); // Prendre le premier utilisateur comme admin

        foreach ($sells as $sell) {
            // Créer 1-3 paiements par commande
            $numberOfPayments = rand(1, 3);
            $totalAmount = $sell->total_payable_amount;
            $remainingAmount = $totalAmount;

            for ($i = 0; $i < $numberOfPayments && $remainingAmount > 0; $i++) {
                // Calculer le montant pour ce paiement
                if ($i === $numberOfPayments - 1) {
                    // Dernier paiement : payer le reste
                    $paymentAmount = $remainingAmount;
                } else {
                    // Paiement partiel : 20% à 80% du reste
                    $percentage = rand(20, 80) / 100;
                    $paymentAmount = round($remainingAmount * $percentage, 2);
                }

                $methods = ['cash', 'card', 'orange_money', 'wave', 'paypal', 'bank_transfer'];
                $statuses = ['pending', 'success', 'failed'];
                
                // Plus de chances d'avoir des paiements réussis
                $statusWeights = [
                    'success' => 70,
                    'pending' => 20,
                    'failed' => 10,
                ];
                
                $rand = rand(1, 100);
                if ($rand <= 70) {
                    $status = 'success';
                } elseif ($rand <= 90) {
                    $status = 'pending';
                } else {
                    $status = 'failed';
                }

                $paymentDate = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));

                Payment::create([
                    'sell_id' => $sell->id,
                    'method' => $methods[array_rand($methods)],
                    'amount' => $paymentAmount,
                    'currency' => 'XOF',
                    'status' => $status,
                    'transaction_reference' => $this->generateTransactionReference(),
                    'payment_date' => $paymentDate,
                    'notes' => $this->generateNotes(),
                    'created_by' => $admin ? $admin->id : null,
                    'updated_by' => $admin ? $admin->id : null,
                    'created_at' => $paymentDate,
                    'updated_at' => $paymentDate,
                ]);

                // Réduire le montant restant seulement si le paiement est réussi
                if ($status === 'success') {
                    $remainingAmount -= $paymentAmount;
                }
            }
        }

        $this->command->info('Paiements de test créés avec succès !');
    }

    private function generateTransactionReference(): string
    {
        $prefixes = ['TXN', 'PAY', 'REF', 'ORD', 'PMT'];
        $prefix = $prefixes[array_rand($prefixes)];
        $number = str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        return $prefix . '-' . $number;
    }

    private function generateNotes(): ?string
    {
        $notes = [
            'Paiement effectué en magasin',
            'Paiement reçu par téléphone',
            'Virement bancaire confirmé',
            'Paiement mobile validé',
            'Espèces reçues lors de la livraison',
            'Paiement en ligne via le site web',
            null, // Pas de notes
            null,
            null,
        ];
        
        return $notes[array_rand($notes)];
    }
}
