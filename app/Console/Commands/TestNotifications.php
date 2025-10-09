<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Sell;
use App\Notifications\NewOrderNotification;
use App\Services\AppSettingsService;

class TestNotifications extends Command
{
    protected $signature = 'test:notifications {--order-id=}';
    protected $description = 'Test the notification system';

    public function handle()
    {
        $this->info('🔔 Test du système de notifications');
        $this->line('');

        // Vérification des paramètres email
        $settingsService = app(AppSettingsService::class);
        $emailSettings = $settingsService->getEmailSettings();
        
        $this->info('📧 Paramètres Email:');
        $this->line("- Admin Email: {$emailSettings['admin_email']}");
        $this->line("- From Address: {$emailSettings['from_address']}");
        $this->line("- From Name: {$emailSettings['from_name']}");
        $this->line('');

        // Recherche des admins
        $admins = User::whereHas('roles', function($query) {
            $query->whereIn('name', ['Admin', 'Manager']);
        })->get();

        $this->info('👥 Administrateurs trouvés:');
        foreach ($admins as $admin) {
            $roles = $admin->roles->pluck('name')->implode(', ');
            $this->line("- {$admin->email} ({$roles})");
        }
        $this->line('');

        // Test avec une commande existante ou créer une commande de test
        $sellId = $this->option('order-id');
        
        if ($sellId) {
            $sell = Sell::find($sellId);
            if (!$sell) {
                $this->error("Commande #{$sellId} introuvable");
                return;
            }
        } else {
            // Utiliser une commande existante
            $sell = Sell::latest()->first();
            if (!$sell) {
                $this->error('Aucune commande trouvée dans la base');
                return;
            }
            $this->info("Utilisation de la commande existante: #{$sell->id}");
        }

        // Test des notifications
        $this->info('📬 Envoi des notifications de test...');
        
        try {
            // Notifications admin seulement (pas de notification client pour le moment)
            foreach ($admins as $admin) {
                $admin->notify(new NewOrderNotification($sell));
            }
            $this->info("✅ Notifications admin envoyées ({$admins->count()} destinataires)");
            
        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de l\'envoi: ' . $e->getMessage());
            $this->line('Stack trace: ' . $e->getTraceAsString());
        }

        $this->line('');
        $this->info('🎯 Test terminé ! Vérifiez la table notifications pour voir les résultats.');
    }
}