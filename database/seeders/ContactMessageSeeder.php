<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ContactMessage;
use App\Models\Newsletter;
use Carbon\Carbon;

class ContactMessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Messages de contact de test
        $contactMessages = [
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@email.com',
                'subject' => 'Question sur un produit',
                'message' => 'Bonjour, j\'aimerais avoir plus d\'informations sur le produit XYZ. Pourriez-vous me contacter ?',
                'status' => ContactMessage::STATUS_NEW,
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'name' => 'Marie Martin',
                'email' => 'marie.martin@email.com',
                'subject' => 'Problème de livraison',
                'message' => 'Ma commande n°12345 n\'a pas été livrée à temps. Pouvez-vous vérifier le statut ?',
                'status' => ContactMessage::STATUS_IN_PROGRESS,
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'name' => 'Pierre Durand',
                'email' => 'pierre.durand@email.com',
                'subject' => 'Retour produit',
                'message' => 'Je souhaite retourner un article acheté la semaine dernière. Comment procéder ?',
                'status' => ContactMessage::STATUS_RESOLVED,
                'created_at' => Carbon::now()->subWeek(),
            ],
            [
                'name' => 'Sophie Leroy',
                'email' => 'sophie.leroy@email.com',
                'subject' => 'Demande de devis',
                'message' => 'Bonjour, je représente une entreprise et j\'aimerais obtenir un devis pour une commande en gros.',
                'status' => ContactMessage::STATUS_NEW,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Thomas Bernard',
                'email' => 'thomas.bernard@email.com',
                'subject' => 'Félicitations',
                'message' => 'Excellent service client ! Je recommande votre boutique à tous mes amis.',
                'status' => ContactMessage::STATUS_RESOLVED,
                'created_at' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($contactMessages as $message) {
            ContactMessage::updateOrCreate(
                ['email' => $message['email'], 'subject' => $message['subject']],
                $message
            );
        }

        // Abonnements newsletter de test
        $newsletters = [
            ['email' => 'client1@email.com', 'subscribed_at' => Carbon::now()->subDays(10)],
            ['email' => 'client2@email.com', 'subscribed_at' => Carbon::now()->subDays(5)],
            ['email' => 'client3@email.com', 'subscribed_at' => Carbon::now()->subDays(3)],
            ['email' => 'client4@email.com', 'subscribed_at' => Carbon::now()->subDay()],
            ['email' => 'client5@email.com', 'subscribed_at' => Carbon::now()],
            ['email' => 'newsletter@test.com', 'subscribed_at' => Carbon::now()->subWeek()],
            ['email' => 'abonne@exemple.com', 'subscribed_at' => Carbon::now()->subMonth()],
        ];

        foreach ($newsletters as $newsletter) {
            Newsletter::updateOrCreate(
                ['email' => $newsletter['email']],
                $newsletter
            );
        }
    }
}
