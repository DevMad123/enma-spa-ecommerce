/**
 * Utilitaire pour formater les prix selon la localité
 */

// Fonction pour formater les prix
export const formatPrice = (price, showDecimals = false) => {
    if (showDecimals) {
        return price.toFixed(2);
    }
    return Math.round(price).toString();
};

// Fonction pour formater les prix avec devise
export const formatPriceWithCurrency = (price, currencySymbol = 'F CFA', showDecimals = false) => {
    const formattedPrice = formatPrice(price, showDecimals);
    return `${formattedPrice} ${currencySymbol}`;
};

// Hook personnalisé pour utiliser les paramètres de prix
export const usePriceSettings = (appSettings) => {
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    const showDecimals = appSettings?.show_decimals !== false;
    
    return {
        currencySymbol,
        showDecimals,
        formatPrice: (price) => formatPrice(price, showDecimals),
        formatPriceWithCurrency: (price) => formatPriceWithCurrency(price, currencySymbol, showDecimals)
    };
};