<?php

namespace App\Services;

use App\Models\Sell;
use App\Models\Sell_details;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class OrderService
{
    /**
     * Créer une nouvelle commande avec gestion automatique du stock
     */
    public function createOrder(array $orderData, array $orderItems)
    {
        return DB::transaction(function () use ($orderData, $orderItems) {
            
            // 1. Vérifier la disponibilité du stock pour tous les articles
            Log::info('=== DÉBUT CRÉATION COMMANDE ===');
            Log::info('Order service orderData : ', $orderData);
            Log::info('Order service orderItems : ', $orderItems);
            Log::info('User authentifié : ', ['user_id' => auth()->id(), 'user' => auth()->user() ? auth()->user()->toArray() : null]);
            
            $this->checkStockAvailability($orderItems);
            Log::info('✅ Vérification du stock réussie');
            
            // 2. Créer la commande principale
            $sellData = [
                'customer_id' => $orderData['customer_id'],
                'shipping_cost' => floatval($orderData['shipping_cost'] ?? 0),
                'shipping_method' => $orderData['shipping_method'] ?: null,
                'total_discount' => floatval($orderData['total_discount'] ?? 0),
                'payment_type' => intval($orderData['payment_type'] ?? 1),
                'payment_status' => intval($orderData['payment_status'] ?? 0),
                'order_status' => intval($orderData['order_status'] ?? 0),
                'notes' => $orderData['notes'] ?: null,
                'total_paid' => floatval($orderData['total_paid'] ?? 0),
                'status' => 1, // Active
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
                // Champs obligatoires - seront recalculés après ajout des détails
                'total_vat_amount' => 0,
                'total_payable_amount' => 0,
                'grand_total' => 0,
                'total_due' => 0,
            ];
            
            Log::info('Données pour Sell::create : ', $sellData);
            
            try {
                $order = Sell::create($sellData);
                Log::info('✅ Commande créée avec succès : ', $order->toArray());
            } catch (\Exception $e) {
                Log::error('❌ Erreur lors de la création de la commande : ', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            } catch (\Error $e) {
                Log::error('❌ Erreur fatale lors de la création de la commande : ', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            } catch (\Throwable $e) {
                Log::error('❌ Erreur inconnue lors de la création de la commande : ', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

            // 3. Ajouter les détails de la commande
            $totalAmount = 0;
            $totalVat = 0;

            foreach ($orderItems as $item) {
                Log::info('Order service Item : ', $item);
                $product = Product::findOrFail($item['product_id']);
                $variant = null;
                
                if (isset($item['product_variant_id']) && $item['product_variant_id']) {
                    $variant = ProductVariant::find($item['product_variant_id']);
                    $price = $variant->sale_price;
                    $stock = $variant->available_quantity;
                } else {
                    $price = $product->current_sale_price;
                    $stock = $product->available_quantity;
                }

                // Vérifier le stock une dernière fois
                if ($stock < $item['quantity']) {
                    throw new Exception("Stock insuffisant pour le produit: {$product->name}");
                }

                // Créer le détail de commande
                $sellDetail = Sell_details::create([
                    'sell_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'unit_sell_price' => $price,
                    'unit_product_cost' => $item['unit_cost'] ?? ($variant ? $variant->purchase_cost : $product->current_purchase_cost),
                    'unit_vat' => $item['vat_percentage'] ?? 0,
                    'sale_quantity' => $item['quantity'],
                    'total_discount' => $item['discount'] ?? 0,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);

                // Calculer les totaux
                $subtotal = $sellDetail->subtotal;
                $vatAmount = $subtotal * ($sellDetail->unit_vat / 100);
                $totalAmount += $subtotal;
                $totalVat += $vatAmount;

                // 4. Décrémenter le stock
                $this->decrementStock($item['product_id'], $item['product_variant_id'] ?? null, $item['quantity']);
            }

            // 5. Mettre à jour les totaux de la commande
            $order->update([
                'total_vat_amount' => $totalVat,
                'total_payable_amount' => $totalAmount + $totalVat + $order->shipping_cost - $order->total_discount,
                'grand_total' => $totalAmount + $totalVat + $order->shipping_cost - $order->total_discount,
                'total_due' => ($totalAmount + $totalVat + $order->shipping_cost - $order->total_discount) - $order->total_paid,
            ]);

            return $order->load(['customer', 'sellDetails.product', 'sellDetails.productVariant']);
        });
    }

    /**
     * Mettre à jour une commande existante
     */
    public function updateOrder(Sell $order, array $orderData)
    {
        return DB::transaction(function () use ($order, $orderData) {
            
            // Ne permettre la modification que si la commande n'est pas terminée
            if ($order->status == 1 || $order->order_status >= 6) {
                throw new Exception("Cette commande ne peut plus être modifiée");
            }

            // Mettre à jour les informations de base
            $order->update([
                'payment_status' => $orderData['payment_status'] ?? $order->payment_status,
                'order_status' => $orderData['order_status'] ?? $order->order_status,
                'shipping_method' => $orderData['shipping_method'] ?? $order->shipping_method,
                'notes' => $orderData['notes'] ?? $order->notes,
                'total_paid' => $orderData['total_paid'] ?? $order->total_paid,
                'updated_by' => auth()->id(),
            ]);

            // Recalculer le montant dû
            $order->total_due = $order->total_payable_amount - $order->total_paid;
            $order->save();

            // Si le paiement est complet, marquer comme payé
            if ($order->total_paid >= $order->total_payable_amount) {
                $order->payment_status = 1; // Payé
                $order->save();
            }

            return $order->load(['customer', 'sellDetails.product', 'sellDetails.productVariant']);
        });
    }

    /**
     * Annuler une commande et restaurer le stock
     */
    public function cancelOrder(Sell $order)
    {
        return DB::transaction(function () use ($order) {
            
            if ($order->order_status >= 6) {
                throw new Exception("Cette commande est déjà terminée et ne peut pas être annulée");
            }

            // Restaurer le stock
            foreach ($order->sellDetails as $detail) {
                $this->incrementStock($detail->product_id, $detail->product_variant_id, $detail->sale_quantity);
            }

            // Marquer la commande comme annulée
            $order->update([
                'order_status' => 5, // Processus d'annulation terminé
                'status' => 0, // Non terminée
                'updated_by' => auth()->id(),
            ]);

            return $order;
        });
    }

    /**
     * Vérifier la disponibilité du stock pour tous les articles
     */
    private function checkStockAvailability(array $orderItems)
    {
        foreach ($orderItems as $item) {
            $product = Product::findOrFail($item['product_id']);
            
            if (isset($item['product_variant_id']) && $item['product_variant_id']) {
                $variant = ProductVariant::findOrFail($item['product_variant_id']);
                $availableStock = $variant->available_quantity;
                $productName = $product->name . ' - ' . $variant->sku;
            } else {
                $availableStock = $product->available_quantity;
                $productName = $product->name;
            }

            if ($availableStock < $item['quantity']) {
                throw new Exception("Stock insuffisant pour {$productName}. Stock disponible: {$availableStock}, Quantité demandée: {$item['quantity']}");
            }
        }
    }

    /**
     * Décrémenter le stock d'un produit ou variant
     */
    private function decrementStock($productId, $variantId, $quantity)
    {
        if ($variantId) {
            $variant = ProductVariant::findOrFail($variantId);
            $variant->decrement('available_quantity', $quantity);
        } else {
            $product = Product::findOrFail($productId);
            $product->decrement('available_quantity', $quantity);
        }
    }

    /**
     * Incrémenter le stock d'un produit ou variant
     */
    private function incrementStock($productId, $variantId, $quantity)
    {
        if ($variantId) {
            $variant = ProductVariant::findOrFail($variantId);
            $variant->increment('available_quantity', $quantity);
        } else {
            $product = Product::findOrFail($productId);
            $product->increment('available_quantity', $quantity);
        }
    }

    /**
     * Calculer les statistiques des commandes
     */
    public function getOrderStatistics($filters = [])
    {
        $query = Sell::query();

        // Appliquer les filtres
        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }
        
        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        
        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['status'])) {
            $query->where('order_status', $filters['status']);
        }

        return [
            'total_orders' => $query->count(),
            'total_amount' => $query->sum('total_payable_amount'),
            'paid_orders' => $query->where('payment_status', 1)->count(),
            'pending_orders' => $query->where('order_status', 0)->count(),
            'completed_orders' => $query->where('order_status', 6)->count(),
            'cancelled_orders' => $query->where('order_status', 5)->count(),
        ];
    }
}