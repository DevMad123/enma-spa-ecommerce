<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'wishlistItems' => $user ? $user->wishlistItems()->with(['product.category', 'product.brand'])->get() : [],
            'flash' => [
                'upload_success' => $request->session()->get('upload_success'),
                'upload_error' => $request->session()->get('upload_error'),
                'delete_success' => $request->session()->get('delete_success'),
                'delete_error' => $request->session()->get('delete_error'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
