<?php

namespace App\Services;

use App\Models\PaymentMethod;
use App\Models\Sell;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PayPalService
{
    private $paymentMethod;
    private $clientId;
    private $clientSecret;
    private $mode;
    private $baseUrl;

    public function __construct()
    {
        $this->paymentMethod = PaymentMethod::where('code', 'paypal')->where('is_active', true)->first();
        
        if (!$this->paymentMethod) {
            throw new \Exception('PayPal payment method not found or not active');
        }

        $config = $this->paymentMethod->config;
        
        if (!isset($config['client_id']) || !isset($config['client_secret'])) {
            throw new \Exception('PayPal configuration incomplete');
        }

        $this->clientId = $config['client_id'];
        $this->clientSecret = $config['client_secret'];
        $this->mode = $config['mode'] ?? 'sandbox';
        $this->baseUrl = $this->mode === 'sandbox' 
            ? 'https://api-m.sandbox.paypal.com' 
            : 'https://api-m.paypal.com';
    }

    /**
     * Obtenir un token d'accès PayPal
     */
    private function getAccessToken()
    {
        try {
            $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                ->asForm()
                ->post($this->baseUrl . '/v1/oauth2/token', [
                    'grant_type' => 'client_credentials'
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }

            throw new \Exception('Failed to get PayPal access token: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('PayPal access token error', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Créer un paiement PayPal
     */
    public function createPayment(Sell $order, array $returnUrls)
    {
        try {
            $accessToken = $this->getAccessToken();

            // Préparation des données de paiement
            $paymentData = [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => $order->order_reference,
                    'description' => 'Commande #' . $order->order_reference,
                    'amount' => [
                        'currency_code' => 'XOF',
                        'value' => number_format($order->total_payable_amount, 2, '.', ''),
                        'breakdown' => [
                            'item_total' => [
                                'currency_code' => 'XOF',
                                'value' => number_format($order->total_amount, 2, '.', '')
                            ],
                            'shipping' => [
                                'currency_code' => 'XOF',
                                'value' => number_format($order->shipping_cost ?? 0, 2, '.', '')
                            ],
                            'tax_total' => [
                                'currency_code' => 'XOF',
                                'value' => number_format($order->total_vat_amount ?? 0, 2, '.', '')
                            ]
                        ]
                    ],
                    'items' => $this->formatOrderItems($order)
                ]],
                'application_context' => [
                    'return_url' => $returnUrls['success'],
                    'cancel_url' => $returnUrls['cancel'],
                    'brand_name' => config('app.name', 'ENMA SPA'),
                    'landing_page' => 'LOGIN',
                    'user_action' => 'PAY_NOW'
                ]
            ];

            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . '/v2/checkout/orders', $paymentData);

            if ($response->successful()) {
                $paymentResponse = $response->json();
                
                Log::info('PayPal payment created', [
                    'payment_id' => $paymentResponse['id'],
                    'order_id' => $order->id,
                    'amount' => $order->total_payable_amount
                ]);

                return [
                    'success' => true,
                    'payment_id' => $paymentResponse['id'],
                    'approval_url' => $this->getApprovalUrl($paymentResponse),
                    'payment' => $paymentResponse
                ];
            }

            throw new \Exception('PayPal API Error: ' . $response->body());

        } catch (\Exception $ex) {
            Log::error('PayPal payment creation error', [
                'message' => $ex->getMessage(),
                'order_id' => $order->id
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la création du paiement: ' . $ex->getMessage()
            ];
        }
    }

    /**
     * Capturer un paiement PayPal
     */
    public function capturePayment($paymentId)
    {
        try {
            $accessToken = $this->getAccessToken();

            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . "/v2/checkout/orders/{$paymentId}/capture");

            if ($response->successful()) {
                $captureResponse = $response->json();
                
                Log::info('PayPal payment captured', [
                    'payment_id' => $paymentId,
                    'status' => $captureResponse['status']
                ]);

                return [
                    'success' => true,
                    'payment' => $captureResponse,
                    'transaction_id' => $captureResponse['purchase_units'][0]['payments']['captures'][0]['id'] ?? null
                ];
            }

            throw new \Exception('PayPal capture error: ' . $response->body());

        } catch (\Exception $ex) {
            Log::error('PayPal capture error', [
                'message' => $ex->getMessage(),
                'payment_id' => $paymentId
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de la capture du paiement: ' . $ex->getMessage()
            ];
        }
    }

    /**
     * Obtenir les détails d'un paiement
     */
    public function getPaymentDetails($paymentId)
    {
        try {
            $accessToken = $this->getAccessToken();

            $response = Http::withToken($accessToken)
                ->get($this->baseUrl . "/v2/checkout/orders/{$paymentId}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'payment' => $response->json()
                ];
            }

            throw new \Exception('PayPal get payment error: ' . $response->body());

        } catch (\Exception $ex) {
            Log::error('PayPal get payment details error', [
                'message' => $ex->getMessage(),
                'payment_id' => $paymentId
            ]);

            return [
                'success' => false,
                'error' => $ex->getMessage()
            ];
        }
    }

    /**
     * Formater les items de commande pour PayPal
     */
    private function formatOrderItems(Sell $order)
    {
        $items = [];
        
        if ($order->sellDetails) {
            foreach ($order->sellDetails as $detail) {
                $items[] = [
                    'name' => $detail->product->name ?? 'Produit',
                    'unit_amount' => [
                        'currency_code' => 'XOF',
                        'value' => number_format($detail->unit_price, 2, '.', '')
                    ],
                    'quantity' => (string)$detail->quantity,
                    'category' => 'PHYSICAL_GOODS'
                ];
            }
        }

        return $items;
    }

    /**
     * Extraire l'URL d'approbation du paiement
     */
    private function getApprovalUrl($payment)
    {
        if (isset($payment['links'])) {
            foreach ($payment['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    return $link['href'];
                }
            }
        }
        return null;
    }

    /**
     * Vérifier si PayPal est configuré
     */
    public static function isConfigured()
    {
        $paymentMethod = PaymentMethod::where('code', 'paypal')->where('is_active', true)->first();
        
        if (!$paymentMethod) {
            return false;
        }

        $config = $paymentMethod->config;
        return isset($config['client_id']) && isset($config['client_secret']);
    }

    /**
     * Obtenir la configuration PayPal
     */
    public function getConfig()
    {
        return $this->paymentMethod->config;
    }
}