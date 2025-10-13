<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sell;
use App\Models\User;

class UpdateExistingOrdersCommand extends Command
{
    protected $signature = 'orders:update-existing';
    protected $description = 'Mettre à jour les commandes existantes avec les champs manquants';

    public function handle()
    {
        $this->info('Mise à jour des commandes existantes...');

        $orders = Sell::whereNull('sell_type')
            ->orWhereNull('date')
            ->orWhereNull('invoice_id')
            ->get();

        $this->info("Nombre de commandes à mettre à jour: " . $orders->count());

        $bar = $this->output->createProgressBar($orders->count());
        $bar->start();

        foreach ($orders as $order) {
            // Mettre à jour sell_type si null
            if (is_null($order->sell_type)) {
                $order->sell_type = 2; // 2 = ecommerce_sell
            }

            // Mettre à jour date si null
            if (is_null($order->date)) {
                $order->date = $order->created_at;
            }

            // Générer invoice_id si null et si la commande est validée
            if (is_null($order->invoice_id) && $order->payment_status == 1) {
                $order->invoice_id = 'INV-' . date('Ym', strtotime($order->created_at)) . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);
            }

            // Assigner sell_by à un admin si payment_status = 1
            if (is_null($order->sell_by) && $order->payment_status == 1) {
                $admin = User::whereHas('roles', function($query) {
                    $query->where('name', 'Admin');
                })->first();
                
                if ($admin) {
                    $order->sell_by = $admin->id;
                }
            }

            $order->save();
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nMise à jour terminée !");

        return 0;
    }
}