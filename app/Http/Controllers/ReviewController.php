<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
        ]);

        // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
        $existingReview = ProductReview::where('user_id', Auth::id())
                                      ->where('product_id', $request->product_id)
                                      ->first();

        if ($existingReview) {
            return back()->withErrors(['message' => 'Vous avez déjà laissé un avis pour ce produit.']);
        }

        try {
            ProductReview::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_approved' => true, // Auto-approuver ou false selon votre logique
            ]);

            return back()->with('success', 'Votre avis a été ajouté avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Erreur lors de l\'ajout de l\'avis : ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified review in storage.
     */
    public function update(Request $request, ProductReview $review)
    {
        // Vérifier que l'utilisateur est le propriétaire de l'avis
        if ($review->user_id !== Auth::id()) {
            return back()->withErrors(['message' => 'Vous n\'avez pas l\'autorisation de modifier cet avis.']);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
        ]);

        try {
            $review->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            return back()->with('success', 'Votre avis a été modifié avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Erreur lors de la modification de l\'avis : ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified review from storage.
     */
    public function destroy(ProductReview $review)
    {
        // Vérifier que l'utilisateur est le propriétaire de l'avis
        if ($review->user_id !== Auth::id()) {
            return back()->withErrors(['message' => 'Vous n\'avez pas l\'autorisation de supprimer cet avis.']);
        }

        try {
            $review->delete();
            
            return back()->with('success', 'Votre avis a été supprimé avec succès !');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Erreur lors de la suppression de l\'avis : ' . $e->getMessage()]);
        }
    }

    /**
     * Mark a review as helpful.
     */
    public function markHelpful(ProductReview $review)
    {
        // Cette fonctionnalité peut être implémentée avec une table pivot
        // ou un simple compteur selon vos besoins
        
        return back()->with('success', 'Merci pour votre retour !');
    }

    /**
     * Report a review.
     */
    public function report(Request $request, ProductReview $review)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        // Logique de signalement (enregistrer en base, envoyer email admin, etc.)
        
        return back()->with('success', 'L\'avis a été signalé. Merci pour votre vigilance !');
    }
}
