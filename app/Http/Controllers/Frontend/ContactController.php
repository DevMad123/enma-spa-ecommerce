<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

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

            // Log pour traçabilité
            \Log::info('Nouveau message de contact reçu', [
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
}
