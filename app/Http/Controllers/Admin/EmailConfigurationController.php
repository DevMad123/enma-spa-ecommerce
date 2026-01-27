<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\EmailConfigurationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class EmailConfigurationController extends Controller
{
    public function __construct(
        private EmailConfigurationService $emailConfigService
    ) {}

    /**
     * Affiche la page de configuration email
     */
    public function index()
    {
        $currentConfig = $this->emailConfigService->getEmailConfiguration();
        $templates = $this->emailConfigService->getEmailProviderTemplates();

        return Inertia::render('Admin/Settings/EmailConfiguration', [
            'currentConfig' => $currentConfig,
            'templates' => $templates,
            'test_result' => session('test_result'),
        ]);
    }

    /**
     * Met à jour la configuration email
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_driver' => 'required|string|in:smtp,sendmail,mailgun,ses,log',
            'email_host' => 'required_if:email_driver,smtp|string|max:255',
            'email_port' => 'required_if:email_driver,smtp|integer|min:1|max:65535',
            'email_encryption' => 'nullable|string|in:tls,ssl',
            'email_username' => 'required_if:email_driver,smtp|string|max:255',
            'email_password' => 'required_if:email_driver,smtp|string|max:255',
            'email_from_address' => 'required|email|max:255',
            'email_from_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $result = $this->emailConfigService->updateEmailConfiguration($request->all());

            if ($result['success']) {
                $message = 'Configuration email mise à jour avec succès';
                if (!empty($result['updated_settings'])) {
                    $message .= ' (' . count($result['updated_settings']) . ' paramètres modifiés)';
                }

                Log::info('Email configuration updated successfully', [
                    'updated_settings' => $result['updated_settings'],
                    'user_id' => auth()->id()
                ]);

                return back()->with('success', $message);
            } else {
                return back()->withErrors([
                    'config' => 'Erreurs dans la configuration: ' . implode(', ', $result['errors'])
                ])->withInput();
            }

        } catch (\Exception $e) {
            Log::error('Email configuration update failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Erreur lors de la mise à jour: ' . $e->getMessage());
        }
    }

    /**
     * Teste la configuration email actuelle
     */
    public function test(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'test_email' => 'required|email',
            'test_type' => 'required|string|in:connection,send'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            if ($request->test_type === 'connection') {
                $result = $this->emailConfigService->testEmailConfiguration();
            } else {
                $result = $this->emailConfigService->sendTestEmail(
                    $request->test_email,
                    'Test Email - ENMA Store'
                );
            }

            Log::info('Email configuration test performed', [
                'test_type' => $request->test_type,
                'success' => $result['success'],
                'user_id' => auth()->id()
            ]);

            return back()->with('test_result', $result);

        } catch (\Exception $e) {
            Log::error('Email configuration test failed', [
                'test_type' => $request->test_type ?? 'unknown',
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return back()->with('test_result', [
                'success' => false,
                'error' => 'Erreur lors du test: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Applique un template de configuration prédéfini
     */
    public function applyTemplate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'template' => 'required|string'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            $templates = $this->emailConfigService->getEmailProviderTemplates();
            $template = $templates[$request->template] ?? null;

            if (!$template) {
                return back()->with('error', 'Template de configuration non trouvé');
            }

            $configToApply = [
                'email_driver' => $template['driver'],
                'email_host' => $template['host'],
                'email_port' => $template['port'],
                'email_encryption' => $template['encryption'],
            ];

            $result = $this->emailConfigService->updateEmailConfiguration($configToApply);

            if ($result['success']) {
                Log::info('Email template applied successfully', [
                    'template' => $request->template,
                    'updated_settings' => $result['updated_settings'],
                    'user_id' => auth()->id()
                ]);

                return back()->with('success', "Template {$template['name']} appliqué avec succès");
            } else {
                return back()->with('error', 'Erreur lors de l\'application du template: ' . implode(', ', $result['errors']));
            }

        } catch (\Exception $e) {
            Log::error('Email template application failed', [
                'template' => $request->template,
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Erreur lors de l\'application du template: ' . $e->getMessage());
        }
    }

    /**
     * Réinitialise la configuration email aux valeurs par défaut
     */
    public function reset()
    {
        try {
            $defaultConfig = [
                'email_driver' => 'smtp',
                'email_host' => 'smtp.gmail.com',
                'email_port' => 587,
                'email_encryption' => 'tls',
                'email_username' => '',
                'email_password' => '',
                'email_from_address' => 'noreply@localhost.com',
                'email_from_name' => 'ENMA Store',
            ];

            $result = $this->emailConfigService->updateEmailConfiguration($defaultConfig);

            if ($result['success']) {
                Log::info('Email configuration reset successfully', [
                    'user_id' => auth()->id()
                ]);

                return back()->with('success', 'Configuration email réinitialisée aux valeurs par défaut');
            } else {
                return back()->with('error', 'Erreur lors de la réinitialisation: ' . implode(', ', $result['errors']));
            }

        } catch (\Exception $e) {
            Log::error('Email configuration reset failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Erreur lors de la réinitialisation: ' . $e->getMessage());
        }
    }
}