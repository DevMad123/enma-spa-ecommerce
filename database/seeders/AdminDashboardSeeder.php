<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\Setting;

class AdminDashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer quelques notifications de test
        $notifications = [
            [
                'type' => 'contact_message',
                'title' => 'Nouveau message de contact',
                'message' => 'Marie Dupont a envoyé un message via le formulaire de contact.',
                'data' => json_encode(['contact_id' => 1, 'sender' => 'Marie Dupont']),
                'action_url' => '/admin/contacts/1',
                'icon' => 'mail',
                'color' => 'blue',
                'read_at' => null,
                'created_at' => now()->subMinutes(15),
                'updated_at' => now()->subMinutes(15),
            ],
            [
                'type' => 'new_order',
                'title' => 'Nouvelle commande',
                'message' => 'Commande #1001 passée par Jean Martin pour 125,99 €.',
                'data' => json_encode(['order_id' => 1001, 'customer' => 'Jean Martin', 'amount' => 125.99]),
                'action_url' => '/admin/orders/1001',
                'icon' => 'shopping-cart',
                'color' => 'green',
                'read_at' => null,
                'created_at' => now()->subHour(),
                'updated_at' => now()->subHour(),
            ],
            [
                'type' => 'new_user',
                'title' => 'Nouvel utilisateur',
                'message' => 'Sophie Bernard vient de créer un compte.',
                'data' => json_encode(['user_id' => 15, 'username' => 'Sophie Bernard']),
                'action_url' => '/admin/users/15',
                'icon' => 'user-plus',
                'color' => 'purple',
                'read_at' => now()->subMinutes(30),
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subMinutes(30),
            ],
            [
                'type' => 'contact_message',
                'title' => 'Message de support',
                'message' => 'Pierre Lambert a signalé un problème technique.',
                'data' => json_encode(['contact_id' => 2, 'sender' => 'Pierre Lambert', 'priority' => 'high']),
                'action_url' => '/admin/contacts/2',
                'icon' => 'mail',
                'color' => 'blue',
                'read_at' => now()->subMinutes(5),
                'created_at' => now()->subHours(3),
                'updated_at' => now()->subMinutes(5),
            ],
            [
                'type' => 'new_order',
                'title' => 'Commande importante',
                'message' => 'Commande #1002 d\'une valeur de 450,00 € en attente de validation.',
                'data' => json_encode(['order_id' => 1002, 'customer' => 'Entreprise ABC', 'amount' => 450.00]),
                'action_url' => '/admin/orders/1002',
                'icon' => 'shopping-cart',
                'color' => 'green',
                'read_at' => null,
                'created_at' => now()->subHours(6),
                'updated_at' => now()->subHours(6),
            ],
        ];

        foreach ($notifications as $notification) {
            Notification::updateOrCreate(
                ['type' => $notification['type'], 'title' => $notification['title']],
                $notification
            );
        }

        // Créer des paramètres par défaut
        $settings = [
            // Paramètres généraux
            [
                'group' => 'general',
                'key' => 'site_name',
                'label' => 'Nom du site',
                'value' => 'ENMA SPA E-commerce',
                'type' => 'string',
                'description' => 'Nom du site web',
            ],
            [
                'group' => 'general',
                'key' => 'site_description',
                'label' => 'Description du site',
                'value' => 'Votre boutique en ligne de confiance pour tous vos besoins',
                'type' => 'text',
                'description' => 'Description du site web',
            ],
            [
                'group' => 'general',
                'key' => 'contact_email',
                'label' => 'Email de contact',
                'value' => 'contact@enmaspa.com',
                'type' => 'email',
                'description' => 'Email de contact principal',
            ],
            [
                'group' => 'general',
                'key' => 'phone',
                'label' => 'Téléphone',
                'value' => '+225 21 23 45 67 89',
                'type' => 'string',
                'description' => 'Numéro de téléphone',
            ],
            [
                'group' => 'general',
                'key' => 'address',
                'label' => 'Adresse',
                'value' => '123 Rue de la République, 75001 Abidjan, Côte d\'Ivoire',
                'type' => 'text',
                'description' => 'Adresse physique',
            ],

            // Paramètres d'apparence
            [
                'group' => 'appearance',
                'key' => 'logo',
                'label' => 'Logo',
                'value' => '',
                'type' => 'file',
                'description' => 'Logo du site',
            ],
            [
                'group' => 'appearance',
                'key' => 'banner_home',
                'label' => 'Bannière d\'accueil',
                'value' => '',
                'type' => 'file',
                'description' => 'Bannière de la page d\'accueil',
            ],
            [
                'group' => 'appearance',
                'key' => 'primary_color',
                'label' => 'Couleur principale',
                'value' => '#3B82F6',
                'type' => 'color',
                'description' => 'Couleur principale du thème',
            ],
            [
                'group' => 'appearance',
                'key' => 'secondary_color',
                'label' => 'Couleur secondaire',
                'value' => '#64748B',
                'type' => 'color',
                'description' => 'Couleur secondaire du thème',
            ],

            // Paramètres e-commerce
            [
                'group' => 'ecommerce',
                'key' => 'currency',
                'label' => 'Devise',
                'value' => 'EUR',
                'type' => 'select',
                'description' => 'Devise par défaut',
            ],
            [
                'group' => 'ecommerce',
                'key' => 'currency_symbol',
                'label' => 'Symbole de devise',
                'value' => '€',
                'type' => 'string',
                'description' => 'Symbole de la devise',
            ],
            [
                'group' => 'ecommerce',
                'key' => 'tax_rate',
                'label' => 'Taux de TVA',
                'value' => '20.00',
                'type' => 'number',
                'description' => 'Taux de TVA (%)',
            ],
            [
                'group' => 'ecommerce',
                'key' => 'shipping_cost',
                'label' => 'Coût de livraison',
                'value' => '5.99',
                'type' => 'number',
                'description' => 'Coût de livraison standard',
            ],
            [
                'group' => 'ecommerce',
                'key' => 'free_shipping_threshold',
                'label' => 'Seuil livraison gratuite',
                'value' => '50.00',
                'type' => 'number',
                'description' => 'Montant minimum pour la livraison gratuite',
            ],
            [
                'group' => 'ecommerce',
                'key' => 'enable_reviews',
                'label' => 'Activer les avis',
                'value' => '1',
                'type' => 'boolean',
                'description' => 'Activer les avis clients',
            ],
            [
                'group' => 'ecommerce',
                'key' => 'enable_wishlist',
                'label' => 'Activer liste de souhaits',
                'value' => '1',
                'type' => 'boolean',
                'description' => 'Activer la liste de souhaits',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Données de test créées avec succès !');
        $this->command->info('📧 5 notifications de test ajoutées');
        $this->command->info('⚙️ 17 paramètres par défaut configurés');
    }
}
