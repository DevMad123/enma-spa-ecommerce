<?php

namespace Database\Seeders;

use App\Models\Ecommerce_customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un client de test spécifique
        Ecommerce_customer::updateOrCreate([
            'email' => 'john.doe@example.com',
        ], [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone_one' => '+1234567890',
            'phone_two' => '+1234567891',
            'present_address' => '123 Main Street, New York, NY 10001',
            'permanent_address' => '456 Oak Avenue, Los Angeles, CA 90001',
            'password' => Hash::make('password123'),
            'status' => 1,
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Créer un client premium avec image
        Ecommerce_customer::updateOrCreate([
            'email' => 'jane.smith@example.com',
        ], [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'phone_one' => '+1987654321',
            'present_address' => '789 Elm Street, Chicago, IL 60601',
            'password' => Hash::make('password123'),
            'status' => 1,
            'image' => 'customers/jane_smith.webp',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Créer un client inactif
        Ecommerce_customer::updateOrCreate([
            'email' => 'bob.johnson@example.com',
        ], [
            'first_name' => 'Bob',
            'last_name' => 'Johnson',
            'phone_one' => '+1555666777',
            'present_address' => '321 Pine Road, Miami, FL 33101',
            'password' => Hash::make('password123'),
            'status' => 0,
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Créer des clients aléatoires pour les tests
        if (!Ecommerce_customer::query()->exists()) {
            Ecommerce_customer::factory()
                ->count(15)
                ->active()
                ->createdBy(1)
                ->create();

        // Créer quelques clients premium
            Ecommerce_customer::factory()
                ->count(5)
                ->premium()
                ->createdBy(1)
                ->create();

        // Créer quelques clients inactifs
            Ecommerce_customer::factory()
                ->count(3)
                ->inactive()
                ->createdBy(1)
                ->create();

        // Créer des clients avec domaines spécifiques
            Ecommerce_customer::factory()
                ->count(2)
                ->withEmailDomain('gmail.com')
                ->active()
                ->createdBy(1)
                ->create();

            Ecommerce_customer::factory()
                ->count(2)
                ->withEmailDomain('yahoo.com')
                ->active()
                ->createdBy(1)
                ->create();
        }

        $this->command->info('✅ ' . Ecommerce_customer::count() . ' clients créés avec succès!');
    }
}
