<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Models\User;
use App\Models\Notification as CustomNotification;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Log;

class ContactController extends Controller
{
    /**
     * Afficher la page de contact
     */
    public function index()
    {
        return Inertia::render('Frontend/Contact');
    }

    /**
     * Traiter l'envoi du formulaire de contact
     */
    public function store(StoreContactMessageRequest $request)
    {
        try {
            // Créer le message en base de données
            $contactMessage = ContactMessage::create($request->validated());

            // Créer les notifications admin
            $this->createContactNotification($contactMessage);

            // Log pour traçabilité
            Log::info('Nouveau message de contact reçu', [
                'id' => $contactMessage->id,
                'email' => $contactMessage->email,
                'subject' => $contactMessage->subject
            ]);

            // Optionnel : Envoyer un email de notification aux admins
            /*
            Mail::send('emails.new-contact-message', compact('contactMessage'), function ($message) {
                $message->to(config('mail.admin_email', 'admin@enma-spa.com'))
                        ->subject('Nouveau message de contact - ' . $contactMessage->subject);
            });
            */

            return redirect()->back()->with('success', 
                'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
            );

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la sauvegarde du message de contact: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 
                'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
            )->withInput();
        }
    }

    /**
     * Créer une notification personnalisée pour les admins lors d'un nouveau contact
     */
    private function createContactNotification($contactMessage)
    {
        // Créer une notification dans la table personnalisée pour chaque admin
        $adminUsers = User::whereHas('roles', function($query) {
            $query->whereIn('name', ['Admin', 'Manager']);
        })->get();

        foreach ($adminUsers as $admin) {
            CustomNotification::create([
                'type' => 'contact_message',
                'title' => 'Nouveau message de contact',
                'message' => $contactMessage->name . ' a envoyé un message : "' . $contactMessage->subject . '"',
                'data' => json_encode([
                    'contact_id' => $contactMessage->id,
                    'sender_name' => $contactMessage->name,
                    'sender_email' => $contactMessage->email,
                    'subject' => $contactMessage->subject,
                    'message_preview' => substr($contactMessage->message, 0, 100) . (strlen($contactMessage->message) > 100 ? '...' : ''),
                    'created_at' => $contactMessage->created_at
                ]),
                'user_id' => $admin->id,
                'action_url' => '/admin/contacts/' . $contactMessage->id,
                'icon' => 'mail',
                'color' => 'blue'
            ]);
        }

        Log::info('Contact notifications created for ' . $adminUsers->count() . ' users');
        return $adminUsers->count();
    }
}
