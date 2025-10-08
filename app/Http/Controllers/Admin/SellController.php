<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSellRequest;
use App\Http\Requests\UpdateSellRequest;
use App\Models\Sell;
use App\Models\Ecommerce_customer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SellController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Afficher la liste des commandes
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $customerFilter = $request->get('customer_id');
        $statusFilter = $request->get('order_status');
        $paymentFilter = $request->get('payment_status');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        $perPage = $request->get('per_page', 15);

        $query = Sell::with(['customer', 'sellDetails', 'createdBy'])
                    ->latest();

        // Filtres de recherche
        if ($search) {
            $query->search($search);
        }

        if ($customerFilter) {
            $query->where('customer_id', $customerFilter);
        }

        if ($statusFilter !== null) {
            $query->where('order_status', $statusFilter);
        }

        if ($paymentFilter !== null) {
            $query->where('payment_status', $paymentFilter);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $query->paginate($perPage);

        // Statistiques pour le tableau de bord
        $stats = $this->orderService->getOrderStatistics([
            'customer_id' => $customerFilter,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'status' => $statusFilter,
        ]);

        // Données pour les filtres
        $customers = Ecommerce_customer::select('id', 'first_name', 'last_name', 'email')
                                      ->orderBy('first_name')
                                      ->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'customer_id' => $customerFilter,
                'order_status' => $statusFilter,
                'payment_status' => $paymentFilter,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'per_page' => $perPage,
            ],
            'orderStatuses' => $this->getOrderStatuses(),
            'paymentStatuses' => $this->getPaymentStatuses(),
            'localeConfig' => get_js_locale_config(),
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
        ]);
    }

    /**
     * Afficher le formulaire de création d'une nouvelle commande
     */
    public function create()
    {
        $customers = Ecommerce_customer::select('id', 'first_name', 'last_name', 'email')
                                      ->active()
                                      ->orderBy('first_name')
                                      ->get();

        $products = Product::with(['variants' => function ($query) {
                        $query->where('available_quantity', '>', 0);
                    }])
                    ->where('status', 1)
                    ->select('id', 'name', 'current_sale_price', 'current_purchase_cost', 'available_quantity', 'image_path')
                    ->orderBy('name')
                    ->get();

        return Inertia::render('Admin/Orders/create', [
            'customers' => $customers,
            'products' => $products,
            'localeConfig' => get_js_locale_config(),
        ]);
    }

    /**
     * Enregistrer une nouvelle commande
     */
    public function store(StoreSellRequest $request)
    {
        try {
            $orderData = $request->validated();
            $orderItems = $orderData['items'];
            unset($orderData['items']);

            $order = $this->orderService->createOrder($orderData, $orderItems);

            return redirect()
                ->route('admin.orders.show', $order->id)
                ->with('success', 'Commande créée avec succès!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur lors de la création de la commande: ' . $e->getMessage());
        }
    }

    /**
     * Afficher les détails d'une commande
     */
    public function show(Sell $sell)
    {
        $order = $sell->load([
            'customer',
            'sellDetails.product',
            'sellDetails.productVariant',
            'createdBy',
            'updatedBy',
            'orderAddress',
            'paymentInfo'
        ]);

        return Inertia::render('Admin/Orders/show', [
            'order' => $order,
            'orderStatuses' => $this->getOrderStatuses(),
            'paymentStatuses' => $this->getPaymentStatuses(),
            'localeConfig' => get_js_locale_config(),
            'flash' => [
                'success' => session('flash.success'),
                'error' => session('flash.error'),
            ],
        ]);
    }

    /**
     * Afficher le formulaire d'édition d'une commande
     */
    public function edit(Sell $sell)
    {
        $order = $sell->load(['customer', 'sellDetails.product', 'sellDetails.productVariant']);

        // Ne permettre l'édition que si la commande n'est pas terminée
        if ($order->status == 1 || $order->order_status >= 6) {
            return redirect()
                ->route('admin.orders.show', $order->id)
                ->with('error', 'Cette commande ne peut plus être modifiée.');
        }

        $customers = Ecommerce_customer::select('id', 'first_name', 'last_name', 'email')
                                      ->active()
                                      ->orderBy('first_name')
                                      ->get();

        return Inertia::render('Admin/Orders/edit', [
            'order' => $order,
            'customers' => $customers,
            'orderStatuses' => $this->getOrderStatuses(),
            'paymentStatuses' => $this->getPaymentStatuses(),
        ]);
    }

    /**
     * Mettre à jour une commande
     */
    public function update(UpdateSellRequest $request, Sell $sell)
    {
        try {
            $order = $this->orderService->updateOrder($sell, $request->validated());

            return redirect()
                ->route('admin.orders.show', $order->id)
                ->with('success', 'Commande mise à jour avec succès!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur lors de la mise à jour: ' . $e->getMessage());
        }
    }

    /**
     * Supprimer/Annuler une commande
     */
    public function destroy(Sell $sell)
    {
        try {
            $this->orderService->cancelOrder($sell);

            return redirect()
                ->route('admin.orders.index')
                ->with('success', 'Commande annulée avec succès!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Erreur lors de l\'annulation: ' . $e->getMessage());
        }
    }

    /**
     * Changer le statut d'une commande (AJAX)
     */
    public function updateStatus(Request $request, Sell $sell)
    {
        $request->validate([
            'order_status' => 'nullable|integer|min:0|max:6',
            'payment_status' => 'nullable|integer|min:0|max:3',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $order = $this->orderService->updateOrder($sell, $request->only([
                'order_status', 'payment_status', 'notes'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès!',
                'order' => $order,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Générer et télécharger la facture PDF
     */
    public function downloadInvoice(Sell $sell)
    {
        $order = $sell->load([
            'customer',
            'sellDetails.product',
            'sellDetails.productVariant'
        ]);

        // TODO: Implémenter la génération PDF avec une librairie comme barryvdh/laravel-dompdf
        // Pour l'instant, retourner une vue simple
        
        return response()->view('admin.orders.invoice', compact('order'))
                        ->header('Content-Type', 'text/html');
    }

    /**
     * Exporter les commandes en CSV
     */
    public function export(Request $request)
    {
        $query = Sell::with(['customer', 'sellDetails']);

        // Appliquer les mêmes filtres que l'index
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->get();

        $filename = 'commandes_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, [
                'Référence',
                'Client',
                'Email Client',
                'Date Commande',
                'Statut Commande',
                'Statut Paiement',
                'Montant Total',
                'Montant Payé',
                'Montant Dû',
                'Nombre Articles',
                'Méthode Livraison',
            ]);

            // Données
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_reference,
                    $order->customer ? $order->customer->full_name : 'N/A',
                    $order->customer ? $order->customer->email : 'N/A',
                    $order->created_at->format('d/m/Y H:i'),
                    $order->order_status_text,
                    $order->payment_status_text,
                    number_format($order->total_payable_amount, 2) . ' €',
                    number_format($order->total_paid, 2) . ' €',
                    number_format($order->total_due, 2) . ' €',
                    $order->getTotalItemsCount(),
                    $order->shipping_method ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Obtenir les produits disponibles pour autocomplete (AJAX)
     */
    public function searchProducts(Request $request)
    {
        $search = $request->get('q');
        
        $products = Product::with(['variants' => function ($query) {
                        $query->where('available_quantity', '>', 0);
                    }])
                    ->where('status', 1)
                    ->where(function ($query) use ($search) {
                        $query->where('name', 'like', '%' . $search . '%')
                              ->orWhere('code', 'like', '%' . $search . '%');
                    })
                    ->select('id', 'name', 'code', 'current_sale_price', 'current_purchase_cost', 'available_quantity', 'image_path')
                    ->limit(20)
                    ->get();

        return response()->json($products);
    }

    /**
     * Obtenir les statuts de commande
     */
    private function getOrderStatuses()
    {
        return [
            0 => 'En attente',
            1 => 'En traitement',
            2 => 'En route',
            3 => 'Demande d\'annulation',
            4 => 'Annulation acceptée',
            5 => 'Processus d\'annulation terminé',
            6 => 'Commande terminée'
        ];
    }

    /**
     * Obtenir les statuts de paiement
     */
    private function getPaymentStatuses()
    {
        return [
            0 => 'Non payé',
            1 => 'Payé',
            2 => 'Partiellement payé',
            3 => 'Remboursé'
        ];
    }
}