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


    public function index(Request $request)
    {
        $user = Auth::user();
        $customer = Ecommerce_customer::where('user_id', $user->id)->first();

        // Récupérer les commandes récentes pour l'onglet par défaut
        $recentOrders = [];
        // Récupérer toutes les commandes pour l'onglet orders
        $allOrders = [];

        if ($customer) {
            $recentOrdersRaw = Sell::with(['shipping', 'sellDetails.product'])
                ->where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Formater les commandes récentes
            $recentOrders = $recentOrdersRaw->map(function ($sell) {
                return [
                    'id' => $sell->id,
                    'order_number' => $sell->order_reference,
                    'status' => $sell->frontend_status,
                    'created_at' => $sell->created_at,
                    'total' => number_format(floatval($sell->total_payable_amount), 2),
                    'shipping_method' => $sell->shipping,
                ];
            })->toArray();

            // Pour l'onglet orders, récupérer toutes les commandes
            $allOrdersRaw = Sell::with(['shipping', 'sellDetails.product', 'paymentMethod'])
                ->where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Formater les données pour le composant React
            $allOrders = $allOrdersRaw->map(function ($sell) {
                return [
                    'id' => $sell->id,
                    'order_number' => $sell->order_reference,
                    'status' => $sell->frontend_status, // Utiliser la nouvelle méthode
                    'created_at' => $sell->created_at,
                    'total' => number_format(floatval($sell->total_payable_amount), 2),
                    'shipping_method' => $sell->shipping,
                    'payment_method' => $sell->paymentMethod,
                    'items' => $sell->sellDetails->map(function ($detail) {
                        return [
                            'product_name' => $detail->product->name,
                            'product_image' => $detail->product->image ?? '/images/placeholder.jpg',
                            'quantity' => intval($detail->sale_quantity),
                            'price' => floatval($detail->unit_sell_price),
                        ];
                    })->toArray(),
                ];
            })->toArray();
        }

        return Inertia::render('Frontend/Profile/Index', [
            'user' => $user,
            'customer' => $customer,
            'recentOrders' => $recentOrders,
            'orders' => $allOrders, // Pour l'onglet orders
        ]);
    }

    public function orders(Request $request)
    {
        // Rediriger vers la page index avec l'onglet orders actif
        return redirect()->route('frontend.profile.index', ['tab' => 'orders']);
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
            'shippingAddress',
            'billingAddress',
            'paymentMethod',
            'sellDetails.product.brand',
            'sellDetails.color',
            'sellDetails.size',
            'sellDetails.productVariant'
        ])
        ->where('customer_id', $customer->id)
        ->findOrFail($orderId);

        // Ajouter le statut frontend à l'objet order
        $order->frontend_status_value = $order->frontend_status;

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
