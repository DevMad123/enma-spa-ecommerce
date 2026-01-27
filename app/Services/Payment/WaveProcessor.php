<?php

namespace App\Services\Payment;

use App\Contracts\PaymentProcessorInterface;
use App\Models\Sell;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class WaveProcessor implements PaymentProcessorInterface
{
    private array $config;

    /**
     * Initialise le processeur
     */
    public function initialize(array $config = []): void
    {
        // Initialisation spécifique Wave
        Log::debug('Wave processor initialized', [
            'config_keys' => array_keys($this->config),
        ]);
    }

    /**
     * Vérifie si le processeur est disponible
     */
    public function isAvailable(): bool
    {
        return $this->isConfigured();
    }

    public function __construct()
    {
        $config = config('services.wave', []);
        $mode = $config['mode'] ?? 'sandbox';
        
        $this->config = array_merge(
            $config,
            $config[$mode] ?? [],
            [
                'api_url' => $config[$mode]['base_url'] ?? '',
                'secret_key' => $config[$mode]['secret_key'] ?? '',
            ]
        );
    }

    /**
     * Crée un paiement Wave
     */
    public function createPayment(Sell $order, array $additionalData = []): array
    {
        try {
            Log::info('Creating Wave payment', [
                'sell_id' => $order->id,
                'amount' => $order->total,
            ]);

            // Configuration Wave API
            $payload = [
                'currency' => $this->config['currency'] ?? 'XOF',
                'amount' => $order->total * 100, // Wave utilise les centimes
                'success_url' => app()->environment('testing') ? 'http://test.local/payment/success' : route('payment.success'),
                'error_url' => app()->environment('testing') ? 'http://test.local/payment/cancel' : route('payment.cancel'),
                'checkout_intent' => 'WEB_PAYMENT',
                'client_reference' => $order->id,
                'payment_method_types' => ['WAVE'],
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['secret_key'],
                'Content-Type' => 'application/json',
            ])->post($this->config['api_url'] . '/checkout/sessions', $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'payment_id' => $data['id'] ?? null,
                    'redirect_url' => $data['wave_launch_url'] ?? null,
                    'raw_response' => $data,
                ];
            }

            Log::error('Wave payment creation failed', [
                'response' => $response->body(),
                'status' => $response->status(),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la création du paiement Wave',
                'raw_response' => $response->json(),
            ];

        } catch (\Exception $e) {
            Log::error('Wave payment exception', [
                'sell_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Exception lors du paiement Wave: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifie le statut d'un paiement Wave
     */
    public function checkPaymentStatus(string $paymentId, Sell $order): array
    {
        try {
            Log::info('Checking Wave payment status', [
                'payment_id' => $paymentId,
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['secret_key'],
            ])->get($this->config['api_url'] . '/checkout/sessions/' . $paymentId);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'status' => $this->mapWaveStatus($data['status'] ?? 'pending'),
                    'transaction_id' => $data['transaction_id'] ?? null,
                    'raw_response' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => 'Impossible de vérifier le statut du paiement Wave',
                'raw_response' => $response->json(),
            ];

        } catch (\Exception $e) {
            Log::error('Wave status check exception', [
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
     * Gère les callbacks/webhooks de Wave
     */
    public function handleCallback(array $data): array
    {
        try {
            Log::info('Wave callback received', $data);

            // Validation de la signature Wave
            if (!$this->validateWebhook($data)) {
                Log::warning('Wave webhook validation failed', $data);
                return [
                    'success' => false,
                    'error' => 'Validation du webhook échouée',
                ];
            }

            $status = $this->mapWaveStatus($data['status'] ?? 'pending');

            return [
                'success' => true,
                'status' => $status,
                'transaction_id' => $data['transaction_id'] ?? null,
                'order_id' => $data['client_reference'] ?? null,
                'amount' => isset($data['amount']) ? $data['amount'] / 100 : null, // Conversion centimes vers unités
                'raw_data' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Wave callback exception', [
                'data' => $data,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Exception lors du traitement du webhook: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Effectue un remboursement via Wave
     */
    public function refundPayment(string $paymentId, ?float $amount = null, string $reason = ''): array
    {
        try {
            Log::info('Wave refund requested', [
                'payment_id' => $paymentId,
                'amount' => $amount,
                'reason' => $reason,
            ]);

            // Si aucun montant spécifié, remboursement total
            if ($amount === null) {
                // On pourrait récupérer le montant de la transaction originale
                // Pour l'instant, on retourne une erreur
                return [
                    'success' => false,
                    'error' => 'Montant requis pour le remboursement Wave'
                ];
            }

            $payload = [
                'amount' => $amount * 100, // Conversion vers centimes
                'reason' => $reason ?: 'Demande de remboursement client',
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['secret_key'],
                'Content-Type' => 'application/json',
            ])->post($this->config['api_url'] . '/checkout/sessions/' . $paymentId . '/refunds', $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'refund_id' => $data['id'] ?? null,
                    'status' => $data['status'] ?? 'pending',
                    'raw_response' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => 'Erreur lors du remboursement Wave',
                'raw_response' => $response->json(),
            ];

        } catch (\Exception $e) {
            Log::error('Wave refund exception', [
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
     * Valide les webhooks Wave
     */
    private function validateWebhook(array $data): bool
    {
        // Validation basique - à améliorer selon la documentation Wave
        $requiredFields = ['status', 'id'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }

        // Ici, vous devriez implémenter la validation de signature Wave
        // selon leur documentation
        
        return true;
    }

    /**
     * Mappe les statuts Wave vers les statuts internes
     */
    private function mapWaveStatus(string $status): string
    {
        return match($status) {
            'PAID', 'COMPLETED' => 'completed',
            'FAILED', 'DECLINED' => 'failed',
            'EXPIRED' => 'expired',
            'CANCELLED' => 'cancelled',
            'PROCESSING' => 'processing',
            default => 'pending',
        };
    }

    /**
     * Retourne le nom du processeur
     */
    public function getName(): string
    {
        return 'wave';
    }

    /**
     * Traite le callback de succès
     */
    public function handleSuccessCallback(array $callbackData, Sell $order): array
    {
        try {
            Log::info('Wave success callback', [
                'callback_data' => $callbackData,
                'order_id' => $order->id,
            ]);
            
            return [
                'success' => true,
                'message' => 'Paiement Wave confirmé avec succès',
                'order_id' => $order->id,
                'payment_data' => $callbackData,
            ];
            
        } catch (\Exception $e) {
            Log::error('Wave success callback error', [
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
            Log::info('Wave cancel callback', [
                'callback_data' => $callbackData,
                'order_id' => $order->id,
            ]);
            
            return [
                'success' => true,
                'message' => 'Paiement Wave annulé',
                'order_id' => $order->id,
                'payment_data' => $callbackData,
            ];
            
        } catch (\Exception $e) {
            Log::error('Wave cancel callback error', [
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
            Log::info('Wave webhook received', $webhookData);
            
            return [
                'success' => true,
                'message' => 'Webhook Wave traité avec succès',
                'data' => $webhookData,
            ];
            
        } catch (\Exception $e) {
            Log::error('Wave webhook error', [
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
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['secret_key'],
            ])->get($this->config['api_url'] . '/checkout/sessions/' . $paymentId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'details' => $response->json(),
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Erreur lors de la récupération des détails Wave',
                'response' => $response->json(),
            ];
            
        } catch (\Exception $e) {
            Log::error('Wave payment details error', [
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
        $required = ['secret_key', 'api_url'];
        
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
        return 'Wave';
    }

    /**
     * Obtient les devises supportées
     */
    public function getSupportedCurrencies(): array
    {
        return ['XOF', 'EUR', 'USD']; // Devises Wave
    }

    /**
     * Obtient les frais de transaction
     */
    public function getTransactionFees(float $amount, string $currency = 'XOF'): array
    {
        // Frais Wave (exemple)
        $percentage = 0.02; // 2%
        $fixedFee = 0; // Pas de frais fixe
        
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
        return $amount * 100; // Wave utilise les centimes
    }

    /**
     * Vérifie si le processeur est configuré correctement
     */
    public function isConfigured(): bool
    {
        return !empty($this->config['secret_key']) && !empty($this->config['api_url']);
    }
}