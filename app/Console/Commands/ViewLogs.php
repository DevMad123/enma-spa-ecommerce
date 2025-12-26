<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ViewLogs extends Command
{
    protected $signature = 'logs:view 
                            {channel=laravel : Le canal de log à consulter (laravel, orders, payments, system, errors, users)}
                            {--lines=50 : Nombre de lignes à afficher}
                            {--follow : Suivre les logs en temps réel}
                            {--level= : Filtrer par niveau (debug, info, warning, error)}
                            {--search= : Rechercher un terme spécifique}
                            {--today : Afficher uniquement les logs du jour}';
    
    protected $description = 'Consulter les logs de l\'application';

    public function handle()
    {
        $channel = $this->argument('channel');
        $lines = $this->option('lines');
        $follow = $this->option('follow');
        $level = $this->option('level');
        $search = $this->option('search');
        $today = $this->option('today');
        
        // Déterminer le chemin du fichier de log
        $logPath = $this->getLogPath($channel, $today);
        
        if (!file_exists($logPath)) {
            $this->error("❌ Le fichier de log n'existe pas: {$logPath}");
            $this->info("💡 Fichiers disponibles:");
            $this->listAvailableLogs();
            return 1;
        }
        
        // Mode suivi en temps réel
        if ($follow) {
            $this->followLogs($logPath, $level, $search);
            return 0;
        }
        
        // Affichage normal
        $this->displayLogs($logPath, $lines, $level, $search);
        
        return 0;
    }
    
    protected function getLogPath($channel, $today = false)
    {
        $date = $today ? '-' . now()->format('Y-m-d') : '';
        
        $paths = [
            'laravel' => storage_path("logs/laravel{$date}.log"),
            'orders' => storage_path("logs/orders{$date}.log"),
            'payments' => storage_path("logs/payments{$date}.log"),
            'system' => storage_path("logs/system{$date}.log"),
            'errors' => storage_path("logs/errors{$date}.log"),
            'users' => storage_path("logs/users{$date}.log"),
            'performance' => storage_path("logs/performance{$date}.log"),
        ];
        
        return $paths[$channel] ?? storage_path("logs/{$channel}{$date}.log");
    }
    
    protected function displayLogs($logPath, $lines, $level = null, $search = null)
    {
        $this->info("📄 Consultation: " . basename($logPath));
        $this->info("📏 Taille: " . $this->formatBytes(filesize($logPath)));
        $this->line("");
        
        // Lire les dernières lignes
        $content = $this->tailFile($logPath, $lines * 10); // Plus de lignes pour le filtrage
        
        $logLines = explode("\n", $content);
        $filteredLines = [];
        
        foreach ($logLines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            
            // Filtrer par niveau si spécifié
            if ($level && !$this->matchesLevel($line, $level)) {
                continue;
            }
            
            // Filtrer par recherche si spécifié
            if ($search && stripos($line, $search) === false) {
                continue;
            }
            
            $filteredLines[] = $line;
        }
        
        // Limiter au nombre de lignes demandé
        $filteredLines = array_slice($filteredLines, -$lines);
        
        if (empty($filteredLines)) {
            $this->warn("⚠️ Aucune ligne correspondante trouvée.");
            return;
        }
        
        // Afficher avec coloration
        foreach ($filteredLines as $line) {
            $this->displayColoredLine($line);
        }
        
        $this->newLine();
        $this->info("📊 Total: " . count($filteredLines) . " lignes affichées");
    }
    
    protected function followLogs($logPath, $level = null, $search = null)
    {
        $this->info("👁️ Suivi en temps réel: " . basename($logPath));
        $this->info("Appuyez sur Ctrl+C pour arrêter...");
        $this->line("");
        
        $handle = fopen($logPath, 'r');
        fseek($handle, 0, SEEK_END);
        
        while (true) {
            $line = fgets($handle);
            
            if ($line === false) {
                usleep(100000); // 0.1 seconde
                clearstatcache(false, $logPath);
                continue;
            }
            
            // Filtres
            if ($level && !$this->matchesLevel($line, $level)) {
                continue;
            }
            
            if ($search && stripos($line, $search) === false) {
                continue;
            }
            
            $this->displayColoredLine(trim($line));
        }
        
        fclose($handle);
    }
    
    protected function displayColoredLine($line)
    {
        // Coloration selon le niveau
        if (preg_match('/\b(ERROR|CRITICAL|ALERT|EMERGENCY)\b/i', $line)) {
            $this->line("<fg=red>{$line}</>");
        } elseif (preg_match('/\bWARNING\b/i', $line)) {
            $this->line("<fg=yellow>{$line}</>");
        } elseif (preg_match('/\bINFO\b/i', $line)) {
            $this->line("<fg=green>{$line}</>");
        } elseif (preg_match('/\bDEBUG\b/i', $line)) {
            $this->line("<fg=gray>{$line}</>");
        } else {
            $this->line($line);
        }
    }
    
    protected function matchesLevel($line, $level)
    {
        $level = strtoupper($level);
        return preg_match("/\b{$level}\b/i", $line);
    }
    
    protected function tailFile($file, $lines = 50)
    {
        $handle = fopen($file, 'r');
        $linecounter = $lines;
        $pos = -2;
        $beginning = false;
        $text = [];
        
        while ($linecounter > 0) {
            $t = " ";
            while ($t != "\n") {
                if (fseek($handle, $pos, SEEK_END) == -1) {
                    $beginning = true;
                    break;
                }
                $t = fgetc($handle);
                $pos--;
            }
            $linecounter--;
            if ($beginning) {
                rewind($handle);
            }
            $text[$lines - $linecounter - 1] = fgets($handle);
            if ($beginning) {
                break;
            }
        }
        fclose($handle);
        
        return implode("", array_reverse($text));
    }
    
    protected function listAvailableLogs()
    {
        $logsPath = storage_path('logs');
        $files = File::glob($logsPath . '/*.log');
        
        $this->table(
            ['Fichier', 'Taille', 'Dernière modification'],
            collect($files)->map(function ($file) {
                return [
                    basename($file),
                    $this->formatBytes(filesize($file)),
                    date('Y-m-d H:i:s', filemtime($file)),
                ];
            })->toArray()
        );
    }
    
    protected function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
