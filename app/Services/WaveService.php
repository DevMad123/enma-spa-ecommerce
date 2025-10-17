<?php

namespace App\Services;

use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WaveService
{
    private $config;
    private $baseUrl;
    private $apiKey;
    private $secretKey;
    private $isProduction;

    public function __construct()
    {
        $this->loadConfig();
    }

    /**
     * Charger la configuration Wave
     */
    private function loadConfig()
    {
        $paymentMethod = PaymentMethod::where('code', 'wave')->where('is_active', true)->first();
        
        if (!$paymentMethod || !$paymentMethod->config) {
            throw new \Exception('Wave non configuré ou désactivé');
        }

        $this->config = $paymentMethod->config;
        $this->apiKey = $this->config['api_key'] ?? null;
        $this->secretKey = $this->config['secret_key'] ?? null;
        $this->isProduction = ($this->config['mode'] ?? 'sandbox') === 'production';
        
        // URLs API Wave
        $this->baseUrl = $this->isProduction 
            ? 'https://api.wave.com/v1'
            : 'https://api.wave.com/v1/sandbox';

        if (!$this->apiKey || !$this->secretKey) {
            throw new \Exception('Clés API Wave manquantes');
        }

        Log::info('[Wave] Service initialisé', [
            'mode' => $this->isProduction ? 'production' : 'sandbox',
            'api_key' => substr($this->apiKey, 0, 8) . '...'
        ]);
    }

    /**
     * Créer un paiement Wave
     */
    public function createPayment($order, $returnUrls)
    {
        try {
            $paymentData = [
                'amount' => (int) $order->total_payable_amount, // Wave attend des entiers en centimes
                'currency' => 'XOF',
                'order_id' => $order->id,
                'description' => 'Commande #' . $order->invoice_number,
                'success_url' => $returnUrls['success'],
                'error_url' => $returnUrls['cancel'],
                'cancel_url' => $returnUrls['cancel'],
                'webhook_url' => $returnUrls['webhook'] ?? null,
                'customer' => [
                    'name' => $order->customer->name ?? 'Client',
                    'email' => $order->customer->email ?? '',
                    'phone' => $order->shipping_phone,
                ],
                'metadata' => [
                    'order_id' => $order->id,
                    'customer_id' => $order->customer_id,
                    'invoice_number' => $order->invoice_number,
                ]
            ];

            Log::info('[Wave] Création paiement', [
                'order_id' => $order->id,
                'amount' => $paymentData['amount'],
                'currency' => $paymentData['currency']
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-Wave-Secret' => $this->secretKey,
            ])->post($this->baseUrl . '/checkout/sessions', $paymentData);

            if (!$response->successful()) {
                Log::error('[Wave] Erreur création paiement', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'request_data' => $paymentData
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Erreur lors de la création du paiement Wave'
                ];
            }

            $data = $response->json();
            
            Log::info('[Wave] Paiement créé avec succès', [
                'checkout_session_id' => $data['id'] ?? null,
                'checkout_url' => $data['checkout_url'] ?? null
            ]);

            return [
                'success' => true,
                'checkout_session_id' => $data['id'],
                'checkout_url' => $data['checkout_url'],
                'payment_id' => $data['id'], // Utiliser l'ID de session comme payment_id
                'payment' => $data
            ];

        } catch (\Exception $e) {
            Log::error('[Wave] Exception création paiement', [
                'error' => $e->getMessage(),
                'order_id' => $order->id
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Vérifier le statut d'un paiement Wave
     */
    public function getPaymentDetails($checkoutSessionId)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'X-Wave-Secret' => $this->secretKey,
            ])->get($this->baseUrl . '/checkout/sessions/' . $checkoutSessionId);

            if (!$response->successful()) {
                Log::error('[Wave] Erreur vérification statut', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'session_id' => $checkoutSessionId
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Impossible de vérifier le statut du paiement'
                ];
            }

            $data = $response->json();
            
            Log::info('[Wave] Statut paiement récupéré', [
                'session_id' => $checkoutSessionId,
                'status' => $data['status'] ?? 'unknown'
            ]);

            return [
                'success' => true,
                'payment' => $data
            ];

        } catch (\Exception $e) {
            Log::error('[Wave] Exception vérification statut', [
                'error' => $e->getMessage(),
                'session_id' => $checkoutSessionId
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Traiter la notification de paiement (webhook)
     */
    public function processWebhook($data)
    {
        try {
            Log::info('[Wave] Webhook reçu', $data);

            // Valider la signature si configurée
            if (isset($this->config['webhook_secret'])) {
                if (!$this->validateWebhookSignature($data)) {
                    Log::warning('[Wave] Signature webhook invalide');
                    return false;
                }
            }

            return [
                'success' => true,
                'event_type' => $data['type'] ?? null,
                'checkout_session_id' => $data['data']['id'] ?? null,
                'status' => $data['data']['status'] ?? null,
                'payment_method' => $data['data']['payment_method'] ?? null,
                'amount' => $data['data']['amount'] ?? null,
                'currency' => $data['data']['currency'] ?? 'XOF'
            ];

        } catch (\Exception $e) {
            Log::error('[Wave] Erreur traitement webhook', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Valider la signature du webhook
     */
    private function validateWebhookSignature($data)
    {
        if (!isset($this->config['webhook_secret'])) {
            return true; // Pas de validation si pas de secret configuré
        }

        $signature = $_SERVER['HTTP_WAVE_SIGNATURE'] ?? '';
        $payload = json_encode($data);
        $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $this->config['webhook_secret']);
        
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Rembourser un paiement Wave
     */
    public function refundPayment($checkoutSessionId, $amount = null)
    {
        try {
            $refundData = [
                'checkout_session_id' => $checkoutSessionId,
            ];

            if ($amount) {
                $refundData['amount'] = (int) $amount;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'X-Wave-Secret' => $this->secretKey,
            ])->post($this->baseUrl . '/refunds', $refundData);

            if (!$response->successful()) {
                Log::error('[Wave] Erreur remboursement', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'session_id' => $checkoutSessionId
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Erreur lors du remboursement'
                ];
            }

            $data = $response->json();
            
            Log::info('[Wave] Remboursement créé', [
                'refund_id' => $data['id'] ?? null,
                'session_id' => $checkoutSessionId
            ]);

            return [
                'success' => true,
                'refund' => $data
            ];

        } catch (\Exception $e) {
            Log::error('[Wave] Exception remboursement', [
                'error' => $e->getMessage(),
                'session_id' => $checkoutSessionId
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Vérifier si Wave est configuré
     */
    public static function isConfigured()
    {
        try {
            $paymentMethod = PaymentMethod::where('code', 'wave')->where('is_active', true)->first();
            
            if (!$paymentMethod || !$paymentMethod->config) {
                return false;
            }

            $config = $paymentMethod->config;
            
            return !empty($config['api_key']) && !empty($config['secret_key']);
                   
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Obtenir la configuration actuelle
     */
    public function getConfig()
    {
        return [
            'mode' => $this->isProduction ? 'production' : 'sandbox',
            'api_key' => substr($this->apiKey ?? '', 0, 8) . '...',
            'base_url' => $this->baseUrl
        ];
    }

    /**
     * Convertir le statut Wave vers notre système
     */
    public static function mapStatus($waveStatus)
    {
        $statusMap = [
            'open' => 'pending',
            'pending' => 'pending',
            'complete' => 'completed',
            'expired' => 'failed',
            'cancelled' => 'cancelled'
        ];

        return $statusMap[strtolower($waveStatus)] ?? 'pending';
    }
}
