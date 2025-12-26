<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Services\LogService;

class BackupDatabase extends Command
{
    protected $signature = 'db:backup 
                            {--keep-days=7 : Nombre de jours pour conserver les anciens backups}
                            {--compress : Compresser le fichier de backup}';
    
    protected $description = 'Créer un backup de la base de données';

    public function handle()
    {
        $this->info('🔄 Démarrage du backup de la base de données...');
        
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}");
        
        // Créer le dossier backups s'il n'existe pas
        $backupPath = storage_path('app/backups');
        if (!file_exists($backupPath)) {
            mkdir($backupPath, 0755, true);
            $this->info("📁 Dossier de backup créé: {$backupPath}");
        }
        
        // Nom du fichier de backup avec timestamp
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$timestamp}.sql";
        $filepath = $backupPath . '/' . $filename;
        
        try {
            switch ($driver) {
                case 'mysql':
                    $this->backupMysql($connection, $filepath);
                    break;
                    
                case 'pgsql':
                    $this->backupPostgres($connection, $filepath);
                    break;
                    
                case 'sqlite':
                    $this->backupSqlite($connection, $filepath);
                    break;
                    
                default:
                    $this->error("❌ Driver de base de données non supporté: {$driver}");
                    return 1;
            }
            
            // Compresser si demandé
            if ($this->option('compress')) {
                $filepath = $this->compressBackup($filepath);
            }
            
            // Nettoyer les anciens backups
            $this->cleanOldBackups($backupPath, $this->option('keep-days'));
            
            $size = $this->formatBytes(filesize($filepath));
            $this->info("✅ Backup créé avec succès: " . basename($filepath) . " ({$size})");
            
            // Logger le succès du backup
            LogService::system()->backup('success', [
                'filename' => basename($filepath),
                'size' => $size,
                'compressed' => $this->option('compress'),
                'driver' => $driver,
            ]);
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error("❌ Erreur lors du backup: " . $e->getMessage());
            
            // Logger l'échec du backup
            LogService::system()->backup('failed', [
                'error' => $e->getMessage(),
                'driver' => $driver ?? 'unknown',
                'trace' => $e->getTraceAsString(),
            ]);
            
            return 1;
        }
    }
    
    protected function backupMysql($connection, $filepath)
    {
        $host = $connection['host'];
        $port = $connection['port'];
        $database = $connection['database'];
        $username = $connection['username'];
        $password = $connection['password'];
        
        $this->info('📦 Backup MySQL en cours...');
        
        // Essayer d'abord mysqldump si disponible
        $mysqldumpPath = $this->findMysqldump();
        
        if ($mysqldumpPath) {
            $command = sprintf(
                '"%s" --host=%s --port=%s --user=%s --password=%s %s > %s 2>&1',
                $mysqldumpPath,
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($database),
                escapeshellarg($filepath)
            );
            
            exec($command, $output, $returnCode);
            
            if ($returnCode === 0) {
                return;
            }
            
            $this->warn('⚠️ mysqldump non disponible, utilisation de la méthode alternative...');
        }
        
        // Méthode alternative : backup via PHP PDO
        $this->backupMysqlWithPdo($connection, $filepath);
    }
    
    protected function findMysqldump()
    {
        // Chemins communs pour mysqldump sur Windows
        $possiblePaths = [
            'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe',
            'C:/Program Files/MySQL/MySQL Server 5.7/bin/mysqldump.exe',
            'C:/xampp/mysql/bin/mysqldump.exe',
            'C:/wamp64/bin/mysql/mysql8.0.27/bin/mysqldump.exe',
            'C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysqldump.exe',
        ];
        
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }
        
        // Essayer via PATH
        exec('where mysqldump', $output, $returnCode);
        if ($returnCode === 0 && !empty($output[0])) {
            return trim($output[0]);
        }
        
        return null;
    }
    
    protected function backupMysqlWithPdo($connection, $filepath)
    {
        $pdo = new \PDO(
            "mysql:host={$connection['host']};port={$connection['port']};dbname={$connection['database']}",
            $connection['username'],
            $connection['password'],
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );
        
        $file = fopen($filepath, 'w');
        
        // En-tête SQL
        fwrite($file, "-- Backup MySQL Database\n");
        fwrite($file, "-- Date: " . date('Y-m-d H:i:s') . "\n");
        fwrite($file, "-- Database: {$connection['database']}\n\n");
        fwrite($file, "SET FOREIGN_KEY_CHECKS=0;\n\n");
        
        // Récupérer toutes les tables
        $tables = $pdo->query("SHOW TABLES")->fetchAll(\PDO::FETCH_COLUMN);
        
        $progress = $this->output->createProgressBar(count($tables));
        $progress->start();
        
        foreach ($tables as $table) {
            // Structure de la table
            fwrite($file, "-- Structure de la table `{$table}`\n");
            fwrite($file, "DROP TABLE IF EXISTS `{$table}`;\n");
            
            $createTable = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(\PDO::FETCH_ASSOC);
            fwrite($file, $createTable['Create Table'] . ";\n\n");
            
            // Données de la table
            $rows = $pdo->query("SELECT * FROM `{$table}`")->fetchAll(\PDO::FETCH_ASSOC);
            
            if (!empty($rows)) {
                fwrite($file, "-- Données de la table `{$table}`\n");
                
                foreach ($rows as $row) {
                    $columns = array_keys($row);
                    $values = array_map(function($value) use ($pdo) {
                        return $value === null ? 'NULL' : $pdo->quote($value);
                    }, array_values($row));
                    
                    $sql = sprintf(
                        "INSERT INTO `%s` (`%s`) VALUES (%s);\n",
                        $table,
                        implode('`, `', $columns),
                        implode(', ', $values)
                    );
                    
                    fwrite($file, $sql);
                }
                
                fwrite($file, "\n");
            }
            
            $progress->advance();
        }
        
        $progress->finish();
        $this->newLine();
        
        fwrite($file, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($file);
    }
    
    protected function backupPostgres($connection, $filepath)
    {
        $host = $connection['host'];
        $port = $connection['port'];
        $database = $connection['database'];
        $username = $connection['username'];
        $password = $connection['password'];
        
        // Définir le mot de passe via variable d'environnement
        putenv("PGPASSWORD={$password}");
        
        // Construire la commande pg_dump
        $command = sprintf(
            'pg_dump --host=%s --port=%s --username=%s --format=plain --file=%s %s 2>&1',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($filepath),
            escapeshellarg($database)
        );
        
        $this->info('📦 Backup PostgreSQL en cours...');
        
        exec($command, $output, $returnCode);
        
        // Nettoyer la variable d'environnement
        putenv("PGPASSWORD");
        
        if ($returnCode !== 0) {
            throw new \Exception("pg_dump a échoué: " . implode("\n", $output));
        }
    }
    
    protected function backupSqlite($connection, $filepath)
    {
        $database = $connection['database'];
        
        if (!file_exists($database)) {
            throw new \Exception("Base de données SQLite introuvable: {$database}");
        }
        
        $this->info('📦 Backup SQLite en cours...');
        
        // Pour SQLite, on peut simplement copier le fichier
        copy($database, $filepath);
    }
    
    protected function compressBackup($filepath)
    {
        if (!file_exists($filepath)) {
            return $filepath;
        }
        
        $this->info('🗜️ Compression du backup...');
        
        $gzFilepath = $filepath . '.gz';
        
        // Compresser avec gzip
        $input = fopen($filepath, 'rb');
        $output = gzopen($gzFilepath, 'wb9');
        
        while (!feof($input)) {
            gzwrite($output, fread($input, 1024 * 1024)); // 1MB buffer
        }
        
        fclose($input);
        gzclose($output);
        
        // Supprimer le fichier non compressé
        unlink($filepath);
        
        $this->info('✅ Backup compressé');
        
        return $gzFilepath;
    }
    
    protected function cleanOldBackups($backupPath, $keepDays)
    {
        $keepDays = (int) $keepDays;
        
        if ($keepDays <= 0) {
            return;
        }
        
        $this->info("🧹 Nettoyage des backups de plus de {$keepDays} jours...");
        
        $files = glob($backupPath . '/backup_*.{sql,gz}', GLOB_BRACE);
        $deletedCount = 0;
        $cutoffDate = Carbon::now()->subDays($keepDays);
        
        foreach ($files as $file) {
            $fileTime = Carbon::createFromTimestamp(filemtime($file));
            
            if ($fileTime->lt($cutoffDate)) {
                unlink($file);
                $deletedCount++;
                $this->line("  🗑️ Supprimé: " . basename($file));
            }
        }
        
        if ($deletedCount > 0) {
            $this->info("✅ {$deletedCount} ancien(s) backup(s) supprimé(s)");
        } else {
            $this->info("✅ Aucun ancien backup à supprimer");
        }
    }
    
    protected function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
