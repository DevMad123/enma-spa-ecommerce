<?php

namespace App\Traits;

use App\Services\ImageProcessingService;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

trait HandleImageUploads
{
    /**
     * Service de traitement d'images
     */
    protected ?ImageProcessingService $imageProcessor = null;

    /**
     * Obtient ou instancie le service de traitement d'images
     */
    protected function getImageProcessor(): ImageProcessingService
    {
        if (!$this->imageProcessor) {
            $this->imageProcessor = app(ImageProcessingService::class);
        }

        return $this->imageProcessor;
    }

    /**
     * Gère l'upload d'une image
     *
     * @param UploadedFile|null $file
     * @param string $type Type d'image (category, brand, customer, etc.)
     * @param array $customConfig Configuration personnalisée
     * @return string|null Chemin de l'image ou null
     */
    protected function handleImageUpload(?UploadedFile $file, string $type, array $customConfig = []): ?string
    {
        if (!$file) {
            return null;
        }

        try {
            // Valider l'image
            $this->getImageProcessor()->validateImage($file, $type);
            
            // Traiter et sauvegarder
            return $this->getImageProcessor()->processAndSave($file, $type, $customConfig);
            
        } catch (ValidationException $e) {
            // Re-lancer les erreurs de validation
            throw $e;
        } catch (\Exception $e) {
            // Logger et convertir les autres erreurs
            \Log::error('Image upload failed in trait', [
                'type' => $type,
                'error' => $e->getMessage(),
                'file_name' => $file->getClientOriginalName(),
            ]);

            throw ValidationException::withMessages([
                'image' => 'Erreur lors de l\'upload de l\'image: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Gère l'upload d'une image avec ancienne image à supprimer
     *
     * @param UploadedFile|null $file Nouveau fichier
     * @param string|null $oldImagePath Ancien chemin d'image à supprimer
     * @param string $type Type d'image
     * @param array $customConfig Configuration personnalisée
     * @return string|null
     */
    protected function handleImageUploadWithCleanup(?UploadedFile $file, ?string $oldImagePath, string $type, array $customConfig = []): ?string
    {
        // Si pas de nouveau fichier, retourner l'ancien chemin
        if (!$file) {
            return $oldImagePath;
        }

        try {
            // Traiter la nouvelle image
            $newImagePath = $this->handleImageUpload($file, $type, $customConfig);
            
            // Supprimer l'ancienne image si elle existe et est différente
            if ($oldImagePath && $oldImagePath !== $newImagePath) {
                $this->deleteImage($oldImagePath);
            }

            return $newImagePath;

        } catch (\Exception $e) {
            // En cas d'erreur, ne pas supprimer l'ancienne image
            throw $e;
        }
    }

    /**
     * Supprime une image
     */
    protected function deleteImage(?string $imagePath): bool
    {
        if (!$imagePath) {
            return true;
        }

        return $this->getImageProcessor()->deleteImage($imagePath);
    }

    /**
     * Crée plusieurs versions d'une image (thumbnail, medium, large)
     */
    protected function createImageVersions(UploadedFile $file, string $type): array
    {
        return $this->getImageProcessor()->createMultipleVersions($file, $type);
    }

    /**
     * Valide une image avant traitement
     */
    protected function validateImageFile(UploadedFile $file, string $type = 'default'): bool
    {
        return $this->getImageProcessor()->validateImage($file, $type);
    }

    /**
     * Optimise une image existante
     */
    protected function optimizeImage(string $imagePath, string $type): string
    {
        return $this->getImageProcessor()->optimizeExistingImage($imagePath, $type);
    }

    /**
     * Obtient les informations d'une image
     */
    protected function getImageInfo(string $imagePath): array
    {
        return $this->getImageProcessor()->getImageInfo($imagePath);
    }

    /**
     * Méthodes de commodité pour les types d'images courants
     */

    /**
     * Upload d'image de catégorie
     */
    protected function uploadCategoryImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'category');
    }

    /**
     * Upload d'image de marque
     */
    protected function uploadBrandImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'brand');
    }

    /**
     * Upload d'image de client
     */
    protected function uploadCustomerImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'customer');
    }

    /**
     * Upload d'image de produit
     */
    protected function uploadProductImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'product');
    }

    /**
     * Upload d'image de sous-catégorie
     */
    protected function uploadSubcategoryImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'subcategory');
    }

    /**
     * Upload d'image de fournisseur
     */
    protected function uploadSupplierImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'supplier');
    }

    /**
     * Upload d'image de paramètre
     */
    protected function uploadSettingImage(?UploadedFile $file): ?string
    {
        return $this->handleImageUpload($file, 'settings');
    }

    /**
     * Méthodes avec cleanup automatique pour les updates
     */

    /**
     * Update image de catégorie avec cleanup
     */
    protected function updateCategoryImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'category');
    }

    /**
     * Update image de marque avec cleanup
     */
    protected function updateBrandImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'brand');
    }

    /**
     * Update image de client avec cleanup
     */
    protected function updateCustomerImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'customer');
    }

    /**
     * Update image de produit avec cleanup
     */
    protected function updateProductImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'product');
    }

    /**
     * Update image de sous-catégorie avec cleanup
     */
    protected function updateSubcategoryImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'subcategory');
    }

    /**
     * Update image de fournisseur avec cleanup
     */
    protected function updateSupplierImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'supplier');
    }

    /**
     * Update image de paramètre avec cleanup
     */
    protected function updateSettingImage(?UploadedFile $file, ?string $oldPath): ?string
    {
        return $this->handleImageUploadWithCleanup($file, $oldPath, 'settings');
    }

    /**
     * Gère l'upload multiple d'images
     *
     * @param array $files Tableau de UploadedFile
     * @param string $type Type d'image
     * @return array Tableau des chemins d'images
     */
    protected function handleMultipleImageUpload(array $files, string $type): array
    {
        $uploadedPaths = [];

        foreach ($files as $index => $file) {
            if ($file instanceof UploadedFile) {
                try {
                    $path = $this->handleImageUpload($file, $type);
                    if ($path) {
                        $uploadedPaths[] = $path;
                    }
                } catch (\Exception $e) {
                    // Logger l'erreur mais continuer avec les autres fichiers
                    \Log::warning('Multiple image upload partial failure', [
                        'index' => $index,
                        'error' => $e->getMessage(),
                        'file_name' => $file->getClientOriginalName(),
                    ]);
                }
            }
        }

        return $uploadedPaths;
    }
}