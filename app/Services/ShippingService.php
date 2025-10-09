<?php

namespace App\Services;

use App\Models\Shipping;
use App\Services\AppSettingsService;

class ShippingService
{
    /**
     * Calculer le coût de livraison pour une méthode donnée
     * 
     * @param int $shippingMethodId
     * @param float $subtotal
     * @return array
     */
    public static function calculateShippingCost($shippingMethodId, $subtotal)
    {
        $shippingMethod = Shipping::find($shippingMethodId);
        
        if (!$shippingMethod) {
            return [
                'cost' => 0,
                'is_free' => false,
                'reason' => 'Method not found',
                'method' => null
            ];
        }

        $originalPrice = floatval($shippingMethod->price);
        $globalThreshold = AppSettingsService::getFreeShippingThreshold();
        
        // Si la méthode supporte la livraison gratuite
        if ($shippingMethod->supports_free_shipping) {
            // Utiliser le seuil spécifique de la méthode ou le seuil global
            $threshold = $shippingMethod->free_shipping_threshold ?? $globalThreshold;
            
            if ($subtotal >= $threshold) {
                return [
                    'cost' => 0,
                    'is_free' => true,
                    'reason' => 'free_shipping_threshold_reached',
                    'method' => $shippingMethod,
                    'threshold_used' => $threshold,
                    'remaining_for_free' => 0
                ];
            } else {
                return [
                    'cost' => $originalPrice,
                    'is_free' => false,
                    'reason' => 'threshold_not_reached',
                    'method' => $shippingMethod,
                    'threshold_used' => $threshold,
                    'remaining_for_free' => $threshold - $subtotal
                ];
            }
        }
        
        // La méthode ne supporte pas la livraison gratuite
        return [
            'cost' => $originalPrice,
            'is_free' => false,
            'reason' => 'no_free_shipping_support',
            'method' => $shippingMethod,
            'threshold_used' => null,
            'remaining_for_free' => null
        ];
    }

    /**
     * Obtenir toutes les méthodes de livraison avec leurs coûts calculés
     * 
     * @param float $subtotal
     * @return array
     */
    public static function getShippingMethodsWithCosts($subtotal)
    {
        $methods = Shipping::where('is_active', true)
                                ->orderBy('sort_order')
                                ->get();
        
        $methodsWithCosts = [];
        
        foreach ($methods as $method) {
            $shippingInfo = self::calculateShippingCost($method->id, $subtotal);
            
            $methodsWithCosts[] = [
                'id' => $method->id,
                'name' => $method->name,
                'description' => $method->description,
                'original_price' => floatval($method->price),
                'calculated_cost' => $shippingInfo['cost'],
                'is_free' => $shippingInfo['is_free'],
                'supports_free_shipping' => $method->supports_free_shipping,
                'free_shipping_threshold' => $method->free_shipping_threshold,
                'threshold_used' => $shippingInfo['threshold_used'],
                'remaining_for_free' => $shippingInfo['remaining_for_free'],
                'reason' => $shippingInfo['reason']
            ];
        }
        
        return $methodsWithCosts;
    }

    /**
     * Vérifier si une méthode de livraison peut être gratuite
     * 
     * @param int $shippingMethodId
     * @param float $subtotal
     * @return bool
     */
    public static function isEligibleForFreeShipping($shippingMethodId, $subtotal)
    {
        $result = self::calculateShippingCost($shippingMethodId, $subtotal);
        return $result['is_free'];
    }

    /**
     * Obtenir le montant restant pour la livraison gratuite
     * 
     * @param int $shippingMethodId
     * @param float $subtotal
     * @return float|null
     */
    public static function getRemainingForFreeShipping($shippingMethodId, $subtotal)
    {
        $result = self::calculateShippingCost($shippingMethodId, $subtotal);
        return $result['remaining_for_free'];
    }
}