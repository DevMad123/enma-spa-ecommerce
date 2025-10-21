<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;

class RecalculateVariableProductPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recalc:variable-prices {--dry-run : Do not persist changes, only show what would change}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate current_sale_price and available_quantity for all variable products based on their variants/attributes';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info('Recalculating prices for variable products' . ($dryRun ? ' (dry-run)' : ''));

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

                    $minAttrPrice = $product->attributes->min('price');
                    // Choose the minimal non-null, non-zero price between variants and attributes
                    $candidates = array_values(array_filter([
                        $minVariantPrice,
                        $minAttrPrice,
                    ], function ($v) {
                        return $v !== null && $v !== '' && $v >= 0;
                    }));

                    $newPrice = !empty($candidates) ? min($candidates) : 0;

                    // If variants have no qty and attributes exist with stock, use that as available quantity
                    $newQty = $sumVariantQty;
                    if ($newQty === null || $newQty === 0) {
                        $newQty = (int) $product->attributes->sum('stock');
                    }

                    $dirty = (
                        (float) $product->current_sale_price !== (float) $newPrice ||
                        (int) $product->available_quantity !== (int) $newQty
                    );

                    if ($dirty) {
                        $updated++;
                        $this->line(sprintf(
                            'Product #%d: price %s -> %s | qty %s -> %s',
                            $product->id,
                            (string) $product->current_sale_price,
                            (string) $newPrice,
                            (string) $product->available_quantity,
                            (string) $newQty
                        ));

                        if (!$dryRun) {
                            $product->update([
                                'current_sale_price' => $newPrice,
                                'available_quantity' => $newQty,
                            ]);
                        }
                    }
                }
            });

        $this->info(sprintf('Processed %d variable products. %d updated.', $count, $updated));
        return Command::SUCCESS;
    }
}

