<?php

use App\Services\AdminRouteAuditService;
use Tests\TestCase;

class AdminRouteSecurityTest extends TestCase
{
    private AdminRouteAuditService $auditService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->auditService = app(AdminRouteAuditService::class);
    }

    /**
     * Test que toutes les routes admin sont protégées
     */
    public function test_admin_routes_are_protected(): void
    {
        $auditResults = $this->auditService->auditAdminRoutes();
        
        $this->assertEquals(0, $auditResults['vulnerable_routes'], 
            'Des routes admin vulnérables ont été détectées: ' . json_encode($auditResults['issues']));
    }

    /**
     * Test que le score de sécurité est acceptable
     */
    public function test_security_score_is_acceptable(): void
    {
        $securityReport = $this->auditService->generateSecurityReport();
        
        $this->assertGreaterThanOrEqual(85, $securityReport['security_score'], 
            'Le score de sécurité est trop bas');
    }

    /**
     * Test d'accès non autorisé aux routes admin
     */
    public function test_admin_routes_require_authentication(): void
    {
        // Test d'accès sans authentification
        $response = $this->get('/admin');
        $response->assertRedirect(); // Devrait rediriger vers login
        
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect();
        
        $response = $this->get('/admin/users');
        $response->assertRedirect();
    }

    /**
     * Test d'accès avec utilisateur non-admin
     */
    public function test_admin_routes_require_admin_role(): void
    {
        // Créer un utilisateur normal (non-admin)
        $user = \App\Models\User::factory()->create();
        
        $this->actingAs($user);
        
        // Tenter d'accéder aux routes admin
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(403); // Forbidden
    }

    /**
     * Test des routes critiques avec admin
     */
    public function test_critical_routes_work_with_admin(): void
    {
        // Créer un utilisateur admin
        $admin = \App\Models\User::factory()->create();
        $admin->assignRole('admin');
        
        $this->actingAs($admin);
        
        // Tester l'accès aux routes critiques
        $response = $this->get('/admin/dashboard');
        $response->assertStatus(200);
        
        $response = $this->get('/admin/users');
        $response->assertStatus(200);
    }

    /**
     * Test de la protection CSRF sur les routes POST admin
     */
    public function test_admin_post_routes_require_csrf(): void
    {
        $admin = \App\Models\User::factory()->create();
        $admin->assignRole('admin');
        
        $this->actingAs($admin);
        
        // Tenter une requête POST sans token CSRF
        $response = $this->post('/admin/users', [
            'name' => 'Test User',
            'email' => 'test@example.com'
        ]);
        
        $response->assertStatus(419); // CSRF token mismatch
    }

    /**
     * Test du rate limiting sur les endpoints publics
     */
    public function test_public_endpoints_have_rate_limiting(): void
    {
        // Tester le rate limiting sur newsletter
        for ($i = 0; $i < 10; $i++) {
            $response = $this->post('/newsletter/subscribe', [
                'email' => 'test' . $i . '@example.com'
            ]);
        }
        
        // La 11ème requête devrait être limitée
        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test11@example.com'
        ]);
        
        $this->assertContains($response->getStatusCode(), [429, 403]);
    }

    /**
     * Test de sécurité des API publiques
     */
    public function test_public_api_security(): void
    {
        // Test avec headers manquants
        $response = $this->withHeaders([
            'User-Agent' => '',
        ])->get('/api/tax/info/FR');
        
        $response->assertStatus(400);
        
        // Test avec User-Agent suspect
        $response = $this->withHeaders([
            'User-Agent' => 'bot',
            'Accept' => 'application/json',
        ])->get('/api/tax/info/FR');
        
        $response->assertStatus(400);
    }

    /**
     * Test de détection d'injection SQL
     */
    public function test_sql_injection_detection(): void
    {
        $admin = \App\Models\User::factory()->create();
        $admin->assignRole('admin');
        
        $this->actingAs($admin);
        
        // Tentative d'injection SQL
        $response = $this->post('/api/tax/calculate', [
            'country' => "'; DROP TABLE users; --"
        ]);
        
        $response->assertStatus(400);
    }
}