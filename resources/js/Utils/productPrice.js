// Price utilities for variable/simple products
// Compatible with existing formatCurrency()

import { formatCurrency } from '@/Utils/LocaleUtils';

// Safe number extraction
const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : NaN);
  return Number.isNaN(n) ? null : n;
};

// Get product price range
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

// Format display text for a product price
export function formatVariablePrice(product) {
  const { min, max } = getProductPriceRange(product);
  const compareAt = getProductCompareAtMin(product);
  const hasRange = max !== null && min !== null && max > min;

  const prefix = hasRange ? 'A partir de ' : '';
  const main = `${prefix}${formatCurrency(min)}`;

  const showCompare = compareAt !== null && compareAt > min;

  return {
    text: showCompare ? `${main} ` : main,
    min,
    max,
    hasRange,
    compareAt: showCompare ? compareAt : null,
  };
}

export default {
  getProductPriceRange,
  getProductCompareAtMin,
  formatVariablePrice,
};
