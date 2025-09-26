<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsletterRequest;
use App\Models\Newsletter;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(StoreNewsletterRequest $request)
    {
        try {
            Newsletter::create([
                'email' => $request->email,
                'subscribed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Merci ! Votre inscription à la newsletter a été confirmée.',
            ]);

        } catch (\Exception $e) {
            // Si l'email existe déjà (contrainte unique)
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet email est déjà inscrit à notre newsletter.',
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue. Veuillez réessayer.',
            ], 500);
        }
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:newsletters,email',
        ], [
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.exists' => 'Cette adresse email n\'est pas inscrite à la newsletter.',
        ]);

        Newsletter::where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Votre désinscription a été prise en compte avec succès.',
        ]);
    }

    /**
     * Check if email is subscribed
     */
    public function checkSubscription(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $isSubscribed = Newsletter::where('email', $request->email)->exists();

        return response()->json([
            'subscribed' => $isSubscribed,
        ]);
    }
}
