<?php

namespace App\Console\Commands;

use App\Services\AdminRouteAuditService;
use Illuminate\Console\Command;

class SecurityAuditCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:audit 
                           {--export= : Export results to file}
                           {--format=json : Export format (json|html)}
                           {--verbose : Show detailed output}';

    /**
     * The console command description.
     */
    protected $description = 'Run security audit on admin routes and endpoints';

    private AdminRouteAuditService $auditService;

    public function __construct(AdminRouteAuditService $auditService)
    {
        parent::__construct();
        $this->auditService = $auditService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Démarrage de l\'audit de sécurité...');
        $this->newLine();

        try {
            // Exécuter l'audit
            $securityReport = $this->auditService->generateSecurityReport();
            
            // Afficher les résultats
            $this->displayResults($securityReport);
            
            // Export si demandé
            if ($this->option('export')) {
                $this->exportResults($securityReport);
            }
            
            // Code de retour basé sur le score de sécurité
            return $securityReport['security_score'] >= 85 ? 0 : 1;
            
        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de l\'audit: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Affiche les résultats de l'audit
     */
    private function displayResults(array $securityReport): void
    {
        $auditResults = $securityReport['audit_results'];
        
        // Score général
        $score = $securityReport['security_score'];
        $status = $securityReport['compliance_status'];
        
        $this->info("📊 SCORE DE SÉCURITÉ: {$score}/100 ({$status})");
        $this->newLine();
        
        // Statistiques
        $this->table([
            'Métrique',
            'Valeur'
        ], [
            ['Total Routes Admin', $auditResults['total_routes']],
            ['Routes Sécurisées', $auditResults['secure_routes']],
            ['Routes Vulnérables', $auditResults['vulnerable_routes']],
            ['Statut Conformité', $status]
        ]);
        
        // Issues critiques
        if (!empty($auditResults['issues'])) {
            $this->error('🚨 PROBLÈMES DÉTECTÉS:');
            
            foreach ($auditResults['issues'] as $issue) {
                $this->warn("Route: {$issue['route_name']}");
                foreach ($issue['issues'] as $problem) {
                    $this->line("  • {$problem}");
                }
                $this->newLine();
            }
        }
        
        // Actions immédiates
        if (!empty($securityReport['immediate_actions'])) {
            $this->error('⚠️  ACTIONS IMMÉDIATES REQUISES:');
            
            foreach ($securityReport['immediate_actions'] as $action) {
                $this->warn("[{$action['priority']}] {$action['route']}");
                $this->line("  → {$action['action']}");
            }
            $this->newLine();
        }
        
        // Recommandations
        if (!empty($auditResults['recommendations']) && $this->option('verbose')) {
            $this->info('💡 RECOMMANDATIONS:');
            foreach ($auditResults['recommendations'] as $recommendation) {
                $this->line("  • {$recommendation}");
            }
            $this->newLine();
        }
        
        // Statut final
        if ($score >= 95) {
            $this->info('✅ Sécurité excellente - Aucune action immédiate requise');
        } elseif ($score >= 85) {
            $this->warn('⚠️  Sécurité correcte - Quelques améliorations recommandées');
        } elseif ($score >= 70) {
            $this->warn('⚠️  Sécurité moyenne - Actions correctrices nécessaires');
        } else {
            $this->error('❌ Sécurité critique - Intervention immédiate requise');
        }
    }

    /**
     * Exporte les résultats
     */
    private function exportResults(array $securityReport): void
    {
        $exportPath = $this->option('export');
        $format = $this->option('format');
        
        try {
            if ($format === 'html') {
                $this->exportToHtml($securityReport, $exportPath);
            } else {
                $this->exportToJson($securityReport, $exportPath);
            }
            
            $this->info("📁 Rapport exporté: {$exportPath}");
            
        } catch (\Exception $e) {
            $this->error("❌ Erreur d'export: " . $e->getMessage());
        }
    }

    /**
     * Export au format JSON
     */
    private function exportToJson(array $securityReport, string $path): void
    {
        $json = json_encode($securityReport, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents($path, $json);
    }

    /**
     * Export au format HTML
     */
    private function exportToHtml(array $securityReport, string $path): void
    {
        $score = $securityReport['security_score'];
        $status = $securityReport['compliance_status'];
        $timestamp = $securityReport['timestamp'];
        
        $html = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Rapport d'Audit de Sécurité</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .score { font-size: 24px; font-weight: bold; }
        .excellent { color: #28a745; }
        .good { color: #17a2b8; }
        .warning { color: #ffc107; }
        .critical { color: #dc3545; }
        .issue { background: #ffe6e6; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .recommendation { background: #e6f3ff; padding: 10px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Rapport d'Audit de Sécurité</h1>
        <p>Généré le: {$timestamp}</p>
        <div class='score'>Score: {$score}/100 ({$status})</div>
    </div>
";

        // Ajout des issues
        if (!empty($securityReport['audit_results']['issues'])) {
            $html .= "<h2>Problèmes Détectés</h2>";
            foreach ($securityReport['audit_results']['issues'] as $issue) {
                $html .= "<div class='issue'>
                    <h3>{$issue['route_name']}</h3>
                    <ul>";
                foreach ($issue['issues'] as $problem) {
                    $html .= "<li>{$problem}</li>";
                }
                $html .= "</ul></div>";
            }
        }

        // Ajout des recommandations
        if (!empty($securityReport['audit_results']['recommendations'])) {
            $html .= "<h2>Recommandations</h2>";
            foreach ($securityReport['audit_results']['recommendations'] as $recommendation) {
                $html .= "<div class='recommendation'>{$recommendation}</div>";
            }
        }

        $html .= "</body></html>";
        
        file_put_contents($path, $html);
    }
}