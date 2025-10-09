<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\ContactMessage;
use App\Models\Newsletter;
use App\Models\Notification as CustomNotification;
use App\Http\Controllers\Frontend\ContactController;
use App\Http\Controllers\Frontend\NewsletterController;

class TestContactNewsletterNotifications extends Command
{
    protected $signature = 'test:contact-newsletter-notifications';
    protected $description = 'Test contact and newsletter notification systems';

    public function handle()
    {
        $this->info('📧 Test des notifications de contacts et newsletters');
        $this->line('');

        try {
            // Test 1: Notification de contact
            $this->info('1️⃣ Test des notifications de contact...');
            
            $contactMessage = ContactMessage::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'subject' => 'Message de test pour notifications',
                'message' => 'Ceci est un message de test pour vérifier le système de notifications.',
                'status' => ContactMessage::STATUS_NEW
            ]);

            $this->info("✅ Message de contact créé: #{$contactMessage->id}");

            // Simuler la méthode du ContactController
            $contactController = new ContactController();
            $reflection = new \ReflectionClass($contactController);
            $method = $reflection->getMethod('createContactNotification');
            $method->setAccessible(true);
            $contactNotificationCount = $method->invoke($contactController, $contactMessage);

            $this->info("✅ {$contactNotificationCount} notifications de contact créées");

            // Test 2: Notification de newsletter
            $this->info('');
            $this->info('2️⃣ Test des notifications de newsletter...');
            
            // Créer une inscription qui déclenche une notification (email d'entreprise)
            $newsletter = Newsletter::create([
                'email' => 'admin@company.com', // Domaine d'entreprise
                'subscribed_at' => now(),
            ]);

            $this->info("✅ Inscription newsletter créée: {$newsletter->email}");

            // Simuler la méthode du NewsletterController
            $newsletterController = new NewsletterController();
            $reflection = new \ReflectionClass($newsletterController);
            $method = $reflection->getMethod('createNewsletterNotification');
            $method->setAccessible(true);
            $newsletterNotificationCount = $method->invoke($newsletterController, $newsletter);

            $this->info("✅ {$newsletterNotificationCount} notifications de newsletter créées");

            // Vérification des notifications
            $this->info('');
            $this->info('🔍 Vérification des notifications...');
            
            $contactNotifications = CustomNotification::where('type', 'contact_message')
                ->where('data', 'like', '%"contact_id":' . $contactMessage->id . '%')
                ->get();

            $newsletterNotifications = CustomNotification::where('type', 'newsletter_subscription')
                ->where('data', 'like', '%"newsletter_id":' . $newsletter->id . '%')
                ->get();

            $this->line("- Notifications de contact créées: {$contactNotifications->count()}");
            $this->line("- Notifications de newsletter créées: {$newsletterNotifications->count()}");

            foreach ($contactNotifications as $notification) {
                $user = User::find($notification->user_id);
                $this->line("  → Contact pour {$user->email}: {$notification->title}");
            }

            foreach ($newsletterNotifications as $notification) {
                $user = User::find($notification->user_id);
                $this->line("  → Newsletter pour {$user->email}: {$notification->title}");
            }

            $this->line('');
            $this->info('🎯 Test terminé avec succès !');
            $this->line("Message de contact: #{$contactMessage->id}");
            $this->line("Inscription newsletter: {$newsletter->email}");
            $this->line("Total notifications créées: " . ($contactNotifications->count() + $newsletterNotifications->count()));

        } catch (\Exception $e) {
            $this->error('❌ Erreur: ' . $e->getMessage());
            $this->line('Stack trace: ' . $e->getTraceAsString());
        }
    }
}