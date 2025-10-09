<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Sell;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Créer un nouveau paiement et mettre à jour automatiquement les statuts
     */
    public function createPayment(array $paymentData)
    {
        return DB::transaction(function () use ($paymentData) {
            // Définir automatiquement le statut comme pending
            $paymentData['status'] = 'pending';
            $paymentData['created_by'] = auth()->id();
            $paymentData['updated_by'] = auth()->id();

            // Créer le paiement
            $payment = Payment::create($paymentData);

            // Mettre à jour les statuts de la commande si elle existe
            if (isset($paymentData['sell_id']) && $paymentData['sell_id']) {
                $this->updateOrderPaymentStatus($paymentData['sell_id']);
            }

            return $payment;
        });
    }

    /**
     * Valider un paiement et mettre à jour les statuts
     */
    public function validatePayment(Payment $payment)
    {
        return DB::transaction(function () use ($payment) {
            // Marquer le paiement comme réussi
            $payment->update([
                'status' => 'success',
                'updated_by' => auth()->id(),
            ]);

            // Mettre à jour les statuts de la commande
            if ($payment->sell_id) {
                $this->updateOrderPaymentStatus($payment->sell_id);
            }

            return $payment;
        });
    }

    /**
     * Mettre à jour automatiquement les statuts de paiement d'une commande
     */
    public function updateOrderPaymentStatus($sellId)
    {
        $sell = Sell::with('payments')->findOrFail($sellId);
        
        // Calculer le total payé (seuls les paiements réussis comptent)
        $totalPaid = $sell->payments()
            ->where('status', 'success')
            ->sum('amount');

        // Calculer le montant total à payer
        $totalAmount = $sell->total_payable_amount;

        // Déterminer le nouveau statut de paiement
        $newPaymentStatus = $this->determinePaymentStatus($totalPaid, $totalAmount);

        // Mettre à jour la commande
        $sell->update([
            'total_paid' => $totalPaid,
            'total_due' => max(0, $totalAmount - $totalPaid),
            'payment_status' => $newPaymentStatus,
            'updated_by' => auth()->id(),
        ]);

        Log::info("Statut de paiement mis à jour pour la commande {$sellId}: {$newPaymentStatus}");

        return $sell;
    }

    /**
     * Déterminer le statut de paiement selon les montants
     */
    private function determinePaymentStatus($totalPaid, $totalAmount)
    {
        if ($totalPaid <= 0) {
            return 0; // Non payé
        } elseif ($totalPaid >= $totalAmount) {
            return 1; // Entièrement payé
        } else {
            return 2; // Partiellement payé
        }
    }

    /**
     * Rejeter un paiement
     */
    public function rejectPayment(Payment $payment)
    {
        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'failed',
                'updated_by' => auth()->id(),
            ]);

            // Mettre à jour les statuts de la commande
            if ($payment->sell_id) {
                $this->updateOrderPaymentStatus($payment->sell_id);
            }

            return $payment;
        });
    }

    /**
     * Rembourser un paiement
     */
    public function refundPayment(Payment $payment)
    {
        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'refunded',
                'updated_by' => auth()->id(),
            ]);

            // Mettre à jour les statuts de la commande
            if ($payment->sell_id) {
                $this->updateOrderPaymentStatus($payment->sell_id);
            }

            return $payment;
        });
    }
}