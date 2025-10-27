<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sell;
use App\Models\Sell_details;
use App\Models\SellOrderAddress;
use App\Models\Shipping;
use App\Models\PaymentMethod;
use App\Models\Ecommerce_customer;
use App\Models\User;
use App\Models\Notification as CustomNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Notifications\NewOrderNotification;
use App\Mail\OrderConfirmationMail;

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
            ->select(['id', 'name', 'description', 'price', 'estimated_days', 'supports_free_shipping', 'free_shipping_threshold'])
            ->get();

        $paymentMethods = PaymentMethod::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        return Inertia::render('Frontend/Cart/Checkout', [
            'shippingMethods' => $shippingMethods,
            'paymentMethods' => $paymentMethods,
            'availableCountries' => \App\Models\TaxRule::getCountriesWithTaxRates(),
            'defaultCountry' => \App\Models\TaxRule::getDefaultCountryCode(),
            'isInternationalShippingEnabled' => true, // Simplifié, basé sur les TaxRules actives
        ]);
    }

    public function processCheckout(Request $request)
    {
        // Protection contre les soumissions multiples
        $cacheKey = 'checkout_processing_' . session()->getId() . '_' . md5(json_encode($request->only(['email', 'cart_items'])));
        if (cache()->has($cacheKey)) {
            Log::warning('Duplicate checkout attempt detected', ['cache_key' => $cacheKey]);

            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Une commande est déjà en cours de traitement.',
                ], 429);
            }

            return redirect()->back()
                ->with('error', 'Une commande est déjà en cours de traitement.');
        }

        // Marquer comme en cours de traitement pour 60 secondes
        cache()->put($cacheKey, true, 60);

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
                'cart_items.*.product_variant_id' => 'nullable|integer|exists:product_variants,id',

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

            Log::info('Validation passed successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'failed_fields' => array_keys($e->errors())
            ]);
            throw $e;
        }

        // Debug temporaire : log des données reçues
        Log::info('Checkout data received:', $request->all());
        Log::info('Cart items details:', $request->input('cart_items', []));

        try {
            Log::info('Starting transaction...');
            DB::beginTransaction();

            // Récupérer la méthode de paiement
            $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);
            Log::info('Payment method found:', ['method' => $paymentMethod->code]);

            // Calculer totaux
            $cartItems = $request->cart_items;
            Log::info('Processing cart items:', ['cart_items' => $cartItems]);

            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                Log::info('Processing item:', $item);
                $product = Product::findOrFail($item['product_id']);
                // Determine unit price based on variant when available
                $unitPrice = $product->current_sale_price;
                $variant = null;
                if (!empty($item['product_variant_id'])) {
                    $variant = \App\Models\ProductVariant::where('id', $item['product_variant_id'])
                        ->where('product_id', $product->id)
                        ->first();
                    if ($variant) {
                        $unitPrice = (float) ($variant->sale_price ?? $unitPrice);
                    }
                }
                $itemTotal = $unitPrice * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'product' => $product,
                    'variant' => $variant,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                    'color_id' => $item['color_id'] ?? null,
                    'size_id' => $item['size_id'] ?? null,
                ];
            }

            // Récupérer méthode de livraison
            $shippingMethod = Shipping::findOrFail($request->shipping_method_id);
            $shippingCost = $shippingMethod->price;

            // Calculs finaux avec TVA dynamique selon le pays
            $shippingCountryCode = $this->getCountryCodeFromName($request->shipping_country);

            // Utiliser les TaxRules au lieu des settings
            // $taxRule = \App\Models\TaxRule::getByCountryCode($shippingCountryCode) ?? \App\Models\TaxRule::getDefault();
            $taxRule = \App\Models\TaxRule::getByCountryCode($request->defaultCountryCode) ?? \App\Models\TaxRule::getDefault();
            $totalVat = $taxRule ? $taxRule->calculateTax($subtotal) : 0;
            $taxRate = $taxRule ? $taxRule->tax_rate : 0;
            $totalDiscount = 0; // À implémenter selon vos règles
            $totalPayable = $subtotal + $shippingCost + $totalVat - $totalDiscount;

            Log::info('Order calculations:', [
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'shipping_country' => $request->shipping_country,
                'shipping_country_code' => $shippingCountryCode,
                'tax_rate' => $taxRate,
                'total_vat' => $totalVat,
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

            Log::info('Customer created/found:', ['customer_id' => $customer->id]);

            // Récupérer la méthode de livraison pour le nom
            $shippingMethodName = $shippingMethod->name ?? null;

            // Créer la commande (Sell)
            $sell = Sell::create([
                'customer_id' => $customer->id,
                'order_reference' => $this->generateInvoiceNumber(),
                'invoice_id' => null, // Sera généré après validation du paiement
                'sell_type' => 2, // 2 = ecommerce_sell
                'sell_by' => null, // Sera défini après validation du paiement
                'shipping_cost' => $shippingCost,
                'shipping_method' => $shippingMethodName,
                'total_vat_amount' => $totalVat,
                'total_discount' => $totalDiscount,
                'total_payable_amount' => $totalPayable,
                'grand_total' => $totalPayable,
                'total_paid' => 0, // Sera mis à jour après paiement
                'total_due' => $totalPayable,
                'payment_status' => 0, // En attente
                'order_status' => 0, // 0=pending
                'shipping_status' => 'pending',
                'shipping_id' => $request->shipping_method_id,
                'payment_method_id' => $request->payment_method_id,
                'notes' => $request->order_notes,
                'date' => now(),
                'created_by' => Auth::id(),
            ]);

            Log::info('Sell created:', ['sell_id' => $sell->id]);

            // Créer l'adresse de livraison
            SellOrderAddress::create([
                'sell_id' => $sell->id,
                'user_id' => Auth::id(),
                'type' => 'shipping',
                'first_name' => $request->shipping_first_name,
                'last_name' => $request->shipping_last_name,
                'email' => $request->email,
                'phone' => $request->shipping_phone,
                'address' => $request->shipping_address . ($request->shipping_address_2 ? ', ' . $request->shipping_address_2 : ''),
                'city' => $request->shipping_city,
                'zip' => $request->shipping_postal_code,
                'country' => $request->shipping_country,
                'note' => $request->order_notes,
            ]);

            // Créer l'adresse de facturation (si différente)
            if (!$request->billing_same_as_shipping) {
                SellOrderAddress::create([
                    'sell_id' => $sell->id,
                    'user_id' => Auth::id(),
                    'type' => 'billing',
                    'first_name' => $request->billing_first_name,
                    'last_name' => $request->billing_last_name,
                    'email' => $request->email,
                    'phone' => $request->shipping_phone, // ou billing_phone si disponible
                    'address' => $request->billing_address . ($request->billing_address_2 ? ', ' . $request->billing_address_2 : ''),
                    'city' => $request->billing_city,
                    'zip' => $request->billing_postal_code,
                    'country' => $request->billing_country,
                ]);
            } else {
                // Dupliquer l'adresse de livraison pour la facturation
                SellOrderAddress::create([
                    'sell_id' => $sell->id,
                    'user_id' => Auth::id(),
                    'type' => 'billing',
                    'first_name' => $request->shipping_first_name,
                    'last_name' => $request->shipping_last_name,
                    'email' => $request->email,
                    'phone' => $request->shipping_phone,
                    'address' => $request->shipping_address . ($request->shipping_address_2 ? ', ' . $request->shipping_address_2 : ''),
                    'city' => $request->shipping_city,
                    'zip' => $request->shipping_postal_code,
                    'country' => $request->shipping_country,
                ]);
            }

            Log::info('Sell created:', ['sell_id' => $sell->id]);

            // Créer les détails de commande (SellDetails)
            foreach ($orderItems as $item) {
                Sell_details::create([
                    'sell_id' => $sell->id,
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant']->id ?? null,
                    'unit_sell_price' => $item['unit_price'],
                    'sale_quantity' => $item['quantity'],
                    'total_payable_amount' => $item['total_price'],
                    'unit_vat' => 0, // Default to 0
                    'total_discount' => 0, // Default to 0
                    'status' => 1, // Active
                    'created_by' => Auth::id(),
                ]);

                // Decrement variant stock if applicable
                if (!empty($item['variant'])) {
                    $v = $item['variant'];
                    $v->available_quantity = max(0, ($v->available_quantity ?? 0) - $item['quantity']);
                    $v->save();
                    Log::info('Variant stock decremented', ['variant_id' => $v->id, 'new_available_quantity' => $v->available_quantity]);
                }

                // Mettre à jour le stock du produit
                // $product = $item['product'];
                // $product->available_quantity -= $item['quantity'];
                // $product->save();
                Product::where('id', $item['product']->id)
                    ->decrement('available_quantity', $item['quantity']);

                Log::info('Item processed:', ['product_id' => $item['product']->id, 'quantity' => $item['quantity']]);
            }

            Log::info('Order created successfully, committing transaction...');
            DB::commit();
            Log::info('Transaction committed successfully');

            // Envoyer les notifications après la création de la commande
            try {
                Log::info('Starting notification sending process...');

                // 1. Charger la commande avec les relations nécessaires
                $orderWithRelations = Sell::with(['customer', 'sellDetails.product', 'paymentMethod'])->find($sell->id);

                // 2. Notification aux administrateurs - utiliser le système personnalisé
                Log::info('Creating admin notifications for order: ' . $sell->id);
                $notificationCount = $this->createAdminNotification($orderWithRelations);
                Log::info("Created {$notificationCount} admin notifications");

                // 3. Email aux admins (en plus des notifications)
                $adminUsers = User::whereHas('roles', function($query) {
                    $query->whereIn('name', ['Admin', 'Manager']);
                })->get();

                if ($adminUsers->count() > 0) {
                    Log::info('Sending email notification to ' . $adminUsers->count() . ' admin users');
                    Notification::send($adminUsers, new NewOrderNotification($orderWithRelations));
                    Log::info('Admin email notifications sent successfully');
                }

                // 3. Email de confirmation au client
                Log::info('Sending confirmation email to customer: ' . $customer->email);
                Mail::to($customer->email)->queue(new OrderConfirmationMail($orderWithRelations));
                Log::info('Customer confirmation email queued successfully');

            } catch (\Exception $e) {
                Log::error('Error sending notifications:', [
                    'error' => $e->getMessage(),
                    'order_id' => $sell->id,
                    'trace' => $e->getTraceAsString()
                ]);
                // Ne pas faire échouer la commande si les notifications échouent
            }

            // Supprimer le cache de protection anti-duplication
            cache()->forget($cacheKey);

            // Retourner une réponse JSON pour toutes les requêtes AJAX (incluant Inertia)
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                Log::info('Returning JSON response for AJAX/Inertia request');
                return response()->json([
                    'success' => true,
                    'order_id' => $sell->id,
                    'message' => 'Commande créée avec succès',
                    'redirect' => route('frontend.cart.success', $sell->id)
                ]);
            }

            // Pour les requêtes normales, redirection
            Log::info('Returning redirect response');
            return redirect()->route('frontend.cart.success', $sell->id)
                ->with('success', 'Votre commande a été créée avec succès !');

        } catch (\Exception $e) {
            Log::error('Checkout error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            DB::rollback();

            // Supprimer le cache en cas d'erreur aussi
            cache()->forget($cacheKey);

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
        // Vérification de sécurité : s'assurer que l'utilisateur peut accéder à cette commande
        if (Auth::check()) {
            // Utilisateur connecté : vérifier que la commande lui appartient
            $user = Auth::user();
            $customer = Ecommerce_customer::where('user_id', $user->id)->first();

            if (!$customer) {
                abort(403, 'Accès non autorisé.');
            }

        $sell = Sell::with([
            'customer',
            'sellDetails.product',
            'sellDetails.productVariant.color',
            'sellDetails.productVariant.size',
            'paymentMethod',
            'shipping',
            'shippingAddress',
            'billingAddress'
        ])
                ->where('customer_id', $customer->id) // Vérifier la propriété
                ->where('created_at', '>=', now()->subHours(24)) // Limite de 24h pour la page de succès
                ->findOrFail($sellId);
        } else {
            // Pour les invités, on pourrait ajouter une vérification par session ou token
            // Pour l'instant, refuser l'accès si non connecté
            return redirect()->route('login')
                ->with('error', 'Vous devez être connecté pour accéder à cette page.');
        }

        Log::info('Order sell details:', $sell->toArray());

        // Récupérer la méthode de livraison séparément (pas de relation directe)
        $shippingMethod = null;
        if ($sell->shipping_id) {
            $shippingMethod = Shipping::find($sell->shipping_id);
        }

        // Calculer le sous-total à partir des détails de commande
        $subtotal = $sell->sellDetails->sum(function ($detail) {
            return floatval($detail->unit_sell_price ?? 0) * intval($detail->sale_quantity ?? 1);
        });

        $shippingCost = floatval($sell->shipping_cost ?? 0);
        $tax = floatval($sell->total_vat_amount ?? 0);

        // Si la TVA est 0 mais qu'on a une règle de TVA, calculer la TVA
        if ($tax == 0 && $subtotal > 0) {
            // Utiliser les TaxRules au lieu des settings
            $defaultTaxRule = \App\Models\TaxRule::getDefault();
            if ($defaultTaxRule) {
                $tax = $defaultTaxRule->calculateTax($subtotal);
            }
        }

        $total = floatval($sell->total_payable_amount ?? ($subtotal + $shippingCost + $tax));

        // Récupérer les adresses de livraison et facturation
        $shippingAddress = $sell->shippingAddress;
        $billingAddress = $sell->billingAddress;

        $formattedOrder = [
            'id' => $sell->id,
            'order_number' => $sell->order_reference ?? 'ORD-' . $sell->id,
            'status' => $sell->shipping_status ?? 'pending',
            'created_at' => $sell->created_at,
            'total' => $total,
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'tax' => $tax,
            'notes' => $sell->notes,

            // Adresse de livraison depuis sell_order_addresses
            'shipping_first_name' => $shippingAddress->first_name ?? $sell->customer->first_name ?? '',
            'shipping_last_name' => $shippingAddress->last_name ?? $sell->customer->last_name ?? '',
            'shipping_address' => $shippingAddress->address ?? $sell->customer->present_address ?? '',
            'shipping_address_2' => null,
            'shipping_postal_code' => $shippingAddress->zip ?? '',
            'shipping_city' => $shippingAddress->city ?? '',
            'shipping_country' => $shippingAddress->country ?? 'France',
            'shipping_phone' => $shippingAddress->phone ?? $sell->customer->phone_one ?? '',

            // Adresse de facturation depuis sell_order_addresses
            'billing_first_name' => $billingAddress->first_name ?? $shippingAddress->first_name ?? '',
            'billing_last_name' => $billingAddress->last_name ?? $shippingAddress->last_name ?? '',
            'billing_address' => $billingAddress->address ?? $shippingAddress->address ?? '',
            'billing_postal_code' => $billingAddress->zip ?? $shippingAddress->zip ?? '',
            'billing_city' => $billingAddress->city ?? $shippingAddress->city ?? '',
            'billing_country' => $billingAddress->country ?? $shippingAddress->country ?? 'France',
            'billing_phone' => $billingAddress->phone ?? $shippingAddress->phone ?? '',

            // Méthodes
            'payment_method' => $sell->paymentMethod,
            'shipping_method' => $sell->shipping ?? $shippingMethod,

            // Articles commandés
            'items' => $sell->sellDetails->map(function ($detail) {
                return [
                    'product_name' => $detail->product->name ?? 'Produit inconnu',
                    'product_image' => $detail->product->image ?? '/images/placeholder.jpg',
                    'quantity' => intval($detail->sale_quantity ?? 1),
                    'price' => floatval($detail->unit_sell_price ?? 0),
                    'color_name' => optional($detail->productVariant?->color)->name,
                    'size_name' => optional($detail->productVariant?->size)->size,
                ];
            }),
        ];

        return Inertia::render('Frontend/Cart/Success', [
            'order' => $formattedOrder,
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

    /**
     * Créer une notification personnalisée pour les admins
     */
    private function createAdminNotification($order)
    {
        // Utiliser les bons noms de champs pour le client
        $customerName = trim(($order->customer->first_name ?? '') . ' ' . ($order->customer->last_name ?? ''));
        if (empty($customerName)) {
            $customerName = $order->customer->email ?? 'Client inconnu';
        }

        // Utiliser le bon champ pour le montant
        $totalAmount = $order->total_payable_amount ?? $order->grand_total ?? 0;

        // Créer une notification dans la table personnalisée pour chaque admin
        $adminUsers = User::whereHas('roles', function($query) {
            $query->whereIn('name', ['Admin', 'Manager']);
        })->get();

        foreach ($adminUsers as $admin) {
            CustomNotification::create([
                'type' => 'new_order',
                'title' => 'Nouvelle commande #' . $order->id,
                'message' => 'Nouvelle commande de ' . $customerName . ' pour un montant de ' . number_format((float)$totalAmount, 0, ',', ' ') . ' XOF',
                'data' => json_encode([
                    'order_id' => $order->id,
                    'customer_name' => $customerName,
                    'customer_email' => $order->customer->email,
                    'total_amount' => $totalAmount,
                    'payment_method' => $order->paymentMethod->name ?? 'Non spécifié',
                    'created_at' => $order->created_at
                ]),
                'user_id' => $admin->id,
                'action_url' => '/admin/sells/' . $order->id,
                'icon' => 'shopping-cart',
                'color' => 'green'
            ]);
        }

        Log::info('Admin notifications created for ' . $adminUsers->count() . ' users');
        return $adminUsers->count();
    }

    /**
     * Convertir le nom du pays en code ISO
     */
    private function getCountryCodeFromName($countryName)
    {
        $countryMap = [
            'Côte D\'Ivoire' => 'CI',
            'France' => 'FR',
            'Belgique' => 'BE',
            'Suisse' => 'CH',
            'Luxembourg' => 'LU',
            'Allemagne' => 'DE',
            'Italie' => 'IT',
            'Espagne' => 'ES',
        ];

        return $countryMap[$countryName] ?? 'CI'; // Fallback sur Côte D'Ivoire
    }
}
