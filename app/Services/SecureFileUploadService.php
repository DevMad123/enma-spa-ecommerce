<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

/**
 * Service sécurisé pour la gestion des uploads de fichiers
 * 
 * Fonctionnalités :
 * - Validation stricte des types MIME
 * - Vérification du contenu binaire réel
 * - Protection contre les injections de scripts
 * - Optimisation et redimensionnement d'images
 * - Gestion centralisée des erreurs
 */
class SecureFileUploadService
{
    /**
     * Types MIME autorisés pour les images
     */
    private const ALLOWED_IMAGE_TYPES = [
        'image/jpeg',
        'image/png', 
        'image/webp',
        'image/avif',
        'image/jpg',
        'image/pjpeg',
        'image/x-png'
    ];

    /**
     * Extensions autorisées
     */
    private const ALLOWED_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'webp', 'avif'
    ];

    /**
     * Taille maximale par défaut (2MB)
     */
    private const DEFAULT_MAX_SIZE = 2048 * 1024; // 2MB en bytes

    /**
     * Upload sécurisé d'une image avec validation stricte
     *
     * @param UploadedFile $file
     * @param string $directory Répertoire de destination
     * @param array $options Options : width, height, quality, max_size
     * @return string Chemin relatif du fichier uploadé
     * @throws ValidationException
     */
    public function uploadImage(UploadedFile $file, string $directory, array $options = []): string
    {
        // Validation de sécurité
        $this->validateImageSecurity($file, $options['max_size'] ?? self::DEFAULT_MAX_SIZE);
        
        // Génération d'un nom unique et sécurisé
        $filename = $this->generateSecureFilename($file, $directory);
        $filePath = $directory . '/' . $filename;
        
        try {
            // Traitement de l'image
            $processedImage = $this->processImage($file, $options);
            
            // Stockage sécurisé
            Storage::disk('public')->put($filePath, $processedImage);
            
            // Log de sécurité
            Log::info('Secure file upload successful', [
                'file' => $filename,
                'directory' => $directory,
                'original_name' => $file->getClientOriginalName(),
                'size' => strlen($processedImage),
                'user_id' => auth()->id()
            ]);
            
            return 'storage/' . $filePath;
            
        } catch (\Exception $e) {
            Log::error('Secure file upload failed', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName(),
                'user_id' => auth()->id()
            ]);
            
            throw new ValidationException(validator([], []), [
                'file' => 'Erreur lors du traitement du fichier. Veuillez réessayer.'
            ]);
        }
    }

    /**
     * Validation de sécurité stricte du fichier
     *
     * @param UploadedFile $file
     * @param int $maxSize
     * @throws ValidationException
     */
    private function validateImageSecurity(UploadedFile $file, int $maxSize): void
    {
        // 1. Vérification de base
        if (!$file->isValid()) {
            throw ValidationException::withMessages([
                'file' => 'Fichier corrompu ou invalide.'
            ]);
        }

        // 2. Vérification de la taille
        if ($file->getSize() > $maxSize) {
            $maxSizeMB = round($maxSize / 1024 / 1024, 1);
            throw ValidationException::withMessages([
                'file' => "Fichier trop volumineux. Taille maximale : {$maxSizeMB}MB."
            ]);
        }

        // 3. Validation du type MIME déclaré
        $declaredMimeType = $file->getMimeType();
        if (!in_array($declaredMimeType, self::ALLOWED_IMAGE_TYPES)) {
            throw ValidationException::withMessages([
                'file' => 'Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou AVIF.'
            ]);
        }

        // 4. Validation de l'extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw ValidationException::withMessages([
                'file' => 'Extension de fichier non autorisée.'
            ]);
        }

        // 5. Vérification du contenu binaire réel (anti-spoofing)
        $realMimeType = $this->getRealMimeType($file);
        if (!in_array($realMimeType, self::ALLOWED_IMAGE_TYPES)) {
            throw ValidationException::withMessages([
                'file' => 'Le contenu du fichier ne correspond pas à une image valide.'
            ]);
        }

        // 6. Scan basique anti-malware
        $this->scanForMaliciousContent($file);
    }

    /**
     * Obtient le vrai type MIME en analysant le contenu binaire
     *
     * @param UploadedFile $file
     * @return string
     */
    private function getRealMimeType(UploadedFile $file): string
    {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        return $finfo->file($file->getRealPath());
    }

    /**
     * Scan basique pour détecter du contenu malveillant
     *
     * @param UploadedFile $file
     * @throws ValidationException
     */
    private function scanForMaliciousContent(UploadedFile $file): void
    {
        $content = file_get_contents($file->getRealPath());
        
        // Patterns malveillants couramment trouvés dans les images
        $maliciousPatterns = [
            '/<\?php/i',
            '/<script/i', 
            '/eval\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/shell_exec/i',
            '/base64_decode/i'
        ];

        foreach ($maliciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                Log::warning('Malicious content detected in upload', [
                    'file' => $file->getClientOriginalName(),
                    'pattern' => $pattern,
                    'user_id' => auth()->id()
                ]);
                
                throw ValidationException::withMessages([
                    'file' => 'Fichier suspect détecté. Upload refusé pour des raisons de sécurité.'
                ]);
            }
        }
    }

    /**
     * Génère un nom de fichier unique et sécurisé
     *
     * @param UploadedFile $file
     * @param string $directory
     * @return string
     */
    private function generateSecureFilename(UploadedFile $file, string $directory): string
    {
        $prefix = preg_replace('/[^a-z0-9_-]/', '', strtolower($directory));
        $timestamp = time();
        $random = rand(1000, 9999);
        
        return "{$prefix}-{$timestamp}-{$random}.webp";
    }

    /**
     * Traite et optimise l'image
     *
     * @param UploadedFile $file
     * @param array $options
     * @return string Contenu binaire de l'image traitée
     */
    private function processImage(UploadedFile $file, array $options): string
    {
        $imageManager = new ImageManager(new GdDriver());
        
        try {
            $image = $imageManager->read($file);
        } catch (\Throwable $e) {
            // Fallback vers Imagick si disponible
            Log::warning('GD failed, attempting Imagick fallback', [
                'error' => $e->getMessage()
            ]);
            
            try {
                $imageManager = new ImageManager(new \Intervention\Image\Drivers\Imagick\Driver());
                $image = $imageManager->read($file);
            } catch (\Throwable $e2) {
                throw ValidationException::withMessages([
                    'file' => 'Format d\'image non supporté par le serveur.'
                ]);
            }
        }

        // Redimensionnement si spécifié
        if (isset($options['width']) || isset($options['height'])) {
            $width = $options['width'] ?? null;
            $height = $options['height'] ?? null;
            $image->resize($width, $height);
        } else {
            // Redimensionnement par défaut pour économiser l'espace
            $image->scale(width: 800); // Max 800px de largeur
        }

        // Conversion en WebP avec qualité optimisée
        $quality = $options['quality'] ?? 80;
        return $image->toWebp($quality);
    }

    /**
     * Supprime un fichier de manière sécurisée
     *
     * @param string $filePath
     * @return bool
     */
    public function deleteFile(string $filePath): bool
    {
        try {
            if (empty($filePath)) {
                return false;
            }

            // Nettoyer le chemin pour éviter les directory traversal
            $cleanPath = str_replace(['storage/', '../', '..\\'], '', $filePath);
            
            if (Storage::disk('public')->exists($cleanPath)) {
                Storage::disk('public')->delete($cleanPath);
                
                Log::info('File deleted successfully', [
                    'file' => $cleanPath,
                    'user_id' => auth()->id()
                ]);
                
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('File deletion failed', [
                'file' => $filePath,
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return false;
        }
    }

    /**
     * Valide et nettoie un chemin de fichier
     *
     * @param string $path
     * @return string
     */
    public function sanitizePath(string $path): string
    {
        // Supprime les caractères dangereux
        $path = str_replace(['../', '..\\', '<', '>', '|', '"'], '', $path);
        
        // Normalise les séparateurs
        $path = str_replace('\\', '/', $path);
        
        return trim($path, '/');
    }
}