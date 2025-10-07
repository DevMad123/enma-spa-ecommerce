<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Général
            [
                'key' => 'site_name',
                'value' => 'ENMA E-commerce',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Nom du site',
                'description' => 'Nom du site affiché dans l\'en-tête'
            ],
            [
                'key' => 'site_description',
                'value' => 'Site e-commerce moderne et performant',
                'type' => 'textarea',
                'group' => 'general',
                'label' => 'Description du site',
                'description' => 'Description du site pour le SEO'
            ],
            [
                'key' => 'site_email',
                'value' => 'contact@enma-ecommerce.com',
                'type' => 'email',
                'group' => 'general',
                'label' => 'Email de contact',
                'description' => 'Adresse email principale de contact'
            ],
            [
                'key' => 'site_phone',
                'value' => '+33 1 23 45 67 89',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Téléphone',
                'description' => 'Numéro de téléphone de contact'
            ],
            [
                'key' => 'default_currency',
                'value' => 'EUR',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Devise par défaut',
                'description' => 'Code de la devise utilisée (EUR, USD, etc.)'
            ],
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Mode maintenance',
                'description' => 'Activer/désactiver le mode maintenance'
            ],

            // Apparence
            [
                'key' => 'primary_color',
                'value' => '#007bff',
                'type' => 'color',
                'group' => 'appearance',
                'label' => 'Couleur principale',
                'description' => 'Couleur principale du thème'
            ],
            [
                'key' => 'secondary_color',
                'value' => '#6c757d',
                'type' => 'color',
                'group' => 'appearance',
                'label' => 'Couleur secondaire',
                'description' => 'Couleur secondaire du thème'
            ],
            [
                'key' => 'logo',
                'value' => '',
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Logo',
                'description' => 'Logo du site (formats: PNG, JPG, SVG)'
            ],
            [
                'key' => 'favicon',
                'value' => '',
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Favicon',
                'description' => 'Icône du site affichée dans l\'onglet du navigateur'
            ],
            [
                'key' => 'hero_background',
                'value' => '',
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Image hero',
                'description' => 'Image de fond de la section hero de la page d\'accueil'
            ],
            [
                'key' => 'hero_banner',
                'value' => '',
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Bannière hero',
                'description' => 'Bannière principale affichée en haut de la page d\'accueil'
            ],
            [
                'key' => 'promo_banner',
                'value' => '',
                'type' => 'file',
                'group' => 'appearance',
                'label' => 'Bannière promo',
                'description' => 'Bannière promotionnelle pour les offres spéciales'
            ],
            [
                'key' => 'show_popular_products',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Produits populaires',
                'description' => 'Afficher la section des produits populaires'
            ],
            [
                'key' => 'show_promotions',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Promotions',
                'description' => 'Afficher la section des promotions'
            ],
            [
                'key' => 'show_new_arrivals',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Nouveautés',
                'description' => 'Afficher la section des nouveautés'
            ],
            [
                'key' => 'show_categories',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'appearance',
                'label' => 'Catégories',
                'description' => 'Afficher la section des catégories'
            ],
            [
                'key' => 'theme_mode',
                'value' => 'light',
                'type' => 'select',
                'group' => 'appearance',
                'label' => 'Mode du thème',
                'description' => 'Mode d\'affichage (clair/sombre)'
            ],

            // E-commerce
            [
                'key' => 'products_per_page',
                'value' => '12',
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Produits par page',
                'description' => 'Nombre de produits affichés par page dans la boutique'
            ],
            [
                'key' => 'enable_reviews',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ecommerce',
                'label' => 'Avis clients',
                'description' => 'Permettre aux clients de laisser des avis'
            ],
            [
                'key' => 'enable_wishlist',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ecommerce',
                'label' => 'Liste de souhaits',
                'description' => 'Activer la fonctionnalité de liste de souhaits'
            ],
            [
                'key' => 'enable_compare',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ecommerce',
                'label' => 'Comparaison',
                'description' => 'Activer la comparaison de produits'
            ],
            [
                'key' => 'shipping_cost',
                'value' => '5.99',
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Frais de livraison',
                'description' => 'Coût de livraison par défaut (en euros)'
            ],
            [
                'key' => 'free_shipping_threshold',
                'value' => '50.00',
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Seuil livraison gratuite',
                'description' => 'Montant minimum pour la livraison gratuite'
            ],
            [
                'key' => 'tax_rate',
                'value' => '20.00',
                'type' => 'number',
                'group' => 'ecommerce',
                'label' => 'Taux de TVA',
                'description' => 'Taux de TVA en pourcentage'
            ],
            [
                'key' => 'payment_methods',
                'value' => json_encode(['stripe', 'paypal', 'bank_transfer']),
                'type' => 'json',
                'group' => 'ecommerce',
                'label' => 'Méthodes de paiement',
                'description' => 'Méthodes de paiement activées sur le site'
            ],
            [
                'key' => 'allow_guest_checkout',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'ecommerce',
                'label' => 'Commande invité',
                'description' => 'Permettre aux visiteurs de commander sans créer de compte'
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}