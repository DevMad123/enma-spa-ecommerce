<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RealisationsController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::redirect('/', '/dashboard');
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/home-2', [HomeController::class, 'index2'])->name('home-2');
Route::get('/home-3', [HomeController::class, 'index3'])->name('home-3');
Route::get('/realisations', [RealisationsController::class, 'index'])->name('realisations');
Route::get('/a-propos-de-nous', [AboutController::class, 'index'])->name('a-propos-de-nous');
Route::get('/a-propos-de-nous-pro', [AboutController::class, 'indexPro'])->name('a-propos-de-nous-pro');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::resource('projects', ProjectController::class);
    Route::get('/tasks/my-tasks', [TaskController::class, 'myTasks'])
        ->name('tasks.myTasks');
    Route::resource('tasks', TaskController::class);
    Route::resource('users', UserController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
