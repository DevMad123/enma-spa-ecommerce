<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;
use Illuminate\Http\UploadedFile;

class SettingsFileManagerService
{
    private SecureFileUploadService $uploadService;

    public function __construct(SecureFileUploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    /**
     * Upload un fichier pour un paramètre
     */
    public function uploadFile(UploadedFile $file, string $key): array
    {
        try {
            $this->validateKey($key);
            $uploadConfig = $this->getUploadConfig($key);

            // Upload sécurisé avec configuration spécifique
            $uploadPath = $this->uploadService->uploadImage($file, 'settings', $uploadConfig);

            // Supprimer l'ancien fichier
            $oldValue = Setting::get($key);
            if ($oldValue) {
                $this->deleteFileFromStorage($oldValue);
            }

            // Mettre à jour le paramètre
            Setting::set($key, $uploadPath);
            
            // Vider le cache
            $this->clearSettingsCache();

            // Log de sécurité
            Log::info('Settings file uploaded successfully', [
                'key' => $key,
                'file_name' => $file->getClientOriginalName(),
                'user_id' => auth()->id(),
                'new_path' => $uploadPath
            ]);

            return [
                'success' => true,
                'message' => 'Fichier uploadé avec succès !',
                'path' => $uploadPath,
                'url' => $this->getPublicUrl($uploadPath),
                'filename' => $file->getClientOriginalName()
            ];

        } catch (\Exception $e) {
            Log::error('Settings file upload failed', [
                'key' => $key,
                'file' => $file->getClientOriginalName() ?? 'unknown',
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return [
                'success' => false,
                'message' => 'Erreur lors de l\'upload : ' . $e->getMessage()
            ];
        }
    }

    /**
     * Supprime un fichier de paramètre
     */
    public function deleteFile(string $key): array
    {
        try {
            $this->validateKey($key);

            $filePath = Setting::get($key);
            
            if ($filePath) {
                $this->deleteFileFromStorage($filePath);
            }

            // Mettre à jour le paramètre avec une valeur vide
            Setting::set($key, '');
            
            // Vider le cache
            $this->clearSettingsCache();

            Log::info('Settings file deleted successfully', [
                'key' => $key,
                'old_path' => $filePath,
                'user_id' => auth()->id()
            ]);

            return [
                'success' => true,
                'message' => 'Fichier supprimé avec succès !'
            ];

        } catch (\Exception $e) {
            Log::error('Settings file deletion failed', [
                'key' => $key,
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return [
                'success' => false,
                'message' => 'Erreur lors de la suppression : ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtient la configuration d'upload pour une clé donnée
     */
    private function getUploadConfig(string $key): array
    {
        $configs = [
            'hero_banner' => [
                'width' => 1920,
                'height' => 800,
                'quality' => 90,
                'max_size' => 3 * 1024 * 1024, // 3MB
            ],
            'promo_banner' => [
                'width' => 1200,
                'height' => 600,
                'quality' => 85,
                'max_size' => 2 * 1024 * 1024, // 2MB
            ],
            'site_logo' => [
                'width' => 400,
                'height' => 200,
                'quality' => 95,
                'max_size' => 1024 * 1024, // 1MB
            ],
            'favicon' => [
                'width' => 64,
                'height' => 64,
                'quality' => 100,
                'max_size' => 256 * 1024, // 256KB
            ],
        ];

        return $configs[$key] ?? [
            'width' => 1200,
            'height' => 800,
            'quality' => 85,
            'max_size' => 2 * 1024 * 1024, // 2MB par défaut
        ];
    }

    /**
     * Valide que la clé est autorisée pour l'upload
     */
    private function validateKey(string $key): void
    {
        $allowedKeys = [
            'hero_banner',
            'promo_banner',
            'site_logo',
            'favicon',
            'terms_pdf',
            'privacy_pdf',
            'legal_notice_pdf',
        ];

        if (!in_array($key, $allowedKeys, true)) {
            throw new \InvalidArgumentException("Clé de paramètre non autorisée pour l'upload: $key");
        }
    }

    /**
     * Supprime un fichier du stockage
     */
    private function deleteFileFromStorage(string $filePath): void
    {
        // Utiliser le service sécurisé pour supprimer
        $this->uploadService->deleteFile($filePath);
    }

    /**
     * Obtient l'URL publique d'un fichier
     */
    private function getPublicUrl(string $path): string
    {
        return Storage::url(str_replace('storage/', '', $path));
    }

    /**
     * Vide le cache des paramètres
     */
    private function clearSettingsCache(): void
    {
        Cache::forget('app_settings_all');
        Cache::forget('app_settings_all_grouped');
    }

    /**
     * Obtient la liste des types de fichiers autorisés pour une clé
     */
    public function getAllowedMimeTypes(string $key): array
    {
        $pdfKeys = ['terms_pdf', 'privacy_pdf', 'legal_notice_pdf'];
        
        if (in_array($key, $pdfKeys, true)) {
            return ['application/pdf'];
        }

        return [
            'image/jpeg',
            'image/png', 
            'image/jpg',
            'image/webp',
            'image/avif'
        ];
    }

    /**
     * Obtient les extensions de fichiers autorisées pour une clé
     */
    public function getAllowedExtensions(string $key): array
    {
        $pdfKeys = ['terms_pdf', 'privacy_pdf', 'legal_notice_pdf'];
        
        if (in_array($key, $pdfKeys, true)) {
            return ['pdf'];
        }

        return ['jpeg', 'png', 'jpg', 'webp', 'avif'];
    }
}