<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Sell;
use App\Models\Ecommerce_customer;
use App\Models\PaymentMethod;
use App\Models\Sell_details;
use App\Models\Product;
use App\Models\Notification as CustomNotification;
use App\Http\Controllers\Frontend\CartController;

class TestOrderNotification extends Command
{
    protected $signature = 'test:order-notification';
    protected $description = 'Test order notification system by creating a test order';

    public function handle()
    {
        $this->info('🛍️ Test du système de notification de commande');
        $this->line('');

        try {
            // 1. Utiliser un client existant
            $customer = Ecommerce_customer::first();
            if (!$customer) {
                $this->error('Aucun client trouvé dans la base');
                return;
            }

            $this->info("✅ Client créé/trouvé: {$customer->email}");

            // 2. Utiliser une commande existante
            $sell = Sell::latest()->first();
            if (!$sell) {
                $this->error('Aucune commande trouvée dans la base');
                return;
            }

            $this->info("✅ Commande utilisée: #{$sell->id}");

            // 3. Tester la création de notifications
            $this->info('📬 Test de création des notifications...');
            
            // Simuler la méthode du CartController
            $cartController = new CartController();
            $reflection = new \ReflectionClass($cartController);
            $method = $reflection->getMethod('createAdminNotification');
            $method->setAccessible(true);

            $orderWithRelations = Sell::with(['customer', 'sellDetails.product', 'paymentMethod'])->find($sell->id);
            $notificationCount = $method->invoke($cartController, $orderWithRelations);

            $this->info("✅ {$notificationCount} notifications créées");

            // 5. Vérifier les notifications
            $this->info('🔍 Vérification des notifications...');
            $notifications = CustomNotification::where('type', 'new_order')
                ->where('data', 'like', '%"order_id":' . $sell->id . '%')
                ->get();

            foreach ($notifications as $notification) {
                $user = User::find($notification->user_id);
                $this->line("- Notification pour {$user->email}: {$notification->title}");
            }

            $this->line('');
            $this->info('🎯 Test terminé avec succès !');
            $this->line("Commande créée: #{$sell->id}");
            $this->line("Notifications créées: {$notifications->count()}");

        } catch (\Exception $e) {
            $this->error('❌ Erreur: ' . $e->getMessage());
            $this->line('Stack trace: ' . $e->getTraceAsString());
        }
    }
}