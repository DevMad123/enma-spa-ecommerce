<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use App\Models\Sell;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Afficher la liste des paiements
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $methodFilter = $request->get('method');
        $statusFilter = $request->get('status');
        $sellFilter = $request->get('sell_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        $perPage = $request->get('per_page', 15);

        $query = Payment::with(['sell.customer', 'createdBy'])
                       ->latest('payment_date');

        // Filtres de recherche
        if ($search) {
            $query->search($search);
        }

        if ($methodFilter) {
            $query->byMethod($methodFilter);
        }

        if ($statusFilter) {
            $query->byStatus($statusFilter);
        }

        if ($sellFilter) {
            $query->bySell($sellFilter);
        }

        if ($dateFrom) {
            $query->whereDate('payment_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('payment_date', '<=', $dateTo);
        }

        $payments = $query->paginate($perPage);

        // Statistiques pour le tableau de bord
        $stats = $this->getPaymentStatistics([
            'method' => $methodFilter,
            'status' => $statusFilter,
            'sell_id' => $sellFilter,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);

        // Données pour les filtres
        $sells = Sell::with('customer')
                     ->select('id', 'order_reference', 'customer_id', 'total_payable_amount')
                     ->orderBy('created_at', 'desc')
                     ->limit(100)
                     ->get();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'sells' => $sells,
            'filters' => [
                'search' => $search,
                'method' => $methodFilter,
                'status' => $statusFilter,
                'sell_id' => $sellFilter,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'per_page' => $perPage,
            ],
            'paymentMethods' => Payment::METHODS,
            'paymentStatuses' => Payment::STATUSES,
        ]);
    }

    /**
     * Afficher le formulaire de création d'un nouveau paiement
     */
    public function create(Request $request)
    {
        $sellId = $request->get('sell_id');
        $sell = null;
        
        if ($sellId) {
            $sell = Sell::with(['customer', 'payments' => function($query) {
                $query->successful();
            }])->find($sellId);
        }

        $sells = Sell::with('customer')
                     ->whereHas('customer')
                     ->where('payment_status', '!=', 1) // Exclure les commandes déjà payées
                     ->select('id', 'order_reference', 'customer_id', 'total_payable_amount', 'total_paid')
                     ->orderBy('created_at', 'desc')
                     ->limit(50)
                     ->get();

        return Inertia::render('Admin/Payments/create', [
            'sell' => $sell,
            'sells' => $sells,
            'paymentMethods' => Payment::METHODS,
            'paymentStatuses' => Payment::STATUSES,
        ]);
    }

    /**
     * Enregistrer un nouveau paiement
     */
    public function store(StorePaymentRequest $request)
    {
        try {
            DB::beginTransaction();

            $paymentData = $request->validated();
            $paymentData['created_by'] = auth()->id();
            $paymentData['updated_by'] = auth()->id();

            $payment = Payment::create($paymentData);

            DB::commit();

            return redirect()
                ->route('admin.payments.show', $payment->id)
                ->with('success', 'Paiement enregistré avec succès!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création du paiement: ' . $e->getMessage());
            
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur lors de l\'enregistrement du paiement: ' . $e->getMessage());
        }
    }

    /**
     * Afficher les détails d'un paiement
     */
    public function show(Payment $payment)
    {
        $payment->load([
            'sell.customer',
            'sell.payments' => function($query) {
                $query->orderBy('payment_date', 'desc');
            },
            'createdBy',
            'updatedBy'
        ]);

        return Inertia::render('Admin/Payments/show', [
            'payment' => $payment,
            'paymentMethods' => Payment::METHODS,
            'paymentStatuses' => Payment::STATUSES,
        ]);
    }

    /**
     * Afficher le formulaire d'édition d'un paiement
     */
    public function edit(Payment $payment)
    {
        $payment->load(['sell.customer']);

        // Ne permettre l'édition que si le paiement n'est pas encore traité
        if (in_array($payment->status, ['success', 'refunded'])) {
            return redirect()
                ->route('admin.payments.index')
                ->with('error', 'Ce paiement ne peut plus être modifié.');
        }

        return Inertia::render('Admin/Payments/edit', [
            'payment' => $payment,
            'paymentMethods' => Payment::METHODS,
            'paymentStatuses' => Payment::STATUSES,
        ]);
    }

    /**
     * Mettre à jour un paiement
     */
    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        try {
            DB::beginTransaction();

            $paymentData = $request->validated();
            $paymentData['updated_by'] = auth()->id();

            $payment->update($paymentData);

            DB::commit();

            return redirect()
                ->route('admin.payments.show', $payment->id)
                ->with('success', 'Paiement mis à jour avec succès!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la mise à jour du paiement: ' . $e->getMessage());
            
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur lors de la mise à jour: ' . $e->getMessage());
        }
    }

    /**
     * Supprimer/Annuler un paiement
     */
    public function destroy(Payment $payment)
    {
        try {
            if (in_array($payment->status, ['success', 'refunded'])) {
                return redirect()
                    ->back()
                    ->with('error', 'Un paiement réussi ou remboursé ne peut pas être supprimé. Utilisez la fonction de remboursement.');
            }

            DB::beginTransaction();

            $payment->update([
                'status' => 'cancelled',
                'deleted_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            $payment->delete();

            DB::commit();

            return redirect()
                ->route('admin.payments.index')
                ->with('success', 'Paiement annulé avec succès!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de l\'annulation du paiement: ' . $e->getMessage());
            
            return redirect()
                ->back()
                ->with('error', 'Erreur lors de l\'annulation: ' . $e->getMessage());
        }
    }

    /**
     * Suppression groupée de paiements (AJAX)
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:payments,id'
        ]);

        try {
            DB::beginTransaction();

            $payments = Payment::whereIn('id', $request->ids)->get();
            $deletedCount = 0;

            foreach ($payments as $payment) {
                if (!in_array($payment->status, ['success', 'refunded'])) {
                    $payment->update([
                        'status' => 'cancelled',
                        'deleted_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                    $payment->delete();
                    $deletedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$deletedCount paiement(s) supprimé(s) avec succès!",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression groupée: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Validation groupée de paiements (AJAX)
     */
    public function bulkValidate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:payments,id'
        ]);

        try {
            DB::beginTransaction();

            $payments = Payment::whereIn('id', $request->ids)
                              ->where('status', 'pending')
                              ->get();

            $validatedCount = 0;

            foreach ($payments as $payment) {
                $payment->markAsSuccess();
                $validatedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "$validatedCount paiement(s) validé(s) avec succès!",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la validation groupée: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Valider un paiement (AJAX)
     */
    public function validatePayment(Request $request, Payment $payment)
    {
        $request->validate([
            'transaction_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $payment->markAsSuccess($request->transaction_reference);
            
            if ($request->notes) {
                $payment->update(['notes' => $request->notes]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement validé avec succès!',
                'payment' => $payment->fresh(['sell']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la validation du paiement: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Rejeter un paiement (AJAX)
     */
    public function reject(Request $request, Payment $payment)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $payment->markAsFailed($request->reason);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement rejeté!',
                'payment' => $payment->fresh(['sell']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors du rejet du paiement: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Rembourser un paiement (AJAX)
     */
    public function refund(Request $request, Payment $payment)
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0.01|max:' . $payment->amount,
            'reason' => 'required|string|max:1000',
        ]);

        try {
            if ($payment->status !== 'success') {
                throw new \Exception('Seuls les paiements réussis peuvent être remboursés.');
            }

            DB::beginTransaction();

            $refundAmount = $request->amount ?? $payment->amount;
            $payment->refund($refundAmount);
            
            $payment->update(['notes' => $payment->notes . "\nRemboursement: " . $request->reason]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Remboursement effectué avec succès!',
                'payment' => $payment->fresh(['sell']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors du remboursement: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Exporter les paiements en CSV
     */
    public function export(Request $request)
    {
        $query = Payment::with(['sell.customer']);

        // Appliquer les mêmes filtres que l'index
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('method')) {
            $query->byMethod($request->method);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('sell_id')) {
            $query->bySell($request->sell_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->get();

        $filename = 'paiements_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, [
                'ID',
                'Commande',
                'Client',
                'Méthode',
                'Montant',
                'Devise',
                'Statut',
                'Référence Transaction',
                'Date Paiement',
                'Notes',
            ]);

            // Données
            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->id,
                    $payment->sell ? $payment->sell->order_reference : 'N/A',
                    $payment->sell && $payment->sell->customer ? $payment->sell->customer->first_name . ' ' . $payment->sell->customer->last_name : 'N/A',
                    $payment->method_text,
                    number_format($payment->amount, 2),
                    $payment->currency,
                    $payment->status_text,
                    $payment->transaction_reference ?? 'N/A',
                    $payment->payment_date->format('d/m/Y H:i'),
                    $payment->notes ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Obtenir les statistiques des paiements
     */
    private function getPaymentStatistics($filters = [])
    {
        $query = Payment::query();

        // Appliquer les filtres
        foreach ($filters as $key => $value) {
            if ($value) {
                switch ($key) {
                    case 'method':
                        $query->byMethod($value);
                        break;
                    case 'status':
                        $query->byStatus($value);
                        break;
                    case 'sell_id':
                        $query->bySell($value);
                        break;
                    case 'date_from':
                        $query->whereDate('payment_date', '>=', $value);
                        break;
                    case 'date_to':
                        $query->whereDate('payment_date', '<=', $value);
                        break;
                }
            }
        }

        return [
            'total_payments' => $query->count(),
            'successful_payments' => $query->clone()->successful()->count(),
            'pending_payments' => $query->clone()->pending()->count(),
            'failed_payments' => $query->clone()->failed()->count(),
            'total_amount' => $query->clone()->successful()->sum('amount'),
            'average_amount' => $query->clone()->successful()->avg('amount'),
        ];
    }
}