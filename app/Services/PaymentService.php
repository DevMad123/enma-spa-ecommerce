<?php

namespace App\Services;

use App\Contracts\PaymentProcessorInterface;
use App\Models\Sell;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Providers de paiement disponibles
     */
    private array $providers = [];

    /**
     * Provider actuellement sélectionné
     */
    private ?PaymentProcessorInterface $activeProvider = null;

    public function __construct()
    {
        $this->loadProviders();
    }

    /**
     * Charge tous les providers de paiement configurés
     */
    private function loadProviders(): void
    {
        // Charger les providers selon la configuration
        $availableProviders = [
            'paypal' => \App\Services\Payment\PayPalProcessor::class,
            'orange_money' => \App\Services\Payment\OrangeMoneyProcessor::class,
            'wave' => \App\Services\Payment\WaveProcessor::class,
        ];

        foreach ($availableProviders as $name => $class) {
            try {
                if (class_exists($class)) {
                    $provider = app($class);
                    if ($provider->isAvailable()) {
                        $this->providers[$name] = $provider;
                        Log::info("Payment provider loaded: {$name}");
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Failed to load payment provider {$name}: " . $e->getMessage());
            }
        }
    }

    /**
     * Sélectionne un provider de paiement
     *
     * @param string $providerName Nom du provider (paypal, orange_money, wave)
     * @return self
     * @throws \Exception Si le provider n'est pas disponible
     */
    public function useProvider(string $providerName): self
    {
        if (!isset($this->providers[$providerName])) {
            throw new \Exception("Payment provider '{$providerName}' not available");
        }

        $this->activeProvider = $this->providers[$providerName];
        
        Log::info("Payment provider selected: {$providerName}");
        
        return $this;
    }

    /**
     * Obtient la liste des providers disponibles
     *
     * @return array Liste des providers avec leurs informations
     */
    public function getAvailableProviders(): array
    {
        $result = [];
        
        foreach ($this->providers as $name => $provider) {
            $result[$name] = [
                'name' => $provider->getProviderName(),
                'available' => $provider->isAvailable(),
                'supported_currencies' => $provider->getSupportedCurrencies(),
            ];
        }
        
        return $result;
    }

    /**
     * Crée un paiement avec le provider sélectionné
     *
     * @param Sell $order Commande à payer
     * @param string $providerName Provider à utiliser
     * @param array $additionalData Données additionnelles
     * @return array Résultat de la création du paiement
     */
    public function createPaymentForOrder(Sell $order, string $providerName, array $additionalData = []): array
    {
        DB::beginTransaction();

        try {
            // Vérifier que la commande peut être payée
            $this->validateOrderForPayment($order);

            // Sélectionner le provider
            $this->useProvider($providerName);

            // Créer le paiement
            $paymentResult = $this->activeProvider->createPayment($order, $additionalData);

            // Enregistrer la transaction
            $transaction = $this->createTransactionRecord($order, $providerName, $paymentResult);

            DB::commit();

            Log::info('Payment created successfully', [
                'order_id' => $order->id,
                'provider' => $providerName,
                'payment_id' => $paymentResult['payment_id'] ?? null,
                'transaction_id' => $transaction->id,
            ]);

            return array_merge($paymentResult, [
                'transaction_id' => $transaction->id,
                'order_id' => $order->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Payment creation failed', [
                'order_id' => $order->id,
                'provider' => $providerName,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Méthode héritée - Créer un paiement (compatibilité)
     * @deprecated Utiliser createPaymentForOrder() pour les nouvelles intégrations
     */
    public function createPayment(array $paymentData)
    {
        return DB::transaction(function () use ($paymentData) {
            // Définir automatiquement le statut comme pending
            $paymentData['status'] = 'pending';

            // Créer le paiement
            $payment = Payment::create($paymentData);

            // Mettre à jour les statuts de la commande si elle existe
            if (isset($paymentData['sell_id']) && $paymentData['sell_id']) {
                $this->updateOrderPaymentStatus($paymentData['sell_id']);
            }

            return $payment;
        });
    }

    /**
     * Valide qu'une commande peut être payée
     */
    private function validateOrderForPayment(Sell $order): void
    {
        if ($order->payment_status == 1) {
            throw new \Exception('Cette commande est déjà payée');
        }

        if ($order->total_price <= 0) {
            throw new \Exception('Montant de commande invalide');
        }
    }

    /**
     * Crée une transaction en base de données
     */
    private function createTransactionRecord(Sell $order, string $providerName, array $paymentResult): Transaction
    {
        return Transaction::create([
            'sell_id' => $order->id,
            'payment_method' => $providerName,
            'payment_id' => $paymentResult['payment_id'] ?? null,
            'amount' => $order->total_price,
            'currency' => 'EUR', // À adapter selon votre système
            'status' => 'pending',
            'provider_response' => json_encode($paymentResult),
            'created_at' => now(),
        ]);
    }

    /**
     * Valider un paiement et traiter la commande complètement
     */
    public function validatePayment(Payment $payment, $validatedBy = null)
    {
        return DB::transaction(function () use ($payment, $validatedBy) {
            // Marquer le paiement comme réussi
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
            ]);

            // Mettre à jour les statuts de la commande
            if ($payment->sell_id) {
                $sell = $this->updateOrderPaymentStatus($payment->sell_id);
                
                // Si la commande est entièrement payée, effectuer les actions post-paiement
                if ($sell->payment_status == 1) {
                    $sell->markAsPaid($validatedBy ?? auth()->id());
                    
                    Log::info("Commande {$sell->id} marquée comme payée avec invoice_id: {$sell->invoice_id}");
                }
            }

            return $payment;
        });
    }

    /**
     * Mettre à jour automatiquement les statuts de paiement d'une commande
     */
    public function updateOrderPaymentStatus($sellId)
    {
        $sell = Sell::with('payments')->findOrFail($sellId);

        // Calculer le total payé (seuls les paiements réussis comptent)
        $totalPaid = $sell->payments()
            ->successful()
            ->sum('total_paid');

        // Calculer le montant total à payer
        $totalAmount = $sell->total_payable_amount;

        // Déterminer le nouveau statut de paiement
        $newPaymentStatus = $this->determinePaymentStatus($totalPaid, $totalAmount);

        // Mettre à jour la commande
        $sell->update([
            'total_paid' => $totalPaid,
            'total_due' => max(0, $totalAmount - $totalPaid),
            'payment_status' => $newPaymentStatus,
        ]);

        Log::info("Statut de paiement mis à jour pour la commande {$sellId}: {$newPaymentStatus}");

        return $sell;
    }

    /**
     * Déterminer le statut de paiement selon les montants
     */
    private function determinePaymentStatus($totalPaid, $totalAmount)
    {
        if ($totalPaid <= 0) {
            return 0; // Non payé
        } elseif ($totalPaid >= $totalAmount) {
            return 1; // Entièrement payé
        } else {
            return 2; // Partiellement payé
        }
    }

    /**
     * Rejeter un paiement
     */
    public function rejectPayment(Payment $payment)
    {
        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'failed',
            ]);

            // Mettre à jour les statuts de la commande
            if ($payment->sell_id) {
                $this->updateOrderPaymentStatus($payment->sell_id);
            }

            return $payment;
        });
    }



    /**
     * Rembourser un paiement
     */
    public function refundPayment(Payment $payment)
    {
        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'refunded',
            ]);

            // Mettre à jour les statuts de la commande
            if ($payment->sell_id) {
                $this->updateOrderPaymentStatus($payment->sell_id);
            }

            return $payment;
        });
    }
}
