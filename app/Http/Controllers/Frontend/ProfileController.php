<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Sell;
use App\Models\User;
use App\Models\Ecommerce_customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{


    public function index()
    {
        $user = Auth::user();
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();
        
        // Récupérer les commandes récentes
        $recentOrders = [];
        if ($customer) {
            $recentOrders = Sell::with(['shipping', 'sell_details.product'])
                ->where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        }

        return Inertia::render('Frontend/Profile/Index', [
            'user' => $user,
            'customer' => $customer,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function orders(Request $request)
    {
        $user = Auth::user();
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();
        
        if (!$customer) {
            return redirect()->route('frontend.profile.index')
                ->with('error', 'Aucun profil client trouvé.');
        }

        $query = Sell::with(['shipping', 'sell_details.product'])
            ->where('customer_id', $customer->id);

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        // Filtre par période
        if ($request->filled('period')) {
            switch ($request->period) {
                case 'last_month':
                    $query->where('created_at', '>=', now()->subMonth());
                    break;
                case 'last_3_months':
                    $query->where('created_at', '>=', now()->subMonths(3));
                    break;
                case 'last_year':
                    $query->where('created_at', '>=', now()->subYear());
                    break;
            }
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Frontend/Profile/Orders', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'period']),
        ]);
    }

    public function orderDetails($orderId)
    {
        $user = Auth::user();
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();
        
        if (!$customer) {
            return redirect()->route('frontend.profile.index')
                ->with('error', 'Aucun profil client trouvé.');
        }

        $order = Sell::with([
            'customer',
            'shipping', 
            'sell_details.product.brand',
            'sell_details.color',
            'sell_details.size'
        ])
        ->where('customer_id', $customer->id)
        ->findOrFail($orderId);

        return Inertia::render('Frontend/Profile/OrderDetails', [
            'order' => $order,
        ]);
    }

    public function edit()
    {
        $user = Auth::user();
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();

        return Inertia::render('Frontend/Profile/Edit', [
            'user' => $user,
            'customer' => $customer,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
        ]);

        // Vérifier le mot de passe actuel si un nouveau est fourni
        if ($request->filled('password')) {
            if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
                return redirect()->back()->withErrors([
                    'current_password' => 'Le mot de passe actuel est incorrect.',
                ]);
            }
        }

        // Mettre à jour l'utilisateur
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        // Mettre à jour ou créer le profil client
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();
        
        $customerData = [
            'user_id' => $user->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'status' => 1,
        ];

        if ($customer) {
            $customer->update($customerData);
        } else {
            Ecommerce_customer::create($customerData);
        }

        return redirect()->route('frontend.profile.index')
            ->with('success', 'Votre profil a été mis à jour avec succès.');
    }

    public function addresses()
    {
        $user = Auth::user();
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();

        return Inertia::render('Frontend/Profile/Addresses', [
            'user' => $user,
            'customer' => $customer,
        ]);
    }
}
