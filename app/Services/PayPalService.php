<?php

namespace App\Services;

use App\Models\PaymentMethod;
use App\Models\Sell;
use Illuminate\Support\Facades\Log;
use PaypalServerSdkLib\PaypalServerSdkClientBuilder;
use PaypalServerSdkLib\Environment as PaypalEnvironment;
use PaypalServerSdkLib\Authentication\ClientCredentialsAuthCredentialsBuilder;

class PayPalService
{
    private $paymentMethod;
    private $clientId;
    private $clientSecret;
    private $mode;
    private $client; // PaypalServerSdkClient

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

        $environment = $this->mode === 'sandbox' ? PaypalEnvironment::SANDBOX : PaypalEnvironment::PRODUCTION;

        $this->client = PaypalServerSdkClientBuilder::init()
            ->environment($environment)
            ->clientCredentialsAuthCredentials(
                ClientCredentialsAuthCredentialsBuilder::init($this->clientId, $this->clientSecret)
            )
            ->build();
    }

    /**
     * Créer un paiement PayPal
     */
    public function createPayment(Sell $order, array $returnUrls)
    {
        try {
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

            $apiResponse = $this->client->getOrdersController()->createOrder([
                'body' => $paymentData,
            ]);

            if ($apiResponse->isSuccess()) {
                /** @var \PaypalServerSdkLib\Models\Order $orderModel */
                $orderModel = $apiResponse->getResult();
                $paymentId = $orderModel->getId();
                $links = $orderModel->getLinks() ?: [];
                $approvalUrl = null;
                foreach ($links as $link) {
                    if (method_exists($link, 'getRel') && $link->getRel() === 'approve') {
                        $approvalUrl = $link->getHref();
                        break;
                    }
                }

                Log::info('PayPal payment created', [
                    'payment_id' => $paymentId,
                    'order_id' => $order->id,
                    'amount' => $order->total_payable_amount
                ]);

                return [
                    'success' => true,
                    'payment_id' => $paymentId,
                    'approval_url' => $approvalUrl,
                    'payment' => $orderModel,
                ];
            }

            throw new \Exception('PayPal API Error (createOrder)');

        } catch (\Exception $ex) {
            Log::error('PayPal create payment error', [
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
            $apiResponse = $this->client->getOrdersController()->captureOrder([
                'id' => $paymentId,
                'body' => [],
            ]);

            if ($apiResponse->isSuccess()) {
                /** @var \PaypalServerSdkLib\Models\Order $orderModel */
                $orderModel = $apiResponse->getResult();

                $transactionId = null;
                $units = $orderModel->getPurchaseUnits() ?: [];
                if (!empty($units) && method_exists($units[0], 'getPayments') && $units[0]->getPayments()) {
                    $captures = $units[0]->getPayments()->getCaptures() ?: [];
                    if (!empty($captures) && method_exists($captures[0], 'getId')) {
                        $transactionId = $captures[0]->getId();
                    }
                }

                Log::info('PayPal payment captured', [
                    'payment_id' => $paymentId,
                    'status' => $orderModel->getStatus()
                ]);

                return [
                    'success' => true,
                    'payment' => $orderModel,
                    'transaction_id' => $transactionId,
                ];
            }

            throw new \Exception('PayPal capture error');

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
            $apiResponse = $this->client->getOrdersController()->getOrder([
                'id' => $paymentId,
            ]);

            if ($apiResponse->isSuccess()) {
                return [
                    'success' => true,
                    'payment' => $apiResponse->getResult(),
                ];
            }

            throw new \Exception('PayPal get payment error');

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