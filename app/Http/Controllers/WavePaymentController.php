<?php

namespace App\Http\Controllers;

use App\Models\Sell;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Services\WaveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WavePaymentController extends Controller
{
    private $waveService;

    public function __construct()
    {
        try {
            $this->waveService = new WaveService();
        } catch (\Exception $e) {
            Log::error('Wave service initialization failed: ' . $e->getMessage());
        }
    }

    /**
     * Créer un paiement Wave
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

            // Vérifier que Wave est configuré
            if (!$this->waveService) {
                return response()->json([
                    'success' => false,
                    'error' => 'Wave non configuré'
                ], 500);
            }

            // URLs de retour
            $returnUrls = [
                'success' => route('wave.callback.success', ['order_id' => $order->id]),
                'cancel' => route('wave.callback.cancel', ['order_id' => $order->id]),
                'webhook' => route('wave.webhook')
            ];

            // Créer le paiement Wave
            $result = $this->waveService->createPayment($order, $returnUrls);

            if (!$result['success']) {
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }

            // Obtenir la méthode de paiement Wave
            $paymentMethod = PaymentMethod::where('code', 'wave')->first();

            // Créer une transaction en attente
            $transaction = Transaction::create([
                'sell_id' => $order->id,
                'payment_method_id' => $paymentMethod->id,
                'transaction_id' => $result['checkout_session_id'],
                'payment_id' => $result['checkout_session_id'],
                'amount' => $order->total_payable_amount,
                'currency' => 'XOF',
                'status' => 'pending',
                'type' => 'payment',
                'gateway_response' => $result['payment'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'checkout_session_id' => $result['checkout_session_id'],
                'checkout_url' => $result['checkout_url'],
                'transaction_id' => $transaction->id
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Wave payment creation error', [
                'message' => $e->getMessage(),
                'order_id' => $request->order_id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la création du paiement Wave'
            ], 500);
        }
    }

    /**
     * Gérer le retour Wave - Succès
     */
    public function handleSuccessCallback(Request $request)
    {
        $orderId = $request->route('order_id');
        $sessionId = $request->query('checkout_session_id') ?? $request->query('session_id');

        try {
            DB::beginTransaction();

            $order = Sell::findOrFail($orderId);
            $transaction = Transaction::where('payment_id', $sessionId)->firstOrFail();

            // Vérifier le statut du paiement auprès de Wave
            $result = $this->waveService->getPaymentDetails($sessionId);

            if ($result['success']) {
                $paymentData = $result['payment'];
                $status = WaveService::mapStatus($paymentData['status'] ?? 'pending');

                if ($status === 'completed') {
                    // Paiement réussi
                    $transaction->markAsCompleted($paymentData);
                    $transaction->update([
                        'transaction_id' => $paymentData['id'] ?? $sessionId,
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
                        'transaction' => $transaction->load('paymentMethod'),
                        'message' => 'Paiement Wave réussi !'
                    ]);

                } else {
                    // Paiement échoué ou en attente
                    $transaction->markAsFailed($paymentData);
                    
                    DB::commit();

                    return Inertia::render('Frontend/Payment/Failed', [
                        'order' => $order,
                        'error' => 'Le paiement Wave a échoué ou est en attente'
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
            Log::error('Wave success callback error', [
                'message' => $e->getMessage(),
                'order_id' => $orderId,
                'session_id' => $sessionId
            ]);

            return Inertia::render('Frontend/Payment/Failed', [
                'error' => 'Erreur lors du traitement du paiement'
            ]);
        }
    }

    /**
     * Gérer le retour Wave - Annulation
     */
    public function handleCancelCallback(Request $request)
    {
        $orderId = $request->route('order_id');
        $sessionId = $request->query('checkout_session_id') ?? $request->query('session_id');

        try {
            $order = Sell::findOrFail($orderId);
            
            if ($sessionId) {
                $transaction = Transaction::where('payment_id', $sessionId)->first();
                if ($transaction) {
                    $transaction->markAsCancelled();
                }
            }

            return Inertia::render('Frontend/Payment/Cancelled', [
                'order' => $order,
                'message' => 'Paiement Wave annulé'
            ]);

        } catch (\Exception $e) {
            Log::error('Wave cancel callback error', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);

            return Inertia::render('Frontend/Payment/Failed', [
                'error' => 'Erreur lors de l\'annulation'
            ]);
        }
    }

    /**
     * Webhook Wave pour les notifications de paiement
     */
    public function handleWebhook(Request $request)
    {
        try {
            $data = $request->all();
            
            Log::info('Wave webhook received', $data);

            $result = $this->waveService->processWebhook($data);
            
            if (!$result['success']) {
                Log::error('Wave webhook processing failed', [
                    'error' => $result['error'],
                    'data' => $data
                ]);
                return response('Webhook processing failed', 400);
            }

            $sessionId = $result['checkout_session_id'];
            $status = WaveService::mapStatus($result['status']);
            $eventType = $result['event_type'];

            // Traiter seulement les événements de paiement
            if (!in_array($eventType, ['checkout.session.completed', 'checkout.session.expired', 'checkout.session.cancelled'])) {
                return response('Event not processed', 200);
            }

            // Trouver la transaction
            $transaction = Transaction::where('payment_id', $sessionId)->first();
            
            if (!$transaction) {
                Log::warning('Wave webhook: transaction not found', [
                    'session_id' => $sessionId,
                    'event_type' => $eventType
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

                Log::info('Wave payment completed via webhook', [
                    'transaction_id' => $transaction->id,
                    'order_id' => $order->id
                ]);

            } elseif ($status === 'failed') {
                $transaction->markAsFailed($data);
                
                Log::info('Wave payment failed via webhook', [
                    'transaction_id' => $transaction->id
                ]);

            } elseif ($status === 'cancelled') {
                $transaction->markAsCancelled();
                
                Log::info('Wave payment cancelled via webhook', [
                    'transaction_id' => $transaction->id
                ]);
            }

            DB::commit();

            return response('OK', 200);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Wave webhook error', [
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
            'session_id' => 'required|string',
        ]);

        try {
            $result = $this->waveService->getPaymentDetails($request->session_id);
            
            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'payment' => $result['payment'],
                    'status' => WaveService::mapStatus($result['payment']['status'] ?? 'pending')
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => $result['error']
            ], 500);

        } catch (\Exception $e) {
            Log::error('Wave check status error', [
                'message' => $e->getMessage(),
                'session_id' => $request->session_id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la vérification du statut'
            ], 500);
        }
    }

    /**
     * Rembourser un paiement
     */
    public function refundPayment(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'amount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $transaction = Transaction::findOrFail($request->transaction_id);
            
            if ($transaction->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'error' => 'Seuls les paiements complétés peuvent être remboursés'
                ], 400);
            }

            $amount = $request->amount ? $request->amount : $transaction->amount;
            
            $result = $this->waveService->refundPayment($transaction->payment_id, $amount);
            
            if ($result['success']) {
                // Créer une transaction de remboursement
                $refundTransaction = Transaction::create([
                    'sell_id' => $transaction->sell_id,
                    'payment_method_id' => $transaction->payment_method_id,
                    'transaction_id' => $result['refund']['id'],
                    'payment_id' => $transaction->payment_id,
                    'amount' => -$amount, // Montant négatif pour le remboursement
                    'currency' => $transaction->currency,
                    'status' => 'completed',
                    'type' => 'refund',
                    'gateway_response' => $result['refund'],
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'refund_transaction' => $refundTransaction
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => $result['error']
            ], 500);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Wave refund error', [
                'message' => $e->getMessage(),
                'transaction_id' => $request->transaction_id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du remboursement'
            ], 500);
        }
    }

    /**
     * Page de configuration Wave (Admin)
     */
    public function configurationPage()
    {
        $waveMethod = PaymentMethod::where('code', 'wave')->first();
        
        return Inertia::render('Admin/PaymentMethods/WaveConfig', [
            'paymentMethod' => $waveMethod,
            'isConfigured' => WaveService::isConfigured()
        ]);
    }

    /**
     * Tester la configuration Wave
     */
    public function testConfiguration()
    {
        try {
            if (!$this->waveService) {
                return response()->json([
                    'success' => false,
                    'error' => 'Wave non configuré'
                ]);
            }

            // Test simple - vérification de la configuration
            $config = $this->waveService->getConfig();
            
            return response()->json([
                'success' => true,
                'message' => 'Configuration Wave valide',
                'mode' => $config['mode'] ?? 'sandbox'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Configuration Wave invalide: ' . $e->getMessage()
            ]);
        }
    }
}
