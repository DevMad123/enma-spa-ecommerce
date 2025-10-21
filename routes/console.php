<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use App\Models\Product;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Commande d'initialisation: migrations + seed si nécessaire
Artisan::command('app:init', function () {
    $this->info('[app:init] Exécution des migrations...');
    Artisan::call('migrate', ['--force' => true]);
    $this->line(trim(Artisan::output()));

    $forceSeed = filter_var((string) env('SEED_ON_BOOT', false), FILTER_VALIDATE_BOOLEAN);
    if ($forceSeed) {
        $this->warn('[app:init] SEED_ON_BOOT=true: exécution forcée des seeders...');
        Artisan::call('db:seed', ['--force' => true]);
        $this->line(trim(Artisan::output()));
        return 0;
    }

    try {
        if (!Schema::hasTable('users')) {
            $this->warn('[app:init] Table users absente après migration, seed ignoré.');
            return 0;
        }
    } catch (\Throwable $e) {
        $this->error('[app:init] Échec vérification du schéma: '.$e->getMessage());
        return 1;
    }

    $count = \App\Models\User::count();
    if ($count === 0) {
        $this->info('[app:init] Aucune entrée dans users, lancement des seeders...');
        Artisan::call('db:seed', ['--force' => true]);
        $this->line(trim(Artisan::output()));
    } else {
        $this->info('[app:init] Utilisateurs existants: '.$count.'. Seed ignoré.');
    }

    return 0;
})->purpose('Préparer la base (migrate + seed si vide)');

// Recalcul global des prix/stock des produits variables
Artisan::command('recalc:variable-prices {--dry-run}', function () {
    $dryRun = (bool) $this->option('dry-run');
    $this->info('Recalcul des prix pour les produits variables' . ($dryRun ? ' (dry-run)' : ''));

    $count = 0;
    $updated = 0;
    Product::query()
        ->where('type', 'variable')
        ->with(['variants', 'attributes'])
        ->chunkById(200, function ($products) use (&$count, &$updated, $dryRun) {
            foreach ($products as $product) {
                $count++;
                $minVariantPrice = $product->variants->min('sale_price');
                $sumVariantQty   = $product->variants->sum('available_quantity');
                $minAttrPrice    = $product->attributes->min('price');

                $candidates = array_values(array_filter([
                    $minVariantPrice,
                    $minAttrPrice,
                ], function ($v) {
                    return $v !== null && $v !== '' && $v >= 0;
                }));
                $newPrice = !empty($candidates) ? min($candidates) : 0;

                $newQty = $sumVariantQty ?: (int) $product->attributes->sum('stock');

                $dirty = ((float)$product->current_sale_price !== (float)$newPrice) || ((int)$product->available_quantity !== (int)$newQty);
                if ($dirty) {
                    $updated++;
                    $this->line("#{$product->id} price {$product->current_sale_price} -> {$newPrice} | qty {$product->available_quantity} -> {$newQty}");
                    if (!$dryRun) {
                        $product->update([
                            'current_sale_price' => $newPrice,
                            'available_quantity' => $newQty,
                        ]);
                    }
                }
            }
        });

    $this->info("Traité {$count} produits variables. {$updated} mis à jour.");
})->purpose('Recalculer current_sale_price et le stock agrégé des produits variables');
