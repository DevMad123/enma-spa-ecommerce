<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TaxRule;
use App\Services\AppSettingsService;

class MigrateTaxSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tax:migrate-settings {--force : Force migration même si des règles existent}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrer les anciens paramètres de TVA vers le nouveau système de règles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Migration des paramètres de TVA vers le nouveau système...');

        // Vérifier s'il y a déjà des règles
        $existingRules = TaxRule::count();
        if ($existingRules > 0 && !$this->option('force')) {
            $this->warn("⚠️ Il existe déjà {$existingRules} règles de TVA.");
            if (!$this->confirm('Voulez-vous continuer la migration ?')) {
                $this->info('Migration annulée.');
                return 0;
            }
        }

        $settingsService = new AppSettingsService();
        
        // Récupérer les anciens paramètres
        $oldTaxRate = $settingsService->get('tax_rate', 0.18);
        $defaultCountry = $settingsService->get('default_country_code', 'CI');
        $allowedCountries = $settingsService->get('allowed_shipping_countries', 'CI,FR,BE,CH,LU');
        
        $this->info("📊 Anciens paramètres détectés :");
        $this->line("   - Taux de TVA : " . ($oldTaxRate * 100) . "%");
        $this->line("   - Pays par défaut : {$defaultCountry}");
        $this->line("   - Pays autorisés : {$allowedCountries}");

        $countries = explode(',', $allowedCountries);
        $migrated = 0;
        $updated = 0;
        $errors = 0;

        $this->info("\n🚀 Début de la migration...");
        
        $progressBar = $this->output->createProgressBar(count($countries));
        $progressBar->start();

        foreach ($countries as $countryCode) {
            $countryCode = trim(strtoupper($countryCode));
            
            if (empty($countryCode) || strlen($countryCode) !== 2) {
                $this->newLine();
                $this->warn("⚠️ Code pays invalide ignoré : '{$countryCode}'");
                $errors++;
                $progressBar->advance();
                continue;
            }

            try {
                // Mapper les codes pays aux noms
                $countryNames = [
                    'CI' => 'Côte d\'Ivoire',
                    'FR' => 'France',
                    'BE' => 'Belgique',
                    'CH' => 'Suisse',
                    'LU' => 'Luxembourg',
                    'DE' => 'Allemagne',
                    'ES' => 'Espagne',
                    'IT' => 'Italie',
                    'SN' => 'Sénégal',
                    'MA' => 'Maroc',
                ];

                $countryName = $countryNames[$countryCode] ?? ucfirst(strtolower($countryCode));
                
                // Taux de TVA spécifiques par pays ou taux par défaut
                $taxRatesByCountry = [
                    'CI' => 0.00,  // Côte d'Ivoire - exempt
                    'FR' => 0.20,  // France - 20%
                    'BE' => 0.21,  // Belgique - 21%
                    'CH' => 0.077, // Suisse - 7.7%
                    'LU' => 0.17,  // Luxembourg - 17%
                    'DE' => 0.19,  // Allemagne - 19%
                    'ES' => 0.21,  // Espagne - 21%
                    'IT' => 0.22,  // Italie - 22%
                    'SN' => 0.18,  // Sénégal - 18%
                    'MA' => 0.20,  // Maroc - 20%
                ];

                $taxRate = $taxRatesByCountry[$countryCode] ?? $oldTaxRate;

                // Créer ou mettre à jour la règle
                $taxRule = TaxRule::updateOrCreate(
                    ['country_code' => $countryCode],
                    [
                        'country_name' => $countryName,
                        'tax_rate' => $taxRate * 100, // Convertir en pourcentage
                        'is_default' => $countryCode === $defaultCountry,
                        'delivery_allowed' => true,
                        'is_active' => true,
                        'min_order_amount' => $countryCode === 'CI' ? 0 : ($countryCode === 'FR' ? 30 : 50),
                        'notes' => "Migré depuis les anciens paramètres - Taux: " . ($taxRate * 100) . "%"
                    ]
                );

                if ($taxRule->wasRecentlyCreated) {
                    $migrated++;
                } else {
                    $updated++;
                }

            } catch (\Exception $e) {
                $this->newLine();
                $this->error("❌ Erreur lors de la migration de {$countryCode}: " . $e->getMessage());
                $errors++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Résumé de la migration
        $this->info("✅ Migration terminée !");
        $this->table(
            ['Statut', 'Nombre'],
            [
                ['Règles créées', $migrated],
                ['Règles mises à jour', $updated],
                ['Erreurs', $errors],
                ['Total traité', count($countries)]
            ]
        );

        // Vérifier le pays par défaut
        $defaultRule = TaxRule::where('is_default', true)->first();
        if ($defaultRule) {
            $this->info("🏠 Pays par défaut : {$defaultRule->country_name} ({$defaultRule->country_code})");
        } else {
            $this->warn("⚠️ Aucun pays par défaut défini !");
        }

        // Recommandations
        $this->info("\n📋 Prochaines étapes recommandées :");
        $this->line("   1. Vérifiez les règles créées via l'admin : /admin/tax-rules");
        $this->line("   2. Ajustez les taux de TVA si nécessaire");
        $this->line("   3. Configurez les montants minimums de commande");
        $this->line("   4. Testez le calcul de TVA sur le front-end");
        
        if ($errors === 0) {
            $this->info("\n🎉 Migration réussie sans erreur !");
            return 0;
        } else {
            $this->warn("\n⚠️ Migration terminée avec {$errors} erreur(s). Vérifiez les logs ci-dessus.");
            return 1;
        }
    }
}
