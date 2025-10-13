<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sell;
use App\Models\Shipping;

class FixExistingOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:fix {--dry-run : Afficher les changements sans les appliquer}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Corriger les commandes existantes : shipping_method, invoice_id pour les commandes payées, etc.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 Mode dry-run activé - Aucune modification ne sera appliquée');
        }

        $this->info('🔧 Correction des commandes existantes...');

        // 1. Corriger les shipping_method manquants
        $this->fixShippingMethods($dryRun);

        // 2. Générer invoice_id pour les commandes payées
        $this->generateInvoiceIds($dryRun);

        // 3. Vérifier sell_type
        $this->fixSellTypes($dryRun);

        $this->info('✅ Correction terminée !');
        
        return 0;
    }

    private function fixShippingMethods($dryRun)
    {
        $this->info('📦 Correction des méthodes de livraison...');

        $orders = Sell::whereNotNull('shipping_id')
                     ->where(function($query) {
                         $query->whereNull('shipping_method')
                               ->orWhere('shipping_method', '');
                     })
                     ->with('shipping')
                     ->get();

        $this->line("Commandes à corriger : {$orders->count()}");

        foreach ($orders as $order) {
            $shippingName = $order->shipping ? $order->shipping->name : 'Méthode inconnue';
            
            $this->line("- Commande #{$order->id}: {$shippingName}");
            
            if (!$dryRun) {
                $order->update(['shipping_method' => $shippingName]);
            }
        }
    }

    private function generateInvoiceIds($dryRun)
    {
        $this->info('🧾 Génération des numéros de facture...');

        $paidOrders = Sell::where('payment_status', 1)
                          ->where(function($query) {
                              $query->whereNull('invoice_id')
                                    ->orWhere('invoice_id', '');
                          })
                          ->get();

        $this->line("Commandes payées sans facture : {$paidOrders->count()}");

        foreach ($paidOrders as $order) {
            $invoiceId = 'INV-' . date('Ym', strtotime($order->created_at)) . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);
            
            $this->line("- Commande #{$order->id}: {$invoiceId}");
            
            if (!$dryRun) {
                $order->update(['invoice_id' => $invoiceId]);
            }
        }
    }

    private function fixSellTypes($dryRun)
    {
        $this->info('🏪 Correction des types de ventes...');

        $orders = Sell::whereNull('sell_type')
                     ->orWhere('sell_type', 0)
                     ->get();

        $this->line("Commandes avec sell_type incorrect : {$orders->count()}");

        foreach ($orders as $order) {
            $this->line("- Commande #{$order->id}: sell_type = 2 (ecommerce)");
            
            if (!$dryRun) {
                $order->update(['sell_type' => 2]);
            }
        }
    }
}
