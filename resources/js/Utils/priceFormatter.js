/**
 * Utilitaire pour formater les prix selon la localité
 * Délègue à LocaleUtils pour respecter la config globale (locale, décimales, symbole, position)
 */
import { formatCurrency, formatNumber } from '@/Utils/LocaleUtils';

// Fonction pour formater uniquement le nombre
export const formatPrice = (price, showDecimals = false) => {
  const minMax = showDecimals ? 2 : 0;
  return formatNumber(price, {
    minimumFractionDigits: minMax,
    maximumFractionDigits: minMax,
  });
};

// Fonction pour formater les prix avec devise
// Conserve la signature existante mais ignore currencySymbol (utilise la config globale)
export const formatPriceWithCurrency = (price, _currencySymbol = 'F CFA', showDecimals = false) => {
  const minMax = showDecimals ? 2 : 0;
  return formatCurrency(price, {
    minimumFractionDigits: minMax,
    maximumFractionDigits: minMax,
  });
};

// Hook personnalisé pour utiliser les paramètres de prix
export const usePriceSettings = (appSettings) => {
  const currencySymbol = appSettings?.currency_symbol || 'F CFA';
  // Si la clé n'est pas explicitement false, on affiche les décimales
  const showDecimals = appSettings?.show_decimals !== false;

  return {
    currencySymbol,
    showDecimals,
    formatPrice: (price) => formatPrice(price, showDecimals),
    formatPriceWithCurrency: (price) => formatPriceWithCurrency(price, currencySymbol, showDecimals),
  };
};

export default {
  formatPrice,
  formatPriceWithCurrency,
  usePriceSettings,
};

