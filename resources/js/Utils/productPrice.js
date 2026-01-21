// Price utilities for variable/simple products
// Compatible with existing formatCurrency()

import { formatCurrency } from '@/Utils/LocaleUtils';

// Safe number extraction
const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : NaN);
  return Number.isNaN(n) ? null : n;
};

/**
 * Calcule le prix d'affichage pour un produit (avec gestion des variants)
 * @param {Object} product - Le produit
 * @returns {Object} - { price, compareAt, text, isVariable, hasDiscount }
 */
export function formatVariablePrice(product) {
    if (!product) {
        return {
            price: 0,
            compareAt: null,
            text: formatCurrency(0),
            isVariable: false,
            hasDiscount: false
        };
    }

    // Vérifier si le produit a des variants
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const hasMultipleVariants = hasVariants && product.variants.length > 1;

    if (hasVariants) {
        // Récupérer tous les prix des variants
        const variantPrices = product.variants
            .map(variant => parseFloat(variant.sale_price || variant.price || 0))
            .filter(price => price > 0)
            .sort((a, b) => a - b);

        if (variantPrices.length > 0) {
            const minPrice = variantPrices[0];
            const maxPrice = variantPrices[variantPrices.length - 1];

            if (hasMultipleVariants && minPrice !== maxPrice) {
                // Affichage "À partir de X€"
                return {
                    price: minPrice,
                    compareAt: null,
                    text: `À partir de ${formatCurrency(minPrice)}`,
                    isVariable: true,
                    hasDiscount: false
                };
            } else {
                // Un seul variant ou tous au même prix
                return {
                    price: minPrice,
                    compareAt: null,
                    text: formatCurrency(minPrice),
                    isVariable: false,
                    hasDiscount: false
                };
            }
        }
    }

    // Pas de variants ou variants sans prix, utiliser les prix du produit principal
    const basePrice = parseFloat(product.current_sale_price || product.price || 0);
    const originalPrice = parseFloat(product.original_price || product.current_sale_price || product.price || 0);
    const finalPrice = parseFloat(product.final_price || basePrice);
    const hasDiscount = product.has_discount || (finalPrice < originalPrice && originalPrice > 0);

    return {
        price: finalPrice,
        compareAt: hasDiscount ? originalPrice : null,
        text: formatCurrency(finalPrice),
        isVariable: false,
        hasDiscount: hasDiscount
    };
}

/**
 * Calcule le pourcentage de réduction
 * @param {Object} product - Le produit
 * @returns {number} - Pourcentage de réduction (0 si pas de réduction)
 */
export function getDiscountPercentage(product) {
    if (!product) return 0;

    // Si le produit a déjà le pourcentage calculé
    if (product.discount_percentage > 0) {
        return Math.round(product.discount_percentage);
    }

    // Calcul manuel
    const originalPrice = parseFloat(product.original_price || product.current_sale_price || 0);
    const finalPrice = parseFloat(product.final_price || originalPrice);

    if (originalPrice > 0 && finalPrice < originalPrice) {
        return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
    }

    return 0;
}

/**
 * Vérifie si un produit a des variants avec des prix différents
 * @param {Object} product - Le produit
 * @returns {boolean}
 */
export function hasVariablePricing(product) {
    if (!product || !Array.isArray(product.variants) || product.variants.length <= 1) {
        return false;
    }

    const prices = product.variants
        .map(variant => parseFloat(variant.sale_price || variant.price || 0))
        .filter(price => price > 0);

    return prices.length > 1 && Math.max(...prices) !== Math.min(...prices);
}

/**
 * Obtient la plage de prix d'un produit
 * @param {Object} product - Le produit
 * @returns {Object} - { min, max, hasRange }
 */
export function getPriceRange(product) {
    if (!product) {
        return { min: 0, max: 0, hasRange: false };
    }

    // Utiliser les propriétés calculées du modèle si disponibles
    if (product.price_range_with_discount) {
        const range = product.price_range_with_discount;
        return {
            min: range.min || 0,
            max: range.max || 0,
            hasRange: (range.max || 0) > (range.min || 0)
        };
    }

    // Calcul manuel pour les variants
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        const prices = product.variants
            .map(variant => parseFloat(variant.sale_price || variant.price || 0))
            .filter(price => price > 0);

        if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return { min, max, hasRange: max > min };
        }
    }

    // Prix du produit principal
    const price = parseFloat(product.final_price || product.current_sale_price || product.price || 0);
    return { min: price, max: price, hasRange: false };
}

// Get product price range (version legacy pour compatibilité)
export function getProductPriceRange(product) {
  if (!product || typeof product !== 'object') {
    return { min: 0, max: 0 };
  }

  // If API already provides price_range or price_min/price_max
  const apiMin = toNumber(product?.price_range?.min ?? product.price_min);
  const apiMax = toNumber(product?.price_range?.max ?? product.price_max);
  if (apiMin !== null && apiMax !== null) {
    return { min: apiMin, max: apiMax };
  }

  // Fallback: compute from variants if available
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const prices = product.variants
      .map((v) => toNumber(v.sale_price ?? v.price))
      .filter((v) => v !== null);
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return { min, max };
    }
  }

  // Final fallback: product current price
  const p = toNumber(product.current_sale_price ?? product.price);
  return { min: p ?? 0, max: p ?? 0 };
}

// Get minimal compare-at price if available
export function getProductCompareAtMin(product) {
  if (!product || typeof product !== 'object') return null;

  const prev = toNumber(product.previous_sale_price);
  if (prev !== null) return prev;

  const legacy = toNumber(product.price);
  if (legacy !== null) return legacy;

  return null;
}

export default {
  formatVariablePrice,
  getDiscountPercentage,
  hasVariablePricing,
  getPriceRange,
  getProductPriceRange,
  getProductCompareAtMin,
};
