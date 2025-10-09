<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsletterRequest;
use App\Models\Newsletter;
use App\Models\User;
use App\Models\Notification as CustomNotification;
use Illuminate\Http\Request;
use Log;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(StoreNewsletterRequest $request)
    {
        try {
            $newsletter = Newsletter::create([
                'email' => $request->email,
                'subscribed_at' => now(),
            ]);

            // Créer les notifications admin pour les nouvelles inscriptions
            $this->createNewsletterNotification($newsletter);

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

    /**
     * Créer une notification personnalisée pour les admins lors d'une nouvelle inscription newsletter
     */
    private function createNewsletterNotification($newsletter)
    {
        // Ne créer des notifications que pour les nouvelles inscriptions importantes
        // (par exemple, tous les 10 inscriptions ou pour les domaines d'entreprise)
        $shouldNotify = $this->shouldNotifyForNewsletter($newsletter);
        
        if (!$shouldNotify) {
            return 0;
        }

        // Créer une notification dans la table personnalisée pour chaque admin
        $adminUsers = User::whereHas('roles', function($query) {
            $query->whereIn('name', ['Admin', 'Manager']);
        })->get();

        foreach ($adminUsers as $admin) {
            CustomNotification::create([
                'type' => 'newsletter_subscription',
                'title' => 'Nouvelle inscription newsletter',
                'message' => 'Nouvelle inscription à la newsletter : ' . $newsletter->email,
                'data' => json_encode([
                    'newsletter_id' => $newsletter->id,
                    'email' => $newsletter->email,
                    'subscribed_at' => $newsletter->subscribed_at,
                    'total_subscribers' => Newsletter::count()
                ]),
                'user_id' => $admin->id,
                'action_url' => '/admin/newsletters',
                'icon' => 'mail',
                'color' => 'green'
            ]);
        }

        Log::info('Newsletter notifications created for ' . $adminUsers->count() . ' users');
        return $adminUsers->count();
    }

    /**
     * Déterminer si on doit notifier pour cette inscription newsletter
     */
    private function shouldNotifyForNewsletter($newsletter)
    {
        // Critères pour déclencher une notification :
        
        // 1. Domaines d'entreprise (considérés comme plus importants)
        $businessDomains = ['@company.com', '@enterprise.com', '@business.com', '@corp.com'];
        foreach ($businessDomains as $domain) {
            if (str_contains($newsletter->email, $domain)) {
                return true;
            }
        }

        // 2. Tous les 10 nouveaux abonnés
        $subscriberCount = Newsletter::count();
        if ($subscriberCount % 10 === 0) {
            return true;
        }

        // 3. Première inscription de la journée
        $todayCount = Newsletter::whereDate('subscribed_at', today())->count();
        if ($todayCount === 1) {
            return true;
        }

        return false; // Ne pas notifier pour les inscriptions ordinaires
    }
}
