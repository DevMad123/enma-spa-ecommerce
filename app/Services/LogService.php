<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Service centralisé de logging pour toute l'application
 * 
 * Utilisation:
 * - LogService::order()->created($order);
 * - LogService::payment()->success($payment);
 * - LogService::system()->backup('success', $details);
 * - LogService::error()->exception($exception, $context);
 */
class LogService
{
    /**
     * Logs liés aux commandes
     */
    public static function order()
    {
        return new class {
            private function log($level, $message, $context = [])
            {
                Log::channel('orders')->$level('[ORDER] ' . $message, array_merge([
                    'user_id' => Auth::id(),
                    'timestamp' => now()->toDateTimeString(),
                    'ip' => request()->ip(),
                ], $context));
            }

            public function created($order)
            {
                $this->log('info', "Commande créée #{$order->id}", [
                    'order_id' => $order->id,
                    'customer_id' => $order->customer_id,
                    'total' => $order->total_amount,
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                ]);
            }

            public function updated($order, $oldStatus = null)
            {
                $this->log('info', "Commande mise à jour #{$order->id}", [
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $order->status,
                ]);
            }

            public function statusChanged($order, $oldStatus, $newStatus)
            {
                $this->log('info', "Statut changé #{$order->id}: {$oldStatus} → {$newStatus}", [
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ]);
            }

            public function cancelled($order, $reason = null)
            {
                $this->log('warning', "Commande annulée #{$order->id}", [
                    'order_id' => $order->id,
                    'reason' => $reason,
                ]);
            }

            public function delivered($order)
            {
                $this->log('info', "Commande livrée #{$order->id}", [
                    'order_id' => $order->id,
                    'delivered_at' => now()->toDateTimeString(),
                ]);
            }

            public function emailSent($order)
            {
                $this->log('info', "Email de confirmation envoyé pour commande #{$order->id}", [
                    'order_id' => $order->id,
                    'email' => $order->customer->email ?? 'N/A',
                ]);
            }

            public function failed($orderId, $reason)
            {
                $this->log('error', "Échec création commande #{$orderId}", [
                    'order_id' => $orderId,
                    'reason' => $reason,
                ]);
            }
        };
    }

    /**
     * Logs liés aux paiements
     */
    public static function payment()
    {
        return new class {
            private function log($level, $message, $context = [])
            {
                Log::channel('payments')->$level('[PAYMENT] ' . $message, array_merge([
                    'user_id' => Auth::id(),
                    'timestamp' => now()->toDateTimeString(),
                    'ip' => request()->ip(),
                ], $context));
            }

            public function initiated($orderId, $method, $amount)
            {
                $this->log('info', "Paiement initié pour commande #{$orderId}", [
                    'order_id' => $orderId,
                    'method' => $method,
                    'amount' => $amount,
                ]);
            }

            public function success($orderId, $transactionId, $method, $amount)
            {
                $this->log('info', "✅ Paiement réussi pour commande #{$orderId}", [
                    'order_id' => $orderId,
                    'transaction_id' => $transactionId,
                    'method' => $method,
                    'amount' => $amount,
                ]);
            }

            public function failed($orderId, $method, $amount, $reason)
            {
                $this->log('error', "❌ Paiement échoué pour commande #{$orderId}", [
                    'order_id' => $orderId,
                    'method' => $method,
                    'amount' => $amount,
                    'reason' => $reason,
                ]);
            }

            public function refunded($orderId, $transactionId, $amount)
            {
                $this->log('warning', "Remboursement effectué pour commande #{$orderId}", [
                    'order_id' => $orderId,
                    'transaction_id' => $transactionId,
                    'amount' => $amount,
                ]);
            }

            public function webhookReceived($provider, $event, $data = [])
            {
                $this->log('info', "Webhook reçu de {$provider}: {$event}", [
                    'provider' => $provider,
                    'event' => $event,
                    'data' => $data,
                ]);
            }
        };
    }

    /**
     * Logs système (backups, maintenance, configurations)
     */
    public static function system()
    {
        return new class {
            private function log($level, $message, $context = [])
            {
                Log::channel('system')->$level('[SYSTEM] ' . $message, array_merge([
                    'timestamp' => now()->toDateTimeString(),
                ], $context));
            }

            public function backup($status, $details = [])
            {
                $emoji = $status === 'success' ? '✅' : '❌';
                $level = $status === 'success' ? 'info' : 'error';
                
                $this->log($level, "{$emoji} Backup base de données: {$status}", array_merge([
                    'status' => $status,
                ], $details));
            }

            public function migration($action, $details = [])
            {
                $this->log('info', "Migration: {$action}", $details);
            }

            public function scheduled($command, $status)
            {
                $this->log('info', "Tâche planifiée: {$command} - {$status}", [
                    'command' => $command,
                    'status' => $status,
                ]);
            }

            public function configChanged($key, $oldValue, $newValue)
            {
                $this->log('info', "Configuration modifiée: {$key}", [
                    'key' => $key,
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                ]);
            }

            public function cacheCleared($type = 'all')
            {
                $this->log('info', "Cache nettoyé: {$type}", [
                    'type' => $type,
                ]);
            }

            public function startup($environment)
            {
                $this->log('info', "🚀 Application démarrée", [
                    'environment' => $environment,
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                ]);
            }
        };
    }

    /**
     * Logs d'erreurs et exceptions
     */
    public static function error()
    {
        return new class {
            private function log($level, $message, $context = [])
            {
                Log::channel('errors')->$level('[ERROR] ' . $message, array_merge([
                    'user_id' => Auth::id(),
                    'timestamp' => now()->toDateTimeString(),
                    'ip' => request()->ip(),
                    'url' => request()->fullUrl(),
                ], $context));
            }

            public function exception(\Throwable $e, $context = [])
            {
                $this->log('error', "Exception: " . $e->getMessage(), array_merge([
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ], $context));
            }

            public function database($query, $error)
            {
                $this->log('error', "Erreur base de données", [
                    'query' => $query,
                    'error' => $error,
                ]);
            }

            public function validation($errors, $input = [])
            {
                $this->log('warning', "Erreur de validation", [
                    'errors' => $errors,
                    'input' => $input,
                ]);
            }

            public function authentication($type, $details = [])
            {
                $this->log('warning', "Erreur d'authentification: {$type}", $details);
            }

            public function notFound($resource, $id = null)
            {
                $this->log('warning', "Ressource non trouvée: {$resource}", [
                    'resource' => $resource,
                    'id' => $id,
                ]);
            }
        };
    }

    /**
     * Logs liés aux utilisateurs
     */
    public static function user()
    {
        return new class {
            private function log($level, $message, $context = [])
            {
                Log::channel('users')->$level('[USER] ' . $message, array_merge([
                    'timestamp' => now()->toDateTimeString(),
                    'ip' => request()->ip(),
                ], $context));
            }

            public function registered($user)
            {
                $this->log('info', "Nouvel utilisateur inscrit: {$user->email}", [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                ]);
            }

            public function login($user)
            {
                $this->log('info', "Connexion: {$user->email}", [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            public function logout($user)
            {
                $this->log('info', "Déconnexion: {$user->email}", [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            public function loginFailed($email, $reason = null)
            {
                $this->log('warning', "Échec de connexion: {$email}", [
                    'email' => $email,
                    'reason' => $reason,
                ]);
            }

            public function passwordChanged($user)
            {
                $this->log('info', "Mot de passe modifié: {$user->email}", [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            public function deleted($userId, $email)
            {
                $this->log('warning', "Utilisateur supprimé: {$email}", [
                    'user_id' => $userId,
                    'email' => $email,
                ]);
            }
        };
    }

    /**
     * Logs liés aux produits et inventaire
     */
    public static function inventory()
    {
        return new class {
            private function log($level, $message, $context = [])
            {
                Log::channel('system')->$level('[INVENTORY] ' . $message, array_merge([
                    'user_id' => Auth::id(),
                    'timestamp' => now()->toDateTimeString(),
                ], $context));
            }

            public function stockUpdated($product, $oldStock, $newStock)
            {
                $this->log('info', "Stock mis à jour: {$product->name}", [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'difference' => $newStock - $oldStock,
                ]);
            }

            public function lowStock($product, $currentStock, $threshold)
            {
                $this->log('warning', "⚠️ Stock faible: {$product->name}", [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'current_stock' => $currentStock,
                    'threshold' => $threshold,
                ]);
            }

            public function outOfStock($product)
            {
                $this->log('error', "❌ Rupture de stock: {$product->name}", [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                ]);
            }

            public function priceChanged($product, $oldPrice, $newPrice)
            {
                $this->log('info', "Prix modifié: {$product->name}", [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                ]);
            }
        };
    }
}
