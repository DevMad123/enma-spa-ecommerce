<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminRouteAuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityAuditController extends Controller
{
    private AdminRouteAuditService $auditService;

    public function __construct(AdminRouteAuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Affiche le tableau de bord de l'audit de sécurité
     */
    public function index()
    {
        $securityReport = $this->auditService->generateSecurityReport();

        return Inertia::render('Admin/Security/Audit', [
            'securityReport' => $securityReport,
            'pageTitle' => 'Audit de Sécurité - Routes Admin'
        ]);
    }

    /**
     * Exécute un audit en temps réel
     */
    public function runAudit(Request $request)
    {
        try {
            $auditResults = $this->auditService->auditAdminRoutes();
            
            return response()->json([
                'success' => true,
                'results' => $auditResults,
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'audit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Génère un rapport de sécurité complet
     */
    public function generateReport(Request $request)
    {
        try {
            $report = $this->auditService->generateSecurityReport();
            
            return response()->json([
                'success' => true,
                'report' => $report
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la génération du rapport: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export du rapport au format JSON
     */
    public function exportReport(Request $request)
    {
        $report = $this->auditService->generateSecurityReport();
        
        $filename = 'security_audit_' . date('Y_m_d_His') . '.json';
        
        return response()->json($report)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}