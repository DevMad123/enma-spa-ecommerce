<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sell;
use App\Models\Sell_details;
use App\Models\Shipping;
use App\Models\PaymentMethod;
use App\Models\Ecommerce_customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Log;

class CartController extends Controller
{
    public function index()
    {
        return Inertia::render('Frontend/Cart/Index');
    }

    public function checkout()
    {
        $shippingMethods = Shipping::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        $paymentMethods = PaymentMethod::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        return Inertia::render('Frontend/Cart/Checkout', [
            'shippingMethods' => $shippingMethods,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function processCheckout(Request $request)
    {
        // Debug : Vérifier que la méthode est bien appelée
        Log::info('ProcessCheckout Data: ', $request->all());
        Log::info('ProcessCheckout called with method: ' . $request->method());
        Log::info('Request data keys: ' . implode(', ', array_keys($request->all())));
        Log::info('Cart items raw data:', ['cart_items' => $request->input('cart_items')]);

        try {
            $request->validate([
                // Items du panier
                'cart_items' => 'required|array|min:1',
                'cart_items.*.product_id' => 'required|exists:products,id',
                'cart_items.*.quantity' => 'required|integer|min:1',
                'cart_items.*.color_id' => 'nullable|integer',
                'cart_items.*.size_id' => 'nullable|integer',
                
                // Informations personnelles
                'email' => 'required|email|max:255',
                
                // Adresse de livraison
                'shipping_first_name' => 'required|string|max:255',
                'shipping_last_name' => 'required|string|max:255',
                'shipping_address' => 'required|string|max:500',
                'shipping_address_2' => 'nullable|string|max:500',
                'shipping_city' => 'required|string|max:255',
                'shipping_postal_code' => 'required|string|max:20',
                'shipping_country' => 'required|string|max:255',
                'shipping_phone' => 'required|string|max:20',
                
                // Adresse de facturation
                'billing_same_as_shipping' => 'boolean',
                'billing_first_name' => 'nullable|string|max:255',
                'billing_last_name' => 'nullable|string|max:255',
                'billing_address' => 'nullable|string|max:500',
                'billing_address_2' => 'nullable|string|max:500',
                'billing_city' => 'nullable|string|max:255',
                'billing_postal_code' => 'nullable|string|max:20',
                'billing_country' => 'nullable|string|max:255',
                
                // Méthodes
                'shipping_method_id' => 'required|exists:shippings,id',
                'payment_method_id' => 'required|exists:payment_methods,id',
                
                // Notes
                'order_notes' => 'nullable|string|max:500',
                
                // Total (optionnel pour le moment)
                // 'total' => 'required|numeric|min:0',
            ]);
            
            \Log::info('Validation passed successfully');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'failed_fields' => array_keys($e->errors())
            ]);
            throw $e;
        }

        // Debug temporaire : log des données reçues
        \Log::info('Checkout data received:', $request->all());
        \Log::info('Cart items details:', $request->input('cart_items', []));

        try {
            \Log::info('Starting transaction...');
            DB::beginTransaction();

            // Récupérer la méthode de paiement
            $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);
            \Log::info('Payment method found:', ['method' => $paymentMethod->code]);

            // Calculer totaux
            $cartItems = $request->cart_items;
            \Log::info('Processing cart items:', ['cart_items' => $cartItems]);
            
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                \Log::info('Processing item:', $item);
                $product = Product::findOrFail($item['product_id']);
                $itemTotal = $product->current_sale_price * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->current_sale_price,
                    'total_price' => $itemTotal,
                    'color_id' => $item['color_id'] ?? null,
                    'size_id' => $item['size_id'] ?? null,
                ];
            }

            // Récupérer méthode de livraison
            $shippingMethod = Shipping::findOrFail($request->shipping_method_id);
            $shippingCost = $shippingMethod->price;

            // Calculs finaux
            $totalVat = 0; // À implémenter selon vos règles
            $totalDiscount = 0; // À implémenter selon vos règles
            $totalPayable = $subtotal + $shippingCost + $totalVat - $totalDiscount;

            \Log::info('Order calculations:', [
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_payable' => $totalPayable,
                'items_count' => count($orderItems)
            ]);

            // Créer le customer si nécessaire
            $customer = null;
            if (Auth::check()) {
                $user = Auth::user();
                $customer = Ecommerce_customer::where('user_id', $user->id)->first();
                if (!$customer) {
                    // Extraire prénom et nom depuis le nom complet de l'utilisateur
                    $nameParts = explode(' ', $user->name, 2);
                    $firstName = $nameParts[0] ?? $request->shipping_first_name;
                    $lastName = $nameParts[1] ?? $request->shipping_last_name;
                    
                    $customer = Ecommerce_customer::create([
                        'user_id' => $user->id,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'email' => $user->email,
                        'phone_one' => $request->shipping_phone,
                        'present_address' => $request->shipping_address,
                        'password' => bcrypt('temp_password'), // Mot de passe temporaire
                        'status' => 1,
                    ]);
                }
            } else {
                // Commande invité - créer customer temporaire
                $customer = Ecommerce_customer::create([
                    'first_name' => $request->shipping_first_name,
                    'last_name' => $request->shipping_last_name,
                    'email' => $request->email,
                    'phone_one' => $request->shipping_phone,
                    'present_address' => $request->shipping_address,
                    'password' => bcrypt('temp_password'), // Mot de passe temporaire pour invité
                    'status' => 1,
                ]);
            }

            \Log::info('Customer created/found:', ['customer_id' => $customer->id]);

            // Créer la commande (Sell)
            $sell = Sell::create([
                'customer_id' => $customer->id,
                'invoice_number' => $this->generateInvoiceNumber(),
                'total_quantity' => array_sum(array_column($cartItems, 'quantity')),
                'total_amount' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_vat_amount' => $totalVat,
                'total_discount' => $totalDiscount,
                'total_payable_amount' => $totalPayable,
                'total_paid' => 0, // Sera mis à jour après paiement
                'total_due' => $totalPayable,
                'payment_status' => 0, // En attente
                'order_status' => 'pending',
                'shipping_status' => 'pending',
                'shipping_method_id' => $request->shipping_method_id,
                'payment_method_id' => $request->payment_method_id,
                'shipping_address' => $request->shipping_address,
                'shipping_phone' => $request->shipping_phone,
                'notes' => $request->order_notes,
                'created_by' => Auth::id(),
            ]);

            \Log::info('Sell created:', ['sell_id' => $sell->id]);

            // Créer les détails de commande (SellDetails)
            foreach ($orderItems as $item) {
                Sell_details::create([
                    'sell_id' => $sell->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'color_id' => $item['color_id'],
                    'size_id' => $item['size_id'],
                ]);

                // Mettre à jour le stock du produit
                $product = $item['product'];
                $product->available_quantity -= $item['quantity'];
                $product->save();
                
                \Log::info('Item processed:', ['product_id' => $item['product']->id, 'quantity' => $item['quantity']]);
            }

            \Log::info('Order created successfully, committing transaction...');
            DB::commit();
            \Log::info('Transaction committed successfully');

            // Retourner une réponse JSON pour toutes les requêtes AJAX (incluant Inertia)
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                \Log::info('Returning JSON response for AJAX/Inertia request');
                return response()->json([
                    'success' => true,
                    'order_id' => $sell->id,
                    'message' => 'Commande créée avec succès',
                    'redirect' => route('frontend.cart.success', $sell->id)
                ]);
            }

            // Pour les requêtes normales, redirection
            \Log::info('Returning redirect response');
            return redirect()->route('frontend.cart.success', $sell->id)
                ->with('success', 'Votre commande a été créée avec succès !');

        } catch (\Exception $e) {
            \Log::error('Checkout error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            DB::rollback();
            
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Une erreur est survenue lors de la création de votre commande.',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()
                ->with('error', 'Une erreur est survenue lors de la création de votre commande: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function orderSuccess($sellId)
    {
        $sell = Sell::with(['customer', 'sellDetails.product', 'shipping'])
            ->findOrFail($sellId);

        return Inertia::render('Frontend/Cart/OrderSuccess', [
            'order' => $sell,
        ]);
    }

    public function getProductForCart($productId)
    {
        $product = Product::with(['colors', 'sizes', 'brand'])
            ->findOrFail($productId);

        return response()->json([
            'product' => $product
        ]);
    }

    private function generateInvoiceNumber()
    {
        $lastSell = Sell::orderBy('id', 'desc')->first();
        $nextNumber = $lastSell ? ($lastSell->id + 1) : 1;
        
        return 'CMD-' . date('Ym') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}