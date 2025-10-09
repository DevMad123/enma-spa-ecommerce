<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Services\AppSettingsService;
use Illuminate\Console\Command;

class SetupEmailSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-email-settings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configurer les paramètres email depuis la table settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Configuration des paramètres email...');

        $emailSettings = [
            [
                'key' => 'admin_email',
                'value' => 'admin@enmaspa.com',
                'type' => 'string',
                'group' => 'email',
                'label' => 'Email Admin',
                'description' => 'Email de l\'administrateur pour les notifications'
            ],
            [
                'key' => 'mail_from_address',
                'value' => 'noreply@enmaspa.com',
                'type' => 'string',
                'group' => 'email',
                'label' => 'Email expéditeur',
                'description' => 'Adresse email utilisée pour envoyer les emails'
            ],
            [
                'key' => 'mail_from_name',
                'value' => AppSettingsService::get('site_name', 'ENMA Store'),
                'type' => 'string',
                'group' => 'email',
                'label' => 'Nom expéditeur',
                'description' => 'Nom affiché comme expéditeur des emails'
            ],
            [
                'key' => 'noreply_email',
                'value' => 'noreply@enmaspa.com',
                'type' => 'string',
                'group' => 'email',
                'label' => 'Email no-reply',
                'description' => 'Email no-reply pour les notifications automatiques'
            ]
        ];

        $created = 0;
        $updated = 0;

        foreach ($emailSettings as $settingData) {
            $setting = Setting::where('key', $settingData['key'])->first();
            
            if ($setting) {
                $this->line("✓ Paramètre '{$settingData['key']}' existe déjà: {$setting->value}");
                $updated++;
            } else {
                Setting::create($settingData);
                $this->info("✓ Paramètre '{$settingData['key']}' créé: {$settingData['value']}");
                $created++;
            }
        }

        // Vider le cache des settings
        AppSettingsService::clearCache();

        $this->info("\n📧 Configuration terminée !");
        $this->info("✓ {$created} paramètres créés");
        $this->info("✓ {$updated} paramètres existants");
        
        $this->info("\n📋 Paramètres email actuels :");
        $emailConfig = AppSettingsService::getEmailSettings();
        foreach ($emailConfig as $key => $value) {
            $this->line("  • {$key}: {$value}");
        }

        return 0;
    }
}
