<?php

namespace App\Http\Controllers;

use App\Models\Sell;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Services\OrangeMoneyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrangeMoneyPaymentController extends Controller
{
    private $orangeMoneyService;

    public function __construct()
    {
        try {
            $this->orangeMoneyService = new OrangeMoneyService();
        } catch (\Exception $e) {
            Log::error('Orange Money service initialization failed: ' . $e->getMessage());
        }
    }

    /**
     * Créer un paiement Orange Money
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:sells,id',
        ]);

        try {
            DB::beginTransaction();

            $order = Sell::findOrFail($request->order_id);
            
            // Vérifier que la commande n'est pas déjà payée
            if ($order->payment_status == 1) {
                return response()->json([
                    'success' => false,
                    'error' => 'Cette commande est déjà payée'
                ], 400);
            }

            // Vérifier qu'Orange Money est configuré
            if (!$this->orangeMoneyService) {
                return response()->json([
                    'success' => false,
                    'error' => 'Orange Money non configuré'
                ], 500);
            }

            // URLs de retour
            $returnUrls = [
                'success' => route('orange-money.callback.success', ['order_id' => $order->id]),
                'cancel' => route('orange-money.callback.cancel', ['order_id' => $order->id]),
                'webhook' => route('orange-money.webhook')
            ];

            // Créer le paiement Orange Money
            $result = $this->orangeMoneyService->createPayment($order, $returnUrls);

            if (!$result['success']) {
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }

            // Obtenir la méthode de paiement Orange Money
            $paymentMethod = PaymentMethod::where('code', 'orange_money')->first();

            // Créer une transaction en attente
            $transaction = Transaction::create([
                'sell_id' => $order->id,
                'payment_method_id' => $paymentMethod->id,
                'transaction_id' => $result['payment_token'],
                'payment_id' => $result['payment_token'],
                'amount' => $order->total_payable_amount,
                'currency' => 'XOF',
                'status' => 'pending',
                'type' => 'payment',
                'gateway_response' => $result['payment'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'payment_token' => $result['payment_token'],
                'payment_url' => $result['payment_url'],
                'transaction_id' => $transaction->id
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Orange Money payment creation error', [
                'message' => $e->getMessage(),
                'order_id' => $request->order_id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la création du paiement Orange Money'
            ], 500);
        }
    }

    /**
     * Gérer le retour Orange Money - Succès
     */
    public function handleSuccessCallback(Request $request)
    {
        $orderId = $request->route('order_id');
        $paymentToken = $request->query('payment_token') ?? $request->query('token');
        $transactionId = $request->query('txnid');

        try {
            DB::beginTransaction();

            $order = Sell::findOrFail($orderId);
            $transaction = Transaction::where('payment_id', $paymentToken)->firstOrFail();

            // Vérifier le statut du paiement auprès d'Orange Money
            $result = $this->orangeMoneyService->getPaymentDetails($paymentToken);

            if ($result['success']) {
                $paymentData = $result['payment'];
                $status = OrangeMoneyService::mapStatus($paymentData['status'] ?? 'pending');

                if ($status === 'completed') {
                    // Paiement réussi
                    $transaction->markAsCompleted($paymentData);
                    $transaction->update([
                        'transaction_id' => $transactionId ?? $paymentToken,
                    ]);

                    // Mettre à jour la commande
                    $order->update([
                        'payment_status' => 1, // Payé
                        'total_paid' => $order->total_payable_amount,
                        'total_due' => 0,
                        'payment_method_id' => $transaction->payment_method_id,
                    ]);

                    DB::commit();

                    return Inertia::render('Frontend/Payment/Success', [
                        'order' => $order->load('sellDetails.product'),
                        'transaction' => $transaction,
                        'message' => 'Paiement Orange Money réussi !'
                    ]);

                } else {
                    // Paiement échoué ou en attente
                    $transaction->markAsFailed($paymentData);
                    
                    DB::commit();

                    return Inertia::render('Frontend/Payment/Failed', [
                        'order' => $order,
                        'error' => 'Le paiement Orange Money a échoué ou est en attente'
                    ]);
                }
            } else {
                // Erreur lors de la vérification
                $transaction->markAsFailed($result);
                
                DB::commit();

                return Inertia::render('Frontend/Payment/Failed', [
                    'order' => $order,
                    'error' => $result['error'] ?? 'Erreur de vérification du paiement'
                ]);
            }

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Orange Money success callback error', [
                'message' => $e->getMessage(),
                'order_id' => $orderId,
                'payment_token' => $paymentToken
            ]);

            return Inertia::render('Frontend/Payment/Failed', [
                'error' => 'Erreur lors du traitement du paiement'
            ]);
        }
    }

    /**
     * Gérer le retour Orange Money - Annulation
     */
    public function handleCancelCallback(Request $request)
    {
        $orderId = $request->route('order_id');
        $paymentToken = $request->query('payment_token') ?? $request->query('token');

        try {
            $order = Sell::findOrFail($orderId);
            
            if ($paymentToken) {
                $transaction = Transaction::where('payment_id', $paymentToken)->first();
                if ($transaction) {
                    $transaction->markAsCancelled();
                }
            }

            return Inertia::render('Frontend/Payment/Cancelled', [
                'order' => $order,
                'message' => 'Paiement Orange Money annulé'
            ]);

        } catch (\Exception $e) {
            Log::error('Orange Money cancel callback error', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);

            return Inertia::render('Frontend/Payment/Failed', [
                'error' => 'Erreur lors de l\'annulation'
            ]);
        }
    }

    /**
     * Webhook Orange Money pour les notifications de paiement
     */
    public function handleWebhook(Request $request)
    {
        try {
            $data = $request->all();
            
            Log::info('Orange Money webhook received', $data);

            $result = $this->orangeMoneyService->processWebhook($data);
            
            if (!$result['success']) {
                Log::error('Orange Money webhook processing failed', [
                    'error' => $result['error'],
                    'data' => $data
                ]);
                return response('Webhook processing failed', 400);
            }

            $paymentToken = $result['payment_token'];
            $status = OrangeMoneyService::mapStatus($result['status']);

            // Trouver la transaction
            $transaction = Transaction::where('payment_id', $paymentToken)->first();
            
            if (!$transaction) {
                Log::warning('Orange Money webhook: transaction not found', [
                    'payment_token' => $paymentToken
                ]);
                return response('Transaction not found', 404);
            }

            DB::beginTransaction();

            // Mettre à jour la transaction selon le statut
            if ($status === 'completed') {
                $transaction->markAsCompleted($data);
                
                // Mettre à jour la commande
                $order = $transaction->sell;
                $order->update([
                    'payment_status' => 1,
                    'total_paid' => $transaction->amount,
                    'total_due' => 0,
                ]);

                Log::info('Orange Money payment completed via webhook', [
                    'transaction_id' => $transaction->id,
                    'order_id' => $order->id
                ]);

            } elseif ($status === 'failed') {
                $transaction->markAsFailed($data);
                
                Log::info('Orange Money payment failed via webhook', [
                    'transaction_id' => $transaction->id
                ]);

            } elseif ($status === 'cancelled') {
                $transaction->markAsCancelled();
                
                Log::info('Orange Money payment cancelled via webhook', [
                    'transaction_id' => $transaction->id
                ]);
            }

            DB::commit();

            return response('OK', 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Orange Money webhook error', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response('Internal Server Error', 500);
        }
    }

    /**
     * Vérifier le statut d'un paiement
     */
    public function checkPaymentStatus(Request $request)
    {
        $request->validate([
            'payment_token' => 'required|string',
        ]);

        try {
            $result = $this->orangeMoneyService->getPaymentDetails($request->payment_token);
            
            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'payment' => $result['payment'],
                    'status' => OrangeMoneyService::mapStatus($result['payment']['status'] ?? 'pending')
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => $result['error']
            ], 500);

        } catch (\Exception $e) {
            Log::error('Orange Money check status error', [
                'message' => $e->getMessage(),
                'payment_token' => $request->payment_token
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la vérification du statut'
            ], 500);
        }
    }

    /**
     * Page de configuration Orange Money (Admin)
     */
    public function configurationPage()
    {
        $orangeMoneyMethod = PaymentMethod::where('code', 'orange_money')->first();
        
        return Inertia::render('Admin/PaymentMethods/OrangeMoneyConfig', [
            'paymentMethod' => $orangeMoneyMethod,
            'isConfigured' => OrangeMoneyService::isConfigured()
        ]);
    }

    /**
     * Tester la configuration Orange Money
     */
    public function testConfiguration()
    {
        try {
            if (!$this->orangeMoneyService) {
                return response()->json([
                    'success' => false,
                    'error' => 'Orange Money non configuré'
                ]);
            }

            // Test simple - vérification de la configuration
            $config = $this->orangeMoneyService->getConfig();
            
            return response()->json([
                'success' => true,
                'message' => 'Configuration Orange Money valide',
                'mode' => $config['mode'] ?? 'sandbox'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Configuration Orange Money invalide: ' . $e->getMessage()
            ]);
        }
    }
}
