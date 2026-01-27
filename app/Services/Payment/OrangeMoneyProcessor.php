<?php

namespace App\Services\Payment;

use App\Contracts\PaymentProcessorInterface;
use App\Models\Sell;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class OrangeMoneyProcessor implements PaymentProcessorInterface
{
    private array $config;

    public function __construct()
    {
        $config = config('services.orange_money', []);
        $mode = $config['mode'] ?? 'sandbox';
        
        $this->config = array_merge(
            $config,
            $config[$mode] ?? [],
            [
                'api_url' => $config[$mode]['base_url'] ?? '',
                'merchant_key' => $config[$mode]['merchant_key'] ?? '',
            ]
        );
    }

    /**
     * Initialise le service avec une configuration
     */
    public function initialize(array $config = []): void
    {
        $this->config = array_merge($this->config, $config);
        
        if (!$this->validateConfig($this->config)) {
            throw new \Exception('Configuration Orange Money invalide');
        }
    }

    /**
     * Vérifie si le service est disponible
     */
    public function isAvailable(): bool
    {
        return !empty($this->config['merchant_key']) && !empty($this->config['api_url']);
    }

    /**
     * Crée un paiement Orange Money
     */
    public function createPayment(Sell $order, array $additionalData = []): array
    {
        try {
            Log::info('Creating Orange Money payment', [
                'sell_id' => $order->id,
                'amount' => $order->total,
            ]);

            // Configuration Orange Money API
            $payload = [
                'merchant_key' => $this->config['merchant_key'],
                'currency' => $this->config['currency'] ?? 'XOF',
                'order_id' => $order->id,
                'amount' => $order->total,
                'return_url' => app()->environment('testing') ? 'http://test.local/payment/success' : route('payment.success'),
                'cancel_url' => app()->environment('testing') ? 'http://test.local/payment/cancel' : route('payment.cancel'),
                'notif_url' => app()->environment('testing') ? 'http://test.local/api/payments/callback' : route('api.payments.orange-money.callback'),
                'lang' => 'fr',
            ];

            $response = Http::post($this->config['api_url'] . '/webpayment/v1/paymentRequest', $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'payment_id' => $data['pay_token'] ?? null,
                    'redirect_url' => $data['payment_url'] ?? null,
                    'raw_response' => $data,
                ];
            }

            Log::error('Orange Money payment creation failed', [
                'response' => $response->body(),
                'status' => $response->status(),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la création du paiement Orange Money',
                'raw_response' => $response->json(),
            ];

        } catch (\Exception $e) {
            Log::error('Orange Money payment exception', [
                'sell_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Exception lors du paiement Orange Money: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifie le statut d'un paiement Orange Money
     */
    public function checkPaymentStatus(string $paymentId, Sell $order): array
    {
        try {
            Log::info('Checking Orange Money payment status', [
                'payment_id' => $paymentId,
            ]);

            $response = Http::post($this->config['api_url'] . '/webpayment/v1/transactionStatus', [
                'merchant_key' => $this->config['merchant_key'],
                'pay_token' => $paymentId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'status' => $this->mapStatusFromCallback($data),
                    'transaction_id' => $data['txnid'] ?? null,
                    'raw_response' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => 'Impossible de vérifier le statut du paiement Orange Money',
                'raw_response' => $response->json(),
            ];

        } catch (\Exception $e) {
            Log::error('Orange Money status check exception', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Exception lors de la vérification: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Gère les callbacks/webhooks d'Orange Money
     */
    public function handleCallback(array $data): array
    {
        try {
            Log::info('Orange Money callback received', $data);

            // Validation de la signature si nécessaire
            if (!$this->validateCallback($data)) {
                Log::warning('Orange Money callback validation failed', $data);
                return [
                    'success' => false,
                    'error' => 'Validation du callback échouée',
                ];
            }

            $status = $this->mapStatusFromCallback($data);

            return [
                'success' => true,
                'status' => $status,
                'transaction_id' => $data['txnid'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'amount' => $data['amount'] ?? null,
                'raw_data' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Orange Money callback exception', [
                'data' => $data,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Exception lors du traitement du callback: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Effectue un remboursement (si supporté par Orange Money)
     */
    public function refundPayment(string $paymentId, ?float $amount = null, string $reason = ''): array
    {
        try {
            Log::info('Orange Money refund requested', [
                'payment_id' => $paymentId,
                'amount' => $amount,
            ]);

            // Orange Money ne supporte généralement pas les remboursements automatiques
            // Cette méthode peut être utilisée pour logger la demande de remboursement
            
            return [
                'success' => false,
                'error' => 'Les remboursements automatiques ne sont pas supportés par Orange Money',
                'manual_process_required' => true,
            ];

        } catch (\Exception $e) {
            Log::error('Orange Money refund exception', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Exception lors du remboursement: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Valide les données du callback
     */
    private function validateCallback(array $data): bool
    {
        // Implémentation de la validation de signature Orange Money
        // Retourne true pour l'instant, à adapter selon la documentation Orange Money
        return true;
    }

    /**
     * Mappe le statut du callback vers les statuts internes
     */
    private function mapStatusFromCallback(array $data): string
    {
        $status = $data['status'] ?? 'pending';

        return match($status) {
            'SUCCESS', 'SUCCESSFUL' => 'completed',
            'FAILED', 'FAILURE' => 'failed',
            'EXPIRED' => 'expired',
            'CANCELLED' => 'cancelled',
            default => 'pending',
        };
    }

    /**
     * Retourne le nom du processeur
     */
    public function getName(): string
    {
        return 'orange_money';
    }

    /**
     * Vérifie si le processeur est configuré correctement
     */
    public function isConfigured(): bool
    {
        return !empty($this->config['merchant_key']) && !empty($this->config['api_url']);
    }

    /**
     * Traite le callback de succès
     */
    public function handleSuccessCallback(array $callbackData, Sell $order): array
    {
        try {
            Log::info('Orange Money success callback', [
                'callback_data' => $callbackData,
                'order_id' => $order->id,
            ]);
            
            return [
                'success' => true,
                'message' => 'Paiement confirmé avec succès',
                'order_id' => $order->id,
                'payment_data' => $callbackData,
            ];
            
        } catch (\Exception $e) {
            Log::error('Orange Money success callback error', [
                'error' => $e->getMessage(),
                'order_id' => $order->id,
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Traite le callback d'annulation
     */
    public function handleCancelCallback(array $callbackData, Sell $order): array
    {
        try {
            Log::info('Orange Money cancel callback', [
                'callback_data' => $callbackData,
                'order_id' => $order->id,
            ]);
            
            return [
                'success' => true,
                'message' => 'Paiement annulé',
                'order_id' => $order->id,
                'payment_data' => $callbackData,
            ];
            
        } catch (\Exception $e) {
            Log::error('Orange Money cancel callback error', [
                'error' => $e->getMessage(),
                'order_id' => $order->id,
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Traite les webhooks
     */
    public function handleWebhook(array $webhookData): array
    {
        try {
            Log::info('Orange Money webhook received', $webhookData);
            
            return [
                'success' => true,
                'message' => 'Webhook traité avec succès',
                'data' => $webhookData,
            ];
            
        } catch (\Exception $e) {
            Log::error('Orange Money webhook error', [
                'error' => $e->getMessage(),
                'webhook_data' => $webhookData,
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Obtient les détails d'un paiement
     */
    public function getPaymentDetails(string $paymentId): array
    {
        try {
            $response = Http::post($this->config['api_url'] . '/webpayment/v1/paymentDetails', [
                'merchant_key' => $this->config['merchant_key'],
                'pay_token' => $paymentId,
            ]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'details' => $response->json(),
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Erreur lors de la récupération des détails',
                'response' => $response->json(),
            ];
            
        } catch (\Exception $e) {
            Log::error('Orange Money payment details error', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Valide la configuration
     */
    public function validateConfig(array $config): bool
    {
        $required = ['merchant_key', 'api_url'];
        
        foreach ($required as $key) {
            if (empty($config[$key])) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Obtient le nom du provider
     */
    public function getProviderName(): string
    {
        return 'Orange Money';
    }

    /**
     * Obtient les devises supportées
     */
    public function getSupportedCurrencies(): array
    {
        return ['XOF', 'XAF']; // Franc CFA
    }

    /**
     * Obtient les frais de transaction
     */
    public function getTransactionFees(float $amount, string $currency = 'XOF'): array
    {
        // Frais Orange Money (exemple)
        $percentage = 0.015; // 1.5%
        $fixedFee = 50; // 50 FCFA
        
        $percentageFee = $amount * $percentage;
        $totalFee = $fixedFee + $percentageFee;
        
        return [
            'fixed_fee' => $fixedFee,
            'percentage_fee' => $percentageFee,
            'total_fee' => $totalFee,
            'currency' => $currency,
        ];
    }

    /**
     * Formate un montant
     */
    public function formatAmount(float $amount, string $currency = 'XOF')
    {
        return (int) round($amount); // Orange Money utilise les montants entiers
    }
}