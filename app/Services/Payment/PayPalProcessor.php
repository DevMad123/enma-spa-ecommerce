<?php

namespace App\Services\Payment;

use App\Contracts\PaymentProcessorInterface;
use App\Models\Sell;
use App\Services\PayPalService;
use Illuminate\Support\Facades\Log;

class PayPalProcessor implements PaymentProcessorInterface
{
    private PayPalService $paypalService;
    private bool $initialized = false;

    /**
     * Initialise le service PayPal
     */
    public function initialize(array $config = []): void
    {
        try {
            $this->paypalService = new PayPalService();
            $this->initialized = true;
            
            Log::info('PayPal processor initialized successfully');
            
        } catch (\Exception $e) {
            $this->initialized = false;
            Log::error('PayPal processor initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Vérifie si PayPal est disponible
     */
    public function isAvailable(): bool
    {
        if (!$this->initialized) {
            try {
                $this->initialize();
            } catch (\Exception $e) {
                return false;
            }
        }

        return $this->initialized && $this->paypalService && $this->paypalService->isConfigured();
    }

    /**
     * Crée un paiement PayPal
     */
    public function createPayment(Sell $order, array $additionalData = []): array
    {
        if (!$this->isAvailable()) {
            throw new \Exception('PayPal is not configured or available');
        }

        try {
            $paymentData = [
                'amount' => $this->formatAmount($order->total_price),
                'currency' => 'EUR',
                'description' => "Commande #{$order->invoice_id}",
                'order_id' => $order->id,
                'success_url' => $additionalData['success_url'] ?? route('paypal.callback.success', ['order_id' => $order->id]),
                'cancel_url' => $additionalData['cancel_url'] ?? route('paypal.callback.cancel', ['order_id' => $order->id]),
            ];

            $response = $this->paypalService->createPayment($paymentData);

            Log::info('PayPal payment created', [
                'order_id' => $order->id,
                'payment_id' => $response['id'] ?? null,
            ]);

            return [
                'success' => true,
                'payment_id' => $response['id'],
                'approval_url' => $response['approval_url'],
                'provider' => 'paypal',
            ];

        } catch (\Exception $e) {
            Log::error('PayPal payment creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Vérifie le statut d'un paiement PayPal
     */
    public function checkPaymentStatus(string $paymentId, Sell $order): array
    {
        try {
            $paymentDetails = $this->paypalService->getPaymentDetails($paymentId);

            $status = $this->mapPayPalStatusToStandardStatus($paymentDetails['state'] ?? 'unknown');

            return [
                'status' => $status,
                'payment_id' => $paymentId,
                'transaction_id' => $paymentDetails['transactions'][0]['related_resources'][0]['sale']['id'] ?? null,
                'amount' => $paymentDetails['transactions'][0]['amount']['total'] ?? 0,
                'currency' => $paymentDetails['transactions'][0]['amount']['currency'] ?? 'EUR',
                'raw_response' => $paymentDetails,
            ];

        } catch (\Exception $e) {
            Log::error('PayPal status check failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Traite le callback de succès PayPal
     */
    public function handleSuccessCallback(array $callbackData, Sell $order): array
    {
        try {
            $paymentId = $callbackData['paymentId'] ?? null;
            $payerId = $callbackData['PayerID'] ?? null;

            if (!$paymentId || !$payerId) {
                throw new \Exception('Invalid PayPal callback data');
            }

            $result = $this->paypalService->executePayment($paymentId, $payerId);

            Log::info('PayPal payment executed', [
                'order_id' => $order->id,
                'payment_id' => $paymentId,
                'payer_id' => $payerId,
            ]);

            return [
                'success' => true,
                'payment_id' => $paymentId,
                'transaction_id' => $result['id'] ?? null,
                'amount' => $result['transactions'][0]['amount']['total'] ?? 0,
                'payment_method' => 'paypal',
            ];

        } catch (\Exception $e) {
            Log::error('PayPal success callback failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'callback_data' => $callbackData,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Traite le callback d'annulation PayPal
     */
    public function handleCancelCallback(array $callbackData, Sell $order): array
    {
        Log::info('PayPal payment cancelled', [
            'order_id' => $order->id,
            'callback_data' => $callbackData,
        ]);

        return [
            'success' => false,
            'cancelled' => true,
            'message' => 'Payment cancelled by user',
        ];
    }

    /**
     * Traite les webhooks PayPal
     */
    public function handleWebhook(array $webhookData): array
    {
        // PayPal webhooks pour notifications temps réel
        try {
            $eventType = $webhookData['event_type'] ?? null;
            
            Log::info('PayPal webhook received', [
                'event_type' => $eventType,
                'data' => $webhookData,
            ]);

            switch ($eventType) {
                case 'PAYMENT.SALE.COMPLETED':
                    return $this->handleSaleCompleted($webhookData);
                case 'PAYMENT.SALE.REFUNDED':
                    return $this->handleSaleRefunded($webhookData);
                default:
                    return ['success' => true, 'ignored' => true];
            }

        } catch (\Exception $e) {
            Log::error('PayPal webhook processing failed', [
                'error' => $e->getMessage(),
                'webhook_data' => $webhookData,
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Rembourse un paiement PayPal
     */
    public function refundPayment(string $paymentId, ?float $amount = null, string $reason = ''): array
    {
        try {
            $refundData = [
                'amount' => $amount ? $this->formatAmount($amount) : null,
                'reason' => $reason ?: 'Refund requested',
            ];

            $result = $this->paypalService->refundPayment($paymentId, $refundData);

            Log::info('PayPal refund processed', [
                'payment_id' => $paymentId,
                'amount' => $amount,
                'refund_id' => $result['id'] ?? null,
            ]);

            return [
                'success' => true,
                'refund_id' => $result['id'],
                'amount' => $result['amount']['total'] ?? $amount,
                'status' => $result['state'] ?? 'completed',
            ];

        } catch (\Exception $e) {
            Log::error('PayPal refund failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Obtient les détails d'un paiement PayPal
     */
    public function getPaymentDetails(string $paymentId): array
    {
        return $this->paypalService->getPaymentDetails($paymentId);
    }

    /**
     * Valide la configuration PayPal
     */
    public function validateConfig(array $config): bool
    {
        $requiredKeys = ['client_id', 'client_secret', 'mode'];
        
        foreach ($requiredKeys as $key) {
            if (empty($config[$key])) {
                return false;
            }
        }

        return in_array($config['mode'], ['sandbox', 'live']);
    }

    /**
     * Nom du provider
     */
    public function getProviderName(): string
    {
        return 'PayPal';
    }

    /**
     * Devises supportées par PayPal
     */
    public function getSupportedCurrencies(): array
    {
        return ['EUR', 'USD', 'GBP', 'CAD', 'JPY', 'AUD'];
    }

    /**
     * Calcule les frais PayPal
     */
    public function getTransactionFees(float $amount, string $currency = 'EUR'): array
    {
        // Frais PayPal standard pour l'Europe
        $fixedFee = 0.35; // €0.35 par transaction
        $percentageFee = $amount * 0.029; // 2.9%
        $totalFee = $fixedFee + $percentageFee;

        return [
            'fixed_fee' => $fixedFee,
            'percentage_fee' => $percentageFee,
            'total_fee' => round($totalFee, 2),
            'net_amount' => round($amount - $totalFee, 2),
        ];
    }

    /**
     * Formate un montant pour PayPal
     */
    public function formatAmount(float $amount, string $currency = 'EUR'): string
    {
        return number_format($amount, 2, '.', '');
    }

    /**
     * Convertit le statut PayPal en statut standard
     */
    private function mapPayPalStatusToStandardStatus(string $paypalStatus): string
    {
        $statusMap = [
            'created' => 'pending',
            'approved' => 'completed',
            'executed' => 'completed',
            'cancelled' => 'cancelled',
            'expired' => 'expired',
            'failed' => 'failed',
        ];

        return $statusMap[$paypalStatus] ?? 'unknown';
    }

    /**
     * Traite une vente complétée via webhook
     */
    private function handleSaleCompleted(array $webhookData): array
    {
        // Logique pour traiter une vente complétée
        return ['success' => true, 'processed' => 'sale_completed'];
    }

    /**
     * Traite un remboursement via webhook
     */
    private function handleSaleRefunded(array $webhookData): array
    {
        // Logique pour traiter un remboursement
        return ['success' => true, 'processed' => 'sale_refunded'];
    }
}