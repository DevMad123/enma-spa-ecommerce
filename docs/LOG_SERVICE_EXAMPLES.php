<?php

/**
 * EXEMPLES D'UTILISATION DU SERVICE DE LOGS CENTRALISÉ
 * 
 * Ce fichier contient des exemples d'utilisation du LogService
 * dans différents contextes de l'application.
 */

use App\Services\LogService;

// ============================================
// LOGS DE COMMANDES
// ============================================

// Lors de la création d'une commande
LogService::order()->created($order);

// Lors de la mise à jour d'une commande
LogService::order()->updated($order, $oldStatus);

// Changement de statut
LogService::order()->statusChanged($order, 'pending', 'processing');

// Annulation
LogService::order()->cancelled($order, 'Client a demandé l\'annulation');

// Livraison
LogService::order()->delivered($order);

// Email envoyé
LogService::order()->emailSent($order);

// Échec de création
LogService::order()->failed($orderId, 'Stock insuffisant');


// ============================================
// LOGS DE PAIEMENTS
// ============================================

// Paiement initié
LogService::payment()->initiated($orderId, 'paypal', 150.00);

// Paiement réussi
LogService::payment()->success($orderId, 'PAYPAL-TXN-123', 'paypal', 150.00);

// Paiement échoué
LogService::payment()->failed($orderId, 'orange_money', 150.00, 'Solde insuffisant');

// Remboursement
LogService::payment()->refunded($orderId, 'PAYPAL-TXN-123', 150.00);

// Webhook reçu
LogService::payment()->webhookReceived('paypal', 'payment.completed', [
    'transaction_id' => 'PAYPAL-TXN-123',
    'amount' => 150.00,
]);


// ============================================
// LOGS SYSTÈME
// ============================================

// Backup
LogService::system()->backup('success', [
    'filename' => 'backup_2025-12-26.sql.gz',
    'size' => '21.49 KB',
]);

// Migration
LogService::system()->migration('completed', [
    'migrations' => 5,
]);

// Tâche planifiée
LogService::system()->scheduled('db:backup', 'success');

// Configuration modifiée
LogService::system()->configChanged('app.timezone', 'UTC', 'Africa/Dakar');

// Cache nettoyé
LogService::system()->cacheCleared('config');

// Démarrage de l'application
LogService::system()->startup(app()->environment());


// ============================================
// LOGS D'ERREURS
// ============================================

// Exception
try {
    // code qui peut échouer
} catch (\Exception $e) {
    LogService::error()->exception($e, [
        'context' => 'Payment processing',
        'order_id' => $orderId,
    ]);
}

// Erreur de base de données
LogService::error()->database('SELECT * FROM orders', 'Connection timeout');

// Erreur de validation
LogService::error()->validation($validator->errors(), $request->all());

// Erreur d'authentification
LogService::error()->authentication('invalid_credentials', [
    'email' => $email,
    'ip' => request()->ip(),
]);

// Ressource non trouvée
LogService::error()->notFound('Order', $orderId);


// ============================================
// LOGS UTILISATEURS
// ============================================

// Inscription
LogService::user()->registered($user);

// Connexion
LogService::user()->login($user);

// Déconnexion
LogService::user()->logout($user);

// Échec de connexion
LogService::user()->loginFailed($email, 'Invalid credentials');

// Changement de mot de passe
LogService::user()->passwordChanged($user);

// Suppression
LogService::user()->deleted($userId, $email);


// ============================================
// LOGS D'INVENTAIRE
// ============================================

// Stock mis à jour
LogService::inventory()->stockUpdated($product, 50, 45);

// Stock faible
LogService::inventory()->lowStock($product, 5, 10);

// Rupture de stock
LogService::inventory()->outOfStock($product);

// Prix modifié
LogService::inventory()->priceChanged($product, 100.00, 120.00);


// ============================================
// EXEMPLES D'INTÉGRATION DANS LES CONTROLLERS
// ============================================

/**
 * Dans OrderController.php
 */
class OrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            $order = Sell::create($request->validated());
            
            // Logger la création
            LogService::order()->created($order);
            
            return response()->json($order, 201);
            
        } catch (\Exception $e) {
            // Logger l'erreur
            LogService::error()->exception($e, [
                'action' => 'store_order',
                'input' => $request->all(),
            ]);
            
            return response()->json(['error' => 'Failed to create order'], 500);
        }
    }
    
    public function updateStatus(Request $request, $id)
    {
        $order = Sell::findOrFail($id);
        $oldStatus = $order->status;
        
        $order->update(['status' => $request->status]);
        
        // Logger le changement de statut
        LogService::order()->statusChanged($order, $oldStatus, $request->status);
        
        return response()->json($order);
    }
}

/**
 * Dans PaymentController.php
 */
class PaymentController extends Controller
{
    public function process(Request $request)
    {
        $orderId = $request->order_id;
        $amount = $request->amount;
        $method = $request->payment_method;
        
        // Logger l'initiation
        LogService::payment()->initiated($orderId, $method, $amount);
        
        try {
            $result = $this->paymentGateway->charge($amount, $method);
            
            if ($result->success) {
                // Logger le succès
                LogService::payment()->success(
                    $orderId,
                    $result->transactionId,
                    $method,
                    $amount
                );
                
                return response()->json(['success' => true]);
            }
            
        } catch (\Exception $e) {
            // Logger l'échec
            LogService::payment()->failed($orderId, $method, $amount, $e->getMessage());
            LogService::error()->exception($e);
            
            return response()->json(['error' => 'Payment failed'], 500);
        }
    }
}

/**
 * Dans AuthController.php
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Logger la connexion réussie
            LogService::user()->login($user);
            
            return response()->json(['token' => $user->createToken('auth')->plainTextToken]);
        }
        
        // Logger l'échec de connexion
        LogService::user()->loginFailed($request->email, 'Invalid credentials');
        
        return response()->json(['error' => 'Invalid credentials'], 401);
    }
    
    public function register(Request $request)
    {
        $user = User::create($request->validated());
        
        // Logger l'inscription
        LogService::user()->registered($user);
        
        return response()->json($user, 201);
    }
}

/**
 * Dans ProductController.php
 */
class ProductController extends Controller
{
    public function updateStock(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $oldStock = $product->available_quantity;
        $newStock = $request->stock;
        
        $product->update(['available_quantity' => $newStock]);
        
        // Logger la mise à jour du stock
        LogService::inventory()->stockUpdated($product, $oldStock, $newStock);
        
        // Vérifier si le stock est faible
        if ($newStock <= 10 && $newStock > 0) {
            LogService::inventory()->lowStock($product, $newStock, 10);
        }
        
        // Vérifier si rupture de stock
        if ($newStock == 0) {
            LogService::inventory()->outOfStock($product);
        }
        
        return response()->json($product);
    }
}


// ============================================
// CONSULTATION DES LOGS VIA ARTISAN
// ============================================

// Voir les logs de commandes (50 dernières lignes)
// php artisan logs:view orders

// Voir les logs de paiements
// php artisan logs:view payments

// Voir les logs système
// php artisan logs:view system

// Voir les logs d'erreurs
// php artisan logs:view errors

// Voir les logs utilisateurs
// php artisan logs:view users

// Options avancées :

// Afficher plus de lignes
// php artisan logs:view orders --lines=100

// Filtrer par niveau
// php artisan logs:view errors --level=error

// Rechercher un terme
// php artisan logs:view payments --search="PAYPAL"

// Voir uniquement aujourd'hui
// php artisan logs:view orders --today

// Suivre en temps réel
// php artisan logs:view orders --follow

// Combinaisons
// php artisan logs:view payments --today --level=error --search="failed"
