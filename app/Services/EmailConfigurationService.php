<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;

class EmailConfigurationService
{
    /**
     * Configuration email par défaut
     */
    private const DEFAULT_CONFIG = [
        'driver' => 'smtp',
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'encryption' => 'tls',
        'from_address' => 'noreply@localhost.com',
        'from_name' => 'ENMA Store',
    ];

    /**
     * Applique la configuration email dynamiquement
     */
    public function applyEmailConfiguration(): bool
    {
        try {
            $config = $this->getEmailConfiguration();
            
            // Mettre à jour la configuration runtime Laravel
            Config::set([
                'mail.default' => $config['driver'],
                'mail.mailers.smtp.host' => $config['host'],
                'mail.mailers.smtp.port' => $config['port'],
                'mail.mailers.smtp.encryption' => $config['encryption'],
                'mail.mailers.smtp.username' => $config['username'],
                'mail.mailers.smtp.password' => $config['password'],
                'mail.from.address' => $config['from_address'],
                'mail.from.name' => $config['from_name'],
            ]);

            // Purger l'instance Swift Mailer pour forcer la recréation avec nouvelle config
            Mail::purge();

            Log::info('Email configuration applied successfully', [
                'host' => $config['host'],
                'port' => $config['port'],
                'encryption' => $config['encryption'],
                'from_address' => $config['from_address'],
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to apply email configuration', [
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Obtient la configuration email depuis les paramètres
     */
    public function getEmailConfiguration(): array
    {
        return [
            'driver' => Setting::get('email_driver', self::DEFAULT_CONFIG['driver']),
            'host' => Setting::get('email_host', self::DEFAULT_CONFIG['host']),
            'port' => (int) Setting::get('email_port', self::DEFAULT_CONFIG['port']),
            'encryption' => Setting::get('email_encryption', self::DEFAULT_CONFIG['encryption']),
            'username' => Setting::get('email_username', ''),
            'password' => Setting::get('email_password', ''),
            'from_address' => Setting::get('email_from_address', self::DEFAULT_CONFIG['from_address']),
            'from_name' => Setting::get('email_from_name', self::DEFAULT_CONFIG['from_name']),
        ];
    }

    /**
     * Met à jour la configuration email
     */
    public function updateEmailConfiguration(array $config): array
    {
        $result = [
            'success' => true,
            'updated_settings' => [],
            'errors' => []
        ];

        try {
            $allowedKeys = [
                'email_driver', 'email_host', 'email_port', 'email_encryption',
                'email_username', 'email_password', 'email_from_address', 'email_from_name'
            ];

            foreach ($config as $key => $value) {
                if (!in_array($key, $allowedKeys)) {
                    $result['errors'][] = "Paramètre non autorisé: $key";
                    continue;
                }

                // Validation spécifique
                $validationResult = $this->validateEmailSetting($key, $value);
                if (!$validationResult['valid']) {
                    $result['errors'][] = $validationResult['error'];
                    continue;
                }

                Setting::set($key, $value);
                $result['updated_settings'][] = $key;
            }

            if (!empty($result['errors'])) {
                $result['success'] = false;
            }

            // Appliquer la nouvelle configuration si tout est OK
            if ($result['success']) {
                $this->applyEmailConfiguration();
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('Email configuration update failed', [
                'error' => $e->getMessage(),
                'config' => $config
            ]);

            return [
                'success' => false,
                'errors' => ['Erreur lors de la mise à jour: ' . $e->getMessage()]
            ];
        }
    }

    /**
     * Teste la configuration email
     */
    public function testEmailConfiguration(): array
    {
        try {
            $config = $this->getEmailConfiguration();

            // Validation basique
            if (empty($config['host']) || empty($config['from_address'])) {
                return [
                    'success' => false,
                    'error' => 'Configuration email incomplète (host ou from_address manquant)'
                ];
            }

            // Appliquer la configuration
            $this->applyEmailConfiguration();

            // Test de connexion SMTP (simple)
            $testResult = $this->testSmtpConnection($config);

            return $testResult;

        } catch (\Exception $e) {
            Log::error('Email configuration test failed', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors du test: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Envoie un email de test
     */
    public function sendTestEmail(string $to, string $subject = 'Test Email'): array
    {
        try {
            $this->applyEmailConfiguration();

            Mail::raw('Ceci est un email de test depuis votre application ENMA Store.', function ($message) use ($to, $subject) {
                $message->to($to)
                        ->subject($subject);
            });

            Log::info('Test email sent successfully', [
                'to' => $to,
                'subject' => $subject
            ]);

            return [
                'success' => true,
                'message' => 'Email de test envoyé avec succès'
            ];

        } catch (\Exception $e) {
            Log::error('Test email failed', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Erreur lors de l\'envoi: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtient les templates de configuration prédéfinis
     */
    public function getEmailProviderTemplates(): array
    {
        return [
            'gmail' => [
                'name' => 'Gmail',
                'driver' => 'smtp',
                'host' => 'smtp.gmail.com',
                'port' => 587,
                'encryption' => 'tls',
                'instructions' => 'Utilisez votre adresse Gmail et un mot de passe d\'application'
            ],
            'outlook' => [
                'name' => 'Outlook/Hotmail',
                'driver' => 'smtp',
                'host' => 'smtp-mail.outlook.com',
                'port' => 587,
                'encryption' => 'tls',
                'instructions' => 'Utilisez votre adresse Outlook et mot de passe'
            ],
            'mailgun' => [
                'name' => 'Mailgun',
                'driver' => 'smtp',
                'host' => 'smtp.mailgun.org',
                'port' => 587,
                'encryption' => 'tls',
                'instructions' => 'Utilisez vos identifiants Mailgun SMTP'
            ],
            'sendgrid' => [
                'name' => 'SendGrid',
                'driver' => 'smtp',
                'host' => 'smtp.sendgrid.net',
                'port' => 587,
                'encryption' => 'tls',
                'instructions' => 'Utilisez "apikey" comme username et votre clé API comme password'
            ],
        ];
    }

    /**
     * Valide un paramètre email spécifique
     */
    private function validateEmailSetting(string $key, $value): array
    {
        switch ($key) {
            case 'email_port':
                $port = (int) $value;
                if ($port <= 0 || $port > 65535) {
                    return ['valid' => false, 'error' => 'Port email invalide (1-65535)'];
                }
                break;

            case 'email_encryption':
                if (!in_array($value, ['tls', 'ssl', ''])) {
                    return ['valid' => false, 'error' => 'Chiffrement email invalide (tls, ssl ou vide)'];
                }
                break;

            case 'email_from_address':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return ['valid' => false, 'error' => 'Adresse email expéditeur invalide'];
                }
                break;

            case 'email_driver':
                if (!in_array($value, ['smtp', 'sendmail', 'mailgun', 'ses', 'log'])) {
                    return ['valid' => false, 'error' => 'Driver email invalide'];
                }
                break;
        }

        return ['valid' => true];
    }

    /**
     * Test simple de connexion SMTP
     */
    private function testSmtpConnection(array $config): array
    {
        if ($config['driver'] !== 'smtp') {
            return [
                'success' => true,
                'message' => 'Test de connexion non applicable pour le driver: ' . $config['driver']
            ];
        }

        try {
            // Test basique de connexion (sans authentification complète)
            $connection = fsockopen($config['host'], $config['port'], $errno, $errstr, 10);
            
            if (!$connection) {
                return [
                    'success' => false,
                    'error' => "Impossible de se connecter au serveur SMTP: $errstr ($errno)"
                ];
            }

            fclose($connection);

            return [
                'success' => true,
                'message' => 'Connexion SMTP réussie'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Erreur de test SMTP: ' . $e->getMessage()
            ];
        }
    }
}