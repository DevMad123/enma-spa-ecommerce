<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\ImageProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageProcessingServiceTest extends TestCase
{
    use RefreshDatabase;

    private ImageProcessingService $imageService;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->imageService = new ImageProcessingService();
    }

    /** @test */
    public function it_processes_and_saves_category_image()
    {
        $file = UploadedFile::fake()->image('category.jpg', 800, 600);
        
        $result = $this->imageService->processAndSave($file, 'category');
        
        $this->assertStringStartsWith('storage/category_images/', $result);
        $this->assertStringEndsWith('.webp', $result);
        
        // Vérifier que le fichier existe dans le storage
        $path = str_replace('storage/', '', $result);
        Storage::disk('public')->assertExists($path);
    }

    /** @test */
    public function it_processes_and_saves_brand_image()
    {
        $file = UploadedFile::fake()->image('brand.png', 400, 300);
        
        $result = $this->imageService->processAndSave($file, 'brand');
        
        $this->assertStringStartsWith('storage/brand_icons/', $result);
        $this->assertStringEndsWith('.webp', $result);
    }

    /** @test */
    public function it_validates_image_file()
    {
        // Test avec un fichier image valide
        $validFile = UploadedFile::fake()->image('test.jpg');
        $this->assertTrue($this->imageService->validateImage($validFile));
        
        // Test avec un fichier non-image
        $invalidFile = UploadedFile::fake()->create('test.txt', 100);
        
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $this->imageService->validateImage($invalidFile);
    }

    /** @test */
    public function it_deletes_image_successfully()
    {
        $file = UploadedFile::fake()->image('test.jpg');
        $imagePath = $this->imageService->processAndSave($file, 'category');
        
        // Vérifier que l'image existe
        $path = str_replace('storage/', '', $imagePath);
        Storage::disk('public')->assertExists($path);
        
        // Supprimer l'image
        $result = $this->imageService->deleteImage($imagePath);
        
        $this->assertTrue($result);
        Storage::disk('public')->assertMissing($path);
    }

    /** @test */
    public function it_creates_multiple_versions()
    {
        $file = UploadedFile::fake()->image('test.jpg', 1200, 800);
        
        $versions = $this->imageService->createMultipleVersions($file, 'product');
        
        $this->assertArrayHasKey('thumbnail', $versions);
        $this->assertArrayHasKey('medium', $versions);
        $this->assertArrayHasKey('large', $versions);
        
        foreach ($versions as $version => $path) {
            $this->assertStringContainsString('product_' . $version, $path);
            $storagePath = str_replace('storage/', '', $path);
            Storage::disk('public')->assertExists($storagePath);
        }
    }

    /** @test */
    public function it_gets_image_info()
    {
        $file = UploadedFile::fake()->image('test.jpg', 400, 300);
        $imagePath = $this->imageService->processAndSave($file, 'category');
        
        $info = $this->imageService->getImageInfo($imagePath);
        
        $this->assertArrayHasKey('width', $info);
        $this->assertArrayHasKey('height', $info);
        $this->assertArrayHasKey('size', $info);
        $this->assertArrayHasKey('mime_type', $info);
        $this->assertEquals(400, $info['width']);
        $this->assertEquals(400, $info['height']);
    }

    /** @test */
    public function it_handles_invalid_image_type()
    {
        $file = UploadedFile::fake()->image('test.jpg');
        
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Type d\'image non supporté: invalid_type');
        
        $this->imageService->processAndSave($file, 'invalid_type');
    }

    /** @test */
    public function it_optimizes_existing_image()
    {
        $file = UploadedFile::fake()->image('test.jpg', 800, 600);
        $imagePath = $this->imageService->processAndSave($file, 'product');
        
        // Vérifier que l'image a été créée
        $path = str_replace('storage/', '', $imagePath);
        Storage::disk('public')->assertExists($path);
        
        // Obtenir la taille originale
        $originalInfo = $this->imageService->getImageInfo($imagePath);
        
        // S'assurer que l'image existe avant optimisation
        $this->assertArrayHasKey('width', $originalInfo);
        
        // Optimiser l'image existante
        $optimizedPath = $this->imageService->optimizeExistingImage($imagePath, 'product');
        
        $this->assertEquals($imagePath, $optimizedPath);
        
        // Vérifier que l'image optimisée existe toujours
        Storage::disk('public')->assertExists($path);
    }
}