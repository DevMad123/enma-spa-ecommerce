<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Commande d'initialisation pour Render: migre + seed si la table users est vide
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
