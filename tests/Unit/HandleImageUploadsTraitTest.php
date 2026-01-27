<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Traits\HandleImageUploads;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class HandleImageUploadsTraitTest extends TestCase
{
    use RefreshDatabase;

    private $testController;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        
        // Créer une classe de test qui utilise le trait avec méthodes publiques
        $this->testController = new class {
            use HandleImageUploads;
            
            // Wrappers publics pour les méthodes protected du trait
            public function testUploadCategoryImage($file): ?string
            {
                return $this->uploadCategoryImage($file);
            }
            
            public function testUploadBrandImage($file): ?string
            {
                return $this->uploadBrandImage($file);
            }
            
            public function testUploadCustomerImage($file): ?string
            {
                return $this->uploadCustomerImage($file);
            }
            
            public function testUpdateCategoryImage($file, $oldImagePath = null): ?string
            {
                return $this->updateCategoryImage($file, $oldImagePath);
            }
            
            public function testValidateImageFile($file): bool
            {
                return $this->validateImageFile($file);
            }
            
            public function testHandleMultipleImageUpload(array $files, string $type): array
            {
                return $this->handleMultipleImageUpload($files, $type);
            }
            
            public function testGetImageInfo(string $imagePath): array
            {
                return $this->getImageInfo($imagePath);
            }
            
            public function testCreateImageVersions($file, string $baseType): array
            {
                return $this->createImageVersions($file, $baseType);
            }
            
            public function testDeleteImage(string $imagePath): bool
            {
                return $this->deleteImage($imagePath);
            }
        };
    }

    /** @test */
    public function it_handles_category_image_upload()
    {
        $file = UploadedFile::fake()->image('category.jpg');
        
        $result = $this->testController->testUploadCategoryImage($file);
        
        $this->assertStringStartsWith('storage/category_images/', $result);
        $this->assertStringEndsWith('.webp', $result);
    }

    /** @test */
    public function it_handles_brand_image_upload()
    {
        $file = UploadedFile::fake()->image('brand.png');
        
        $result = $this->testController->testUploadBrandImage($file);
        
        $this->assertStringStartsWith('storage/brand_icons/', $result);
        $this->assertStringEndsWith('.webp', $result);
    }

    /** @test */
    public function it_handles_customer_image_upload()
    {
        $file = UploadedFile::fake()->image('customer.jpg');
        
        $result = $this->testController->testUploadCustomerImage($file);
        
        $this->assertStringStartsWith('storage/customers/', $result);
        $this->assertStringEndsWith('.webp', $result);
    }

    /** @test */
    public function it_handles_image_upload_with_cleanup()
    {
        $oldFile = UploadedFile::fake()->image('old.jpg');
        $oldPath = $this->testController->testUploadCategoryImage($oldFile);
        
        // Vérifier que l'ancienne image existe
        $oldStoragePath = str_replace('storage/', '', $oldPath);
        Storage::disk('public')->assertExists($oldStoragePath);
        
        $newFile = UploadedFile::fake()->image('new.jpg');
        $newPath = $this->testController->testUpdateCategoryImage($newFile, $oldPath);
        
        // Vérifier que la nouvelle image existe
        $newStoragePath = str_replace('storage/', '', $newPath);
        Storage::disk('public')->assertExists($newStoragePath);
        
        // Vérifier que l'ancienne image a été supprimée
        Storage::disk('public')->assertMissing($oldStoragePath);
    }

    /** @test */
    public function it_returns_null_for_no_file()
    {
        $result = $this->testController->testUploadCategoryImage(null);
        
        $this->assertNull($result);
    }

    /** @test */
    public function it_keeps_old_path_when_no_new_file()
    {
        $oldPath = 'storage/category_images/old-image.webp';
        
        $result = $this->testController->testUpdateCategoryImage(null, $oldPath);
        
        $this->assertEquals($oldPath, $result);
    }

    /** @test */
    public function it_validates_image_file()
    {
        $validFile = UploadedFile::fake()->image('test.jpg');
        
        $result = $this->testController->testValidateImageFile($validFile);
        
        $this->assertTrue($result);
    }

    /** @test */
    public function it_handles_multiple_image_upload()
    {
        $files = [
            UploadedFile::fake()->image('image1.jpg'),
            UploadedFile::fake()->image('image2.png'),
            UploadedFile::fake()->image('image3.webp'),
        ];
        
        $results = $this->testController->testHandleMultipleImageUpload($files, 'product');
        
        $this->assertCount(3, $results);
        
        foreach ($results as $path) {
            $this->assertStringStartsWith('storage/products/', $path);
            $this->assertStringEndsWith('.webp', $path);
        }
    }

    /** @test */
    public function it_gets_image_info()
    {
        $file = UploadedFile::fake()->image('test.jpg', 400, 300);
        $imagePath = $this->testController->testUploadCategoryImage($file);
        
        $info = $this->testController->testGetImageInfo($imagePath);
        
        $this->assertArrayHasKey('width', $info);
        $this->assertArrayHasKey('height', $info);
        $this->assertEquals(400, $info['width']);
        $this->assertEquals(400, $info['height']);
    }

    /** @test */
    public function it_creates_image_versions()
    {
        $file = UploadedFile::fake()->image('test.jpg', 1200, 800);
        
        $versions = $this->testController->testCreateImageVersions($file, 'product');
        
        $this->assertArrayHasKey('thumbnail', $versions);
        $this->assertArrayHasKey('medium', $versions);
        $this->assertArrayHasKey('large', $versions);
        
        foreach ($versions as $version => $path) {
            $this->assertStringContainsString('product_' . $version, $path);
        }
    }

    /** @test */
    public function it_deletes_image()
    {
        $file = UploadedFile::fake()->image('test.jpg');
        $imagePath = $this->testController->testUploadCategoryImage($file);
        
        $storagePath = str_replace('storage/', '', $imagePath);
        Storage::disk('public')->assertExists($storagePath);
        
        $result = $this->testController->testDeleteImage($imagePath);
        
        $this->assertTrue($result);
        Storage::disk('public')->assertMissing($storagePath);
    }
}