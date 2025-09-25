<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sell;
use App\Models\Sell_details;
use App\Models\Shipping;
use App\Models\Ecommerce_customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

        return Inertia::render('Frontend/Cart/Checkout', [
            'shippingMethods' => $shippingMethods,
        ]);
    }

    public function processCheckout(Request $request)
    {
        $request->validate([
            'cart_items' => 'required|array|min:1',
            'cart_items.*.product_id' => 'required|exists:products,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.color_id' => 'nullable|exists:product_colors,id',
            'cart_items.*.size_id' => 'nullable|exists:product_sizes,id',
            'shipping_address' => 'required|string|max:500',
            'shipping_phone' => 'required|string|max:20',
            'shipping_method_id' => 'required|exists:shippings,id',
            'payment_method' => 'required|in:cash,stripe,paypal,orange_money',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Calculer totaux
            $cartItems = $request->cart_items;
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
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

            // Créer le customer si nécessaire
            $customer = null;
            if (Auth::check()) {
                $user = Auth::user();
                $customer = Ecommerce_customer::where('user_id', $user->id)->first();
                if (!$customer) {
                    $customer = Ecommerce_customer::create([
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $request->shipping_phone,
                        'address' => $request->shipping_address,
                        'status' => 1,
                    ]);
                }
            } else {
                // Commande invité - créer customer temporaire
                $customer = Ecommerce_customer::create([
                    'name' => $request->guest_name ?? 'Client invité',
                    'email' => $request->guest_email ?? 'guest@example.com',
                    'phone' => $request->shipping_phone,
                    'address' => $request->shipping_address,
                    'status' => 1,
                ]);
            }

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
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'shipping_status' => 'pending',
                'shipping_method_id' => $request->shipping_method_id,
                'shipping_address' => $request->shipping_address,
                'shipping_phone' => $request->shipping_phone,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'created_by' => Auth::id(),
            ]);

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
            }

            DB::commit();

            return redirect()->route('frontend.order.success', $sell->id)
                ->with('success', 'Votre commande a été créée avec succès !');

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()->back()
                ->with('error', 'Une erreur est survenue lors de la création de votre commande.')
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