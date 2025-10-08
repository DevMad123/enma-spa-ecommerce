<?php

namespace App\Http\Controllers;

use App\Models\Sell;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Services\PayPalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PayPalPaymentController extends Controller
{
    private $paypalService;

    public function __construct()
    {
        try {
            $this->paypalService = new PayPalService();
        } catch (\Exception $e) {
            Log::error('PayPal service initialization failed: ' . $e->getMessage());
        }
    }

    /**
     * Créer un paiement PayPal
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

            // Vérifier que PayPal est configuré
            if (!$this->paypalService) {
                return response()->json([
                    'success' => false,
                    'error' => 'PayPal non configuré'
                ], 500);
            }

            // URLs de retour
            $returnUrls = [
                'success' => route('paypal.callback.success', ['order_id' => $order->id]),
                'cancel' => route('paypal.callback.cancel', ['order_id' => $order->id])
            ];

            // Créer le paiement PayPal
            $result = $this->paypalService->createPayment($order, $returnUrls);

            if (!$result['success']) {
                DB::rollback();
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }

            // Obtenir la méthode de paiement PayPal
            $paymentMethod = PaymentMethod::where('code', 'paypal')->first();

            // Créer une transaction en attente
            $transaction = Transaction::create([
                'sell_id' => $order->id,
                'payment_method_id' => $paymentMethod->id,
                'transaction_id' => $result['payment_id'],
                'payment_id' => $result['payment_id'],
                'amount' => $order->total_payable_amount,
                'currency' => 'XOF',
                'status' => 'pending',
                'type' => 'payment',
                'gateway_response' => $result['payment'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'payment_id' => $result['payment_id'],
                'approval_url' => $result['approval_url'],
                'transaction_id' => $transaction->id
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('PayPal payment creation error', [
                'message' => $e->getMessage(),
                'order_id' => $request->order_id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la création du paiement PayPal'
            ], 500);
        }
    }

    /**
     * Gérer le retour PayPal - Succès
     */
    public function handleSuccessCallback(Request $request)
    {
        $orderId = $request->route('order_id');
        $paymentId = $request->query('token');
        $payerId = $request->query('PayerID');

        try {
            DB::beginTransaction();

            $order = Sell::findOrFail($orderId);
            $transaction = Transaction::where('payment_id', $paymentId)->firstOrFail();

            // Capturer le paiement PayPal
            $result = $this->paypalService->capturePayment($paymentId);

            if ($result['success']) {
                // Mettre à jour la transaction
                $transaction->markAsCompleted($result['payment']);
                $transaction->update([
                    'payer_id' => $payerId,
                    'transaction_id' => $result['transaction_id'] ?? $paymentId,
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
                    'message' => 'Paiement PayPal réussi !'
                ]);

            } else {
                // Échec de la capture
                $transaction->markAsFailed($result);
                
                DB::commit();

                return Inertia::render('Frontend/Payment/Failed', [
                    'order' => $order,
                    'error' => $result['error'] ?? 'Échec de la capture du paiement'
                ]);
            }

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('PayPal success callback error', [
                'message' => $e->getMessage(),
                'order_id' => $orderId,
                'payment_id' => $paymentId
            ]);

            return Inertia::render('Frontend/Payment/Failed', [
                'error' => 'Erreur lors du traitement du paiement'
            ]);
        }
    }

    /**
     * Gérer le retour PayPal - Annulation
     */
    public function handleCancelCallback(Request $request)
    {
        $orderId = $request->route('order_id');
        $paymentId = $request->query('token');

        try {
            $order = Sell::findOrFail($orderId);
            
            if ($paymentId) {
                $transaction = Transaction::where('payment_id', $paymentId)->first();
                if ($transaction) {
                    $transaction->markAsCancelled();
                }
            }

            return Inertia::render('Frontend/Payment/Cancelled', [
                'order' => $order,
                'message' => 'Paiement PayPal annulé'
            ]);

        } catch (\Exception $e) {
            Log::error('PayPal cancel callback error', [
                'message' => $e->getMessage(),
                'order_id' => $orderId
            ]);

            return Inertia::render('Frontend/Payment/Failed', [
                'error' => 'Erreur lors de l\'annulation'
            ]);
        }
    }

    /**
     * Vérifier le statut d'un paiement
     */
    public function checkPaymentStatus(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|string',
        ]);

        try {
            $result = $this->paypalService->getPaymentDetails($request->payment_id);
            
            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'payment' => $result['payment']
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => $result['error']
            ], 500);

        } catch (\Exception $e) {
            Log::error('PayPal check status error', [
                'message' => $e->getMessage(),
                'payment_id' => $request->payment_id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la vérification du statut'
            ], 500);
        }
    }

    /**
     * Page de configuration PayPal (Admin)
     */
    public function configurationPage()
    {
        $paypalMethod = PaymentMethod::where('code', 'paypal')->first();
        
        return Inertia::render('Admin/PaymentMethods/PayPalConfig', [
            'paymentMethod' => $paypalMethod,
            'isConfigured' => PayPalService::isConfigured()
        ]);
    }

    /**
     * Tester la configuration PayPal
     */
    public function testConfiguration()
    {
        try {
            if (!$this->paypalService) {
                return response()->json([
                    'success' => false,
                    'error' => 'PayPal non configuré'
                ]);
            }

            // Test simple - récupération du token
            $config = $this->paypalService->getConfig();
            
            return response()->json([
                'success' => true,
                'message' => 'Configuration PayPal valide',
                'mode' => $config['mode'] ?? 'sandbox'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Configuration PayPal invalide: ' . $e->getMessage()
            ]);
        }
    }
}
