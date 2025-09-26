<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Wishlist;

class TestWishlistRelation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:wishlist';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the wishlist relation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::first();
        
        if (!$user) {
            $this->error('Aucun utilisateur trouvé dans la base de données');
            return;
        }

        $this->info("Test de la relation wishlist pour l'utilisateur: {$user->name}");
        
        try {
            // Test de la méthode wishlistItems()
            $wishlistItems = $user->wishlistItems;
            $this->info("✅ Méthode wishlistItems() fonctionne");
            $this->info("Nombre d'éléments en wishlist: " . $wishlistItems->count());

            // Test de la méthode pluck
            $productIds = $user->wishlistItems()->pluck('product_id')->toArray();
            $this->info("✅ Méthode pluck() fonctionne");
            $this->info("IDs des produits: " . implode(', ', $productIds));

        } catch (\Exception $e) {
            $this->error("❌ Erreur: " . $e->getMessage());
        }
    }
}
