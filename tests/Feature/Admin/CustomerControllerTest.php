<?php

namespace Tests\Feature\Admin;

use Tests\TestCase;
use App\Models\User;
use App\Models\Ecommerce_customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class CustomerControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer un utilisateur admin unique par test
        $this->admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin_' . uniqid() . '@test.com',
            'password' => Hash::make('password123'),
        ]);
    }

    /** @test */
    public function it_can_display_customers_list()
    {
        // Créer quelques clients de test
        Ecommerce_customer::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.customers.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Customers/list')
                ->has('customers.data', 3)
        );
    }

    /** @test */
    public function it_can_search_customers()
    {
        $customer = Ecommerce_customer::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com'
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.customers.index', ['search' => 'John']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('customers.data', 1)
        );
    }

    /** @test */
    public function it_can_filter_customers_by_status()
    {
        Ecommerce_customer::factory()->active()->count(2)->create();
        Ecommerce_customer::factory()->inactive()->count(1)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.customers.index', ['status' => 1]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('customers.data', 2)
        );
    }

    /** @test */
    public function it_can_create_a_customer()
    {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('customer.jpg', 800, 600);

        $data = [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'phone_one' => '+1234567890',
            'phone_two' => '+1234567891',
            'present_address' => '123 Main Street',
            'permanent_address' => '456 Oak Avenue',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'status' => 1,
            'image' => $image,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.customers.store'), $data);

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Client créé avec succès.');

        $this->assertDatabaseHas('ecommerce_customers', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'phone_one' => '+1234567890',
        ]);

        // Vérifier que l'image a été sauvegardée
        $customer = Ecommerce_customer::where('email', 'jane.smith@example.com')->first();
        $this->assertNotNull($customer->image);
        $this->assertTrue(Storage::disk('public')->exists($customer->image));
    }

    /** @test */
    public function it_validates_required_fields_when_creating_customer()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.customers.store'), []);

        $response->assertSessionHasErrors([
            'first_name',
            'last_name',
            'email',
            'phone_one',
            'present_address',
            'password'
        ]);
    }

    /** @test */
    public function it_validates_unique_email_when_creating_customer()
    {
        $existingCustomer = Ecommerce_customer::factory()->create([
            'email' => 'existing@example.com'
        ]);

        $data = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'existing@example.com',
            'phone_one' => '+1234567890',
            'present_address' => '123 Test Street',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.customers.store'), $data);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function it_can_update_a_customer()
    {
        $customer = Ecommerce_customer::factory()->create();

        $data = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
            'phone_one' => '+9876543210',
            'present_address' => '789 Updated Street',
            'status' => 0,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.customers.update', $customer->id), $data);

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Client mis à jour avec succès.');

        $this->assertDatabaseHas('ecommerce_customers', [
            'id' => $customer->id,
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
            'status' => 0,
        ]);
    }

    /** @test */
    public function it_can_update_customer_without_changing_password()
    {
        $customer = Ecommerce_customer::factory()->create([
            'password' => Hash::make('original_password')
        ]);

        $originalPassword = $customer->password;

        $data = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => $customer->email,
            'phone_one' => '+9876543210',
            'present_address' => '789 Updated Street',
            'status' => 1,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.customers.update', $customer->id), $data);

        $customer->refresh();
        $this->assertEquals($originalPassword, $customer->password);
    }

    /** @test */
    public function it_can_show_customer_details()
    {
        $customer = Ecommerce_customer::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.customers.show', $customer->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Customers/show')
                ->has('customer')
                ->has('orders')
                ->has('stats')
        );
    }

    /** @test */
    public function it_can_delete_customer_without_orders()
    {
        $customer = Ecommerce_customer::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.customers.destroy', $customer->id));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Client supprimé définitivement avec succès.');

        $this->assertDatabaseMissing('ecommerce_customers', [
            'id' => $customer->id
        ]);
    }

    /** @test */
    public function it_can_export_customers_to_csv()
    {
        Ecommerce_customer::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.customers.export'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="clients_export_' . date('Y-m-d') . '.csv"');
    }

    /** @test */
    public function unauthorized_user_cannot_access_customer_routes()
    {
        $customer = Ecommerce_customer::factory()->create();

        // Test sans authentification
        $response = $this->get(route('admin.customers.index'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('admin.customers.show', $customer->id));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('admin.customers.store'), []);
        $response->assertRedirect(route('login'));

        $response = $this->put(route('admin.customers.update', $customer->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('admin.customers.destroy', $customer->id));
        $response->assertRedirect(route('login'));
    }
}