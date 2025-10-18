<?php

namespace App\Services;

use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OrangeMoneyService
{
    private $config;
    private $baseUrl;
    private $merchantKey;
    private $isProduction;

    public function __construct()
    {
        $this->loadConfig();
    }

    /**
     * Charger la configuration Orange Money
     */
    private function loadConfig()
    {
        $paymentMethod = PaymentMethod::where('code', 'orange_money')->where('is_active', true)->first();
        
        if (!$paymentMethod || !$paymentMethod->config) {
            throw new \Exception('Orange Money non configuré ou désactivé');
        }

        $this->config = $paymentMethod->config;
        $this->merchantKey = $this->config['merchant_key'] ?? null;
        $this->isProduction = ($this->config['mode'] ?? 'sandbox') === 'production';
        
        // URLs API Orange Money
        $this->baseUrl = $this->isProduction 
            ? 'https://api.orange.com/orange-money-webpay/v1'
            : 'https://api.orange.com/orange-money-webpay/dev/v1';

        if (!$this->merchantKey) {
            throw new \Exception('Clé marchand Orange Money manquante');
        }

        Log::info('[Orange Money] Service initialisé', [
            'mode' => $this->isProduction ? 'production' : 'sandbox',
            'merchant_key' => substr($this->merchantKey, 0, 8) . '...'
        ]);
    }

    /**
     * Obtenir un token d'accès Orange Money
     */
    private function getAccessToken()
    {
        $cacheKey = 'orange_money_token_' . md5($this->merchantKey);
        
        // Vérifier le cache
        $cachedToken = Cache::get($cacheKey);
        if ($cachedToken) {
            return $cachedToken;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->config['client_id'] . ':' . $this->config['client_secret']),
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->asForm()->post($this->baseUrl . '/oauth/token', [
                'grant_type' => 'client_credentials'
            ]);

            if (!$response->successful()) {
                Log::error('[Orange Money] Erreur authentification', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                throw new \Exception('Impossible d\'obtenir le token Orange Money');
            }

            $data = $response->json();
            $token = $data['access_token'];
            $expiresIn = $data['expires_in'] ?? 3600;

            // Mettre en cache (expire 5 minutes avant la vraie expiration)
            Cache::put($cacheKey, $token, now()->addSeconds($expiresIn - 300));

            Log::info('[Orange Money] Token obtenu avec succès');
            return $token;

        } catch (\Exception $e) {
            Log::error('[Orange Money] Erreur obtention token', [
                'error' => $e->getMessage()
            ]);
            throw new \Exception('Erreur d\'authentification Orange Money');
        }
    }

    /**
     * Créer un paiement Orange Money
     */
    public function createPayment($order, $returnUrls)
    {
        try {
            $token = $this->getAccessToken();
            
            $paymentData = [
                'merchant_key' => $this->merchantKey,
                'currency' => 'XOF',
                'order_id' => $order->id,
                'amount' => (int) $order->total_payable_amount, // Orange Money attend des entiers
                'return_url' => $returnUrls['success'],
                'cancel_url' => $returnUrls['cancel'],
                'notif_url' => $returnUrls['webhook'] ?? null,
                'lang' => 'fr',
                'reference' => $order->invoice_number,
                'customer_id' => $order->customer_id,
                'customer_email' => $order->customer->email ?? null,
                'customer_phone' => $order->shipping_phone,
                'customer_firstname' => explode(' ', $order->customer->name ?? '')[0] ?? '',
                'customer_lastname' => explode(' ', $order->customer->name ?? '', 2)[1] ?? '',
            ];

            Log::info('[Orange Money] Création paiement', [
                'order_id' => $order->id,
                'amount' => $paymentData['amount'],
                'currency' => $paymentData['currency']
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->baseUrl . '/webpayment', $paymentData);

            if (!$response->successful()) {
                Log::error('[Orange Money] Erreur création paiement', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'request_data' => $paymentData
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Erreur lors de la création du paiement Orange Money'
                ];
            }

            $data = $response->json();
            
            Log::info('[Orange Money] Paiement créé avec succès', [
                'payment_token' => $data['payment_token'] ?? null,
                'payment_url' => $data['payment_url'] ?? null
            ]);

            return [
                'success' => true,
                'payment_token' => $data['payment_token'],
                'payment_url' => $data['payment_url'],
                'payment_id' => $data['payment_token'], // Utiliser le token comme ID
                'payment' => $data
            ];

        } catch (\Exception $e) {
            Log::error('[Orange Money] Exception création paiement', [
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
     * Vérifier le statut d'un paiement Orange Money
     */
    public function getPaymentDetails($paymentToken)
    {
        try {
            $token = $this->getAccessToken();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/webpayment/' . $paymentToken);

            if (!$response->successful()) {
                Log::error('[Orange Money] Erreur vérification statut', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'payment_token' => $paymentToken
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Impossible de vérifier le statut du paiement'
                ];
            }

            $data = $response->json();
            
            Log::info('[Orange Money] Statut paiement récupéré', [
                'payment_token' => $paymentToken,
                'status' => $data['status'] ?? 'unknown'
            ]);

            return [
                'success' => true,
                'payment' => $data
            ];

        } catch (\Exception $e) {
            Log::error('[Orange Money] Exception vérification statut', [
                'error' => $e->getMessage(),
                'payment_token' => $paymentToken
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
            Log::info('[Orange Money] Webhook reçu', $data);

            // Valider la signature si configurée
            if (isset($this->config['webhook_secret'])) {
                if (!$this->validateWebhookSignature($data)) {
                    Log::warning('[Orange Money] Signature webhook invalide');
                    return false;
                }
            }

            return [
                'success' => true,
                'status' => $data['status'] ?? null,
                'payment_token' => $data['payment_token'] ?? null,
                'transaction_id' => $data['txnid'] ?? null,
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? 'XOF'
            ];

        } catch (\Exception $e) {
            Log::error('[Orange Money] Erreur traitement webhook', [
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
        if (!isset($this->config['webhook_secret']) || !isset($data['signature'])) {
            return true; // Pas de validation si pas de secret configuré
        }

        $expectedSignature = hash_hmac('sha256', json_encode($data), $this->config['webhook_secret']);
        return hash_equals($expectedSignature, $data['signature']);
    }

    /**
     * Vérifier si Orange Money est configuré
     */
    public static function isConfigured()
    {
        try {
            $paymentMethod = PaymentMethod::where('code', 'orange_money')->where('is_active', true)->first();
            
            if (!$paymentMethod || !$paymentMethod->config) {
                return false;
            }

            $config = $paymentMethod->config;
            
            return !empty($config['merchant_key']) && 
                   !empty($config['client_id']) && 
                   !empty($config['client_secret']);
                   
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
            'merchant_key' => substr($this->merchantKey ?? '', 0, 8) . '...',
            'base_url' => $this->baseUrl
        ];
    }

    /**
     * Convertir le statut Orange Money vers notre système
     */
    public static function mapStatus($orangeMoneyStatus)
    {
        $statusMap = [
            'INITIATED' => 'pending',
            'PENDING' => 'pending',
            'SUCCESS' => 'completed',
            'FAILED' => 'failed',
            'CANCELLED' => 'cancelled',
            'EXPIRED' => 'failed'
        ];

        return $statusMap[strtoupper($orangeMoneyStatus)] ?? 'pending';
    }
}
