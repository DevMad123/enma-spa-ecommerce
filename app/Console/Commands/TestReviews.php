<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;

class TestReviews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:reviews';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the reviews relation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Test des relations Reviews...');
        
        try {
            // Test 1: Vérifier les produits
            $product = Product::first();
            if (!$product) {
                $this->error('❌ Aucun produit trouvé');
                return;
            }
            $this->info("✅ Produit trouvé: {$product->name}");

            // Test 2: Vérifier les reviews avec relation user
            $reviews = ProductReview::with('user')->where('product_id', $product->id)->get();
            $this->info("✅ Nombre de reviews: " . $reviews->count());

            // Test 3: Tester l'accès aux données utilisateur
            if ($reviews->count() > 0) {
                $firstReview = $reviews->first();
                $this->info("✅ Premier avis - Rating: {$firstReview->rating}");
                if ($firstReview->user) {
                    $this->info("✅ Utilisateur: {$firstReview->user->name}");
                } else {
                    $this->warn("⚠️  Utilisateur non trouvé pour cet avis");
                }
            }

            // Test 4: Vérifier les colonnes is_approved
            $approvedReviews = ProductReview::where('is_approved', true)->count();
            $this->info("✅ Reviews approuvés: {$approvedReviews}");

            $this->info('🎉 Tous les tests passés !');

        } catch (\Exception $e) {
            $this->error("❌ Erreur: " . $e->getMessage());
            $this->error("📍 Ligne: " . $e->getLine());
        }
    }
}
