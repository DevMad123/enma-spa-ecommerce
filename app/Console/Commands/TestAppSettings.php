<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AppSettingsService;

class TestAppSettings extends Command
{
    protected $signature = 'test:app-settings';
    protected $description = 'Test app settings and display current values';

    public function handle()
    {
        $this->info('🔧 Paramètres actuels de l\'application');
        $this->line('');

        $settings = [
            'Nom de l\'app' => AppSettingsService::getAppName(),
            'Devise' => AppSettingsService::getCurrency(),
            'Symbole devise' => AppSettingsService::getCurrencySymbol(),
            'Langue' => AppSettingsService::getLanguage(),
            'Email contact' => AppSettingsService::getContactEmail(),
            'Email admin' => AppSettingsService::getAdminEmail(),
            'Téléphone' => AppSettingsService::getPhone(),
        ];

        foreach ($settings as $label => $value) {
            $this->line("<info>{$label}:</info> {$value}");
        }

        $this->line('');
        $this->info('✅ Ces valeurs remplacent maintenant les valeurs en dur dans le frontend !');
    }
}