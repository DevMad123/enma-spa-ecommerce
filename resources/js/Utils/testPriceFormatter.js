// Test de la fonction formatPrice
import { formatPrice, formatPriceWithCurrency, usePriceSettings } from './priceFormatter.js';

// Test simple
console.log('Tests formatPrice:');
console.log('100.50 avec décimales:', formatPrice(100.50, true));   // "100.50"
console.log('100.50 sans décimales:', formatPrice(100.50, false));  // "101"

console.log('\nTests formatPriceWithCurrency:');
console.log('100.50 F CFA avec décimales:', formatPriceWithCurrency(100.50, 'F CFA', true));   // "100.50 F CFA"
console.log('100.50 F CFA sans décimales:', formatPriceWithCurrency(100.50, 'F CFA', false));  // "101 F CFA"

// Test avec des settings simulés
const mockAppSettings = {
    currency_symbol: 'F CFA',
    show_decimals: false
};

console.log('\nTest avec usePriceSettings:');
// Simulation du hook (ne fonctionne que dans React)
const { formatPrice: formatPriceHook, formatPriceWithCurrency: formatPriceWithCurrencyHook } = usePriceSettings(mockAppSettings);
console.log('Hook formatPrice 100.50:', formatPriceHook(100.50));
console.log('Hook formatPriceWithCurrency 100.50:', formatPriceWithCurrencyHook(100.50));