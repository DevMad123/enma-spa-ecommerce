<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
    public function store(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'Veuillez saisir une adresse email valide.',
            'email.max' => 'L\'email ne doit pas dépasser 255 caractères.',
            'phone.max' => 'Le téléphone ne doit pas dépasser 20 caractères.',
            'subject.required' => 'Le sujet est obligatoire.',
            'subject.max' => 'Le sujet ne doit pas dépasser 255 caractères.',
            'message.required' => 'Le message est obligatoire.',
            'message.max' => 'Le message ne doit pas dépasser 5000 caractères.',
        ]);

        try {
            // Envoyer l'email (optionnel - nécessite la configuration mail)
            /*
            Mail::send('emails.contact', $validated, function ($message) use ($validated) {
                $message->to('contact@enma-spa.com')
                        ->subject('Nouveau message de contact - ' . $validated['subject'])
                        ->replyTo($validated['email'], $validated['name']);
            });
            */

            // Pour le moment, on peut log le message ou l'enregistrer en base
            \Log::info('Nouveau message de contact reçu', $validated);

            return redirect()->back()->with('success', 
                'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
            );

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi du message de contact: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 
                'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer ou nous contacter directement.'
            )->withInput();
        }
    }
}
