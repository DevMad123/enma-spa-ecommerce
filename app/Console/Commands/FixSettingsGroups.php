<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Setting;

class FixSettingsGroups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'settings:fix-groups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Corriger les groupes et types des paramètres';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔧 Correction des groupes et types des paramètres...');
        
        // Mappings de corrections
        $corrections = [
            // Paramètres qui doivent être dans le groupe 'appearance'
            'hero_banner' => ['group' => 'appearance', 'type' => 'file'],
            'promo_banner' => ['group' => 'appearance', 'type' => 'file'],
            'show_popular_products' => ['group' => 'appearance', 'type' => 'boolean'],
            'show_promotions' => ['group' => 'appearance', 'type' => 'boolean'],
            'show_new_arrivals' => ['group' => 'appearance', 'type' => 'boolean'],
            'show_categories' => ['group' => 'appearance', 'type' => 'boolean'],
            
            // Paramètres qui doivent être dans le groupe 'ecommerce'
            'shipping_cost' => ['group' => 'ecommerce', 'type' => 'number'],
            'free_shipping_threshold' => ['group' => 'ecommerce', 'type' => 'number'],
            'tax_rate' => ['group' => 'ecommerce', 'type' => 'number'],
            'allow_guest_checkout' => ['group' => 'ecommerce', 'type' => 'boolean'],
            
            // Corrections de types pour le groupe général
            'maintenance_mode' => ['group' => 'general', 'type' => 'boolean'],
            'site_email' => ['group' => 'general', 'type' => 'email'],
            'contact_email' => ['group' => 'general', 'type' => 'email'],
        ];
        
        $corrected = 0;
        
        foreach ($corrections as $key => $changes) {
            $setting = Setting::where('key', $key)->first();
            
            if ($setting) {
                $updated = false;
                
                if ($setting->group !== $changes['group']) {
                    $this->line("📝 {$key}: {$setting->group} → {$changes['group']}");
                    $setting->group = $changes['group'];
                    $updated = true;
                }
                
                if ($setting->type !== $changes['type']) {
                    $this->line("🔧 {$key}: type {$setting->type} → {$changes['type']}");
                    $setting->type = $changes['type'];
                    $updated = true;
                }
                
                // Corriger les valeurs booléennes
                if ($changes['type'] === 'boolean' && !in_array($setting->value, ['0', '1', 0, 1, true, false])) {
                    $boolValue = in_array(strtolower($setting->value), ['true', '1', 'yes', 'on']) ? '1' : '0';
                    $this->line("✅ {$key}: valeur {$setting->value} → {$boolValue}");
                    $setting->value = $boolValue;
                    $updated = true;
                }
                
                if ($updated) {
                    $setting->save();
                    $corrected++;
                }
            } else {
                $this->warn("⚠️  Paramètre non trouvé: {$key}");
            }
        }
        
        // Supprimer les doublons
        $this->info('🗑️  Suppression des doublons...');
        $duplicates = Setting::select('key')
            ->groupBy('key')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('key');
            
        foreach ($duplicates as $key) {
            $settings = Setting::where('key', $key)->orderBy('id')->get();
            $keep = $settings->first();
            
            for ($i = 1; $i < $settings->count(); $i++) {
                $this->line("🗑️  Suppression doublon: {$key} (ID: {$settings[$i]->id})");
                $settings[$i]->delete();
            }
        }
        
        $this->info("✅ Correction terminée! {$corrected} paramètres corrigés.");
        
        // Afficher un résumé
        $this->table(
            ['Groupe', 'Nombre de paramètres'],
            [
                ['general', Setting::where('group', 'general')->count()],
                ['appearance', Setting::where('group', 'appearance')->count()],
                ['ecommerce', Setting::where('group', 'ecommerce')->count()],
            ]
        );
        
        return 0;
    }
}
