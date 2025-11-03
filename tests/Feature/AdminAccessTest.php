<?php

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redirects a customer to home when accessing admin dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/admin');

    $response->assertRedirect(route('home'));
    $response->assertSessionHas('error', 'Vous devez avoir un rôle admin/manager pour accéder au back-office.');
});

it('allows admin to access admin dashboard', function () {
    $user = User::factory()->create();
    $adminRole = Role::create(['name' => 'admin', 'status' => 1]);
    $user->roles()->attach($adminRole->id);

    $this->actingAs($user)->get('/admin')->assertOk();
});

it('allows manager to access admin dashboard', function () {
    $user = User::factory()->create();
    $managerRole = Role::create(['name' => 'manager', 'status' => 1]);
    $user->roles()->attach($managerRole->id);

    $this->actingAs($user)->get('/admin')->assertOk();
});

