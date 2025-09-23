<?php

namespace Database\Factories;

use App\Models\Ecommerce_customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ecommerce_customer>
 */
class Ecommerce_customerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Ecommerce_customer::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone_one' => $this->faker->phoneNumber(),
            'phone_two' => $this->faker->optional(0.3)->phoneNumber(),
            'present_address' => $this->faker->address(),
            'permanent_address' => $this->faker->optional(0.7)->address(),
            'password' => Hash::make('password123'), // Mot de passe par défaut
            'status' => $this->faker->randomElement([0, 1]),
            'image' => null, // Par défaut pas d'image
            'created_by' => null,
            'updated_by' => null,
            'deleted_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the customer is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
        ]);
    }

    /**
     * Indicate that the customer is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Indicate that the customer has an image.
     */
    public function withImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'image' => 'customers/customer_' . Str::random(10) . '.webp',
        ]);
    }

    /**
     * Create a customer with specific creator.
     */
    public function createdBy($userId): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);
    }

    /**
     * Create a customer with a specific email domain.
     */
    public function withEmailDomain($domain): static
    {
        return $this->state(fn (array $attributes) => [
            'email' => $this->faker->userName() . '@' . $domain,
        ]);
    }

    /**
     * Create a customer with complete address information.
     */
    public function withCompleteAddress(): static
    {
        return $this->state(fn (array $attributes) => [
            'present_address' => $this->faker->streetAddress() . ', ' . $this->faker->city() . ', ' . $this->faker->state(),
            'permanent_address' => $this->faker->streetAddress() . ', ' . $this->faker->city() . ', ' . $this->faker->state(),
            'phone_two' => $this->faker->phoneNumber(),
        ]);
    }

    /**
     * Create a premium customer (active with complete info).
     */
    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'present_address' => $this->faker->streetAddress() . ', ' . $this->faker->city() . ', ' . $this->faker->state(),
            'permanent_address' => $this->faker->streetAddress() . ', ' . $this->faker->city() . ', ' . $this->faker->state(),
            'phone_two' => $this->faker->phoneNumber(),
            'image' => 'customers/customer_' . Str::random(10) . '.webp',
        ]);
    }
}