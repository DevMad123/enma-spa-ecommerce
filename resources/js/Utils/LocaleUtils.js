/**
 * Utilitaires de localisation pour le frontend
 * Utilise la configuration passée par le backend via Inertia
 */

// Configuration par défaut (sera remplacée par les données du backend)
let localeConfig = null; // Pas de configuration par défaut, force l'initialisation

/**
 * Initialise la configuration de locale
 * @param {Object} config - Configuration de locale venant du backend
 */
export function initLocale(config) {
    if (config && typeof config === 'object') {
        // Utiliser directement la configuration du backend sans valeurs par défaut
        localeConfig = {
            ...config,
            // S'assurer que les objets imbriqués sont présents
            numberFormat: config.numberFormat || {
                decimal: ',',
                thousands: ' '
            },
            dateFormat: config.dateFormat || {
                short: 'd/m/Y',
                long: 'd/m/Y H:i'
            }
        };
    }
}

/**
 * Récupère la configuration de locale courante
 * @returns {Object}
 */
export function getLocaleConfig() {
    // Si pas de configuration, retourner null pour forcer l'initialisation
    if (!localeConfig) {
        return null;
    }
    return localeConfig;
}

/**
 * Formate un nombre selon la locale courante
 * @param {number} number - Le nombre à formater
 * @param {Object} options - Options de formatage (voir Intl.NumberFormat)
 * @returns {string}
 */
export function formatNumber(number, options = {}) {
    // Validation et conversion du nombre
    const numValue = parseFloat(number);
    if (isNaN(numValue)) {
        return '0,00';
    }
    
    const config = getLocaleConfig();
    
    // Si pas de config, utiliser des valeurs de fallback minimal
    if (!config) {
        return numValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    const defaultOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options
    };
    
    try {
        return new Intl.NumberFormat(config.locale, defaultOptions).format(numValue);
    } catch (error) {
        console.warn('Erreur de formatage de nombre:', error);
        // Fallback manuel
        return numValue.toFixed(defaultOptions.minimumFractionDigits)
            .replace('.', config.numberFormat.decimal)
            .replace(/\B(?=(\d{3})+(?!\d))/g, config.numberFormat.thousands);
    }
}

/**
 * Formate une devise selon la locale courante
 * @param {number} amount - Le montant à formater
 * @param {Object} options - Options de formatage
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
    // Validation et conversion du montant
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        console.warn('formatCurrency - Montant invalide:', amount);
        return '0,00';
    }
    
    const config = getLocaleConfig();
    
    // Si pas de config, utiliser un fallback avec symbole XOF temporaire
    if (!config) {
        const formatted = numAmount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return `${formatted} XOF`; // Symbole temporaire le temps de l'initialisation
    }
    
    const defaultOptions = {
        style: 'currency',
        currency: config.currency,
        ...options
    };
    
    try {
        return new Intl.NumberFormat(config.locale, defaultOptions).format(numAmount);
    } catch (error) {
        console.warn('Erreur de formatage de devise:', error);
        // Fallback manuel avec le bon symbole
        const formattedNumber = formatNumber(numAmount, { minimumFractionDigits: 2 });
        
        return config.currencyPosition === 'before' 
            ? `${config.currencySymbol}${formattedNumber}`
            : `${formattedNumber} ${config.currencySymbol}`;
    }
}

/**
 * Formate une date selon la locale courante
 * @param {Date|string} date - La date à formater
 * @param {Object} options - Options de formatage (voir Intl.DateTimeFormat)
 * @returns {string}
 */
export function formatDate(date, options = {}) {
    const config = getLocaleConfig();
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Si pas de config, utiliser un fallback
    if (!config) {
        return dateObj.toLocaleDateString();
    }
    
    const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options
    };
    
    try {
        return new Intl.DateTimeFormat(config.locale, defaultOptions).format(dateObj);
    } catch (error) {
        console.warn('Erreur de formatage de date:', error);
        // Fallback simple
        return dateObj.toLocaleDateString();
    }
}

/**
 * Formate une date et heure selon la locale courante
 * @param {Date|string} date - La date à formater
 * @param {Object} options - Options de formatage
 * @returns {string}
 */
export function formatDateTime(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };
    
    return formatDate(date, defaultOptions);
}

/**
 * Formate un pourcentage selon la locale courante
 * @param {number} value - La valeur à formater (0.15 pour 15%)
 * @param {Object} options - Options de formatage
 * @returns {string}
 */
export function formatPercent(value, options = {}) {
    const config = getLocaleConfig();
    
    // Si pas de config, utiliser un fallback
    if (!config) {
        return `${(value * 100).toFixed(2)}%`;
    }
    
    const defaultOptions = {
        style: 'percent',
        minimumFractionDigits: 2,
        ...options
    };
    
    try {
        return new Intl.NumberFormat(config.locale, defaultOptions).format(value);
    } catch (error) {
        console.warn('Erreur de formatage de pourcentage:', error);
        return `${(value * 100).toFixed(2)}%`;
    }
}

/**
 * Vérifie si la locale courante utilise l'écriture de droite à gauche (RTL)
 * @returns {boolean}
 */
export function isRTL() {
    const config = getLocaleConfig();
    return config ? config.rtl : false;
}

/**
 * Récupère la langue courante
 * @returns {string}
 */
export function getCurrentLanguage() {
    const config = getLocaleConfig();
    return config ? config.language : 'français';
}

/**
 * Récupère le code de locale courante
 * @returns {string}
 */
export function getCurrentLocale() {
    const config = getLocaleConfig();
    return config ? config.locale : 'fr-FR';
}

/**
 * Récupère la devise courante
 * @returns {string}
 */
export function getCurrentCurrency() {
    const config = getLocaleConfig();
    return config ? config.currency : 'XOF';
}

/**
 * Récupère le symbole de devise courante
 * @returns {string}
 */
export function getCurrentCurrencySymbol() {
    const config = getLocaleConfig();
    return config ? config.currencySymbol : 'F CFA';
}

/**
 * Compare deux nombres avec gestion de la locale
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
export function compareNumbers(a, b) {
    const config = getLocaleConfig();
    try {
        const locale = config ? config.locale : 'fr-FR';
        return new Intl.Collator(locale, { numeric: true }).compare(a, b);
    } catch (error) {
        return a - b;
    }
}

/**
 * Compare deux chaînes avec gestion de la locale
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function compareStrings(a, b) {
    const config = getLocaleConfig();
    try {
        const locale = config ? config.locale : 'fr-FR';
        return new Intl.Collator(locale).compare(a, b);
    } catch (error) {
        return a.localeCompare(b);
    }
}

// Export par défaut
export default {
    initLocale,
    getLocaleConfig,
    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatPercent,
    isRTL,
    getCurrentLanguage,
    getCurrentLocale,
    getCurrentCurrency,
    getCurrentCurrencySymbol,
    compareNumbers,
    compareStrings
};