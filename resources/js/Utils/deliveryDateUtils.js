/**
 * Utilitaires pour calculer et formater les dates de livraison
 */

/**
 * Calcule la date de livraison estimée basée sur les jours estimés
 * @param {number} estimatedDays - Nombre de jours pour la livraison
 * @param {string} locale - Locale pour le formatage (ex: 'fr-FR', 'en-US')
 * @param {Date} orderDate - Date de commande (par défaut: aujourd'hui)
 * @returns {object} Objet contenant les dates formatées
 */
export const calculateDeliveryDate = (estimatedDays, locale = 'fr-FR', orderDate = new Date()) => {
    if (!estimatedDays || estimatedDays <= 0) {
        return {
            estimatedDate: null,
            formattedDate: null,
            deliveryRange: null
        };
    }

    // Calculer la date de début (généralement 1-2 jours après la commande pour préparation)
    const startDate = new Date(orderDate);
    startDate.setDate(startDate.getDate() + 1);

    // Calculer la date de fin
    const endDate = new Date(orderDate);
    endDate.setDate(endDate.getDate() + estimatedDays);

    // Options de formatage selon la locale
    const dateFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const shortDateOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    try {
        return {
            estimatedDate: endDate,
            startDate: startDate,
            formattedDate: endDate.toLocaleDateString(locale, dateFormatOptions),
            shortFormattedDate: endDate.toLocaleDateString(locale, shortDateOptions),
            deliveryRange: {
                start: startDate.toLocaleDateString(locale, shortDateOptions),
                end: endDate.toLocaleDateString(locale, shortDateOptions),
                formattedRange: `entre le ${startDate.toLocaleDateString(locale, dateFormatOptions)} et le ${endDate.toLocaleDateString(locale, dateFormatOptions)}`
            }
        };
    } catch (error) {
        console.error('Erreur lors du formatage de date:', error);
        // Fallback avec formatage français
        return {
            estimatedDate: endDate,
            startDate: startDate,
            formattedDate: endDate.toLocaleDateString('fr-FR', dateFormatOptions),
            shortFormattedDate: endDate.toLocaleDateString('fr-FR', shortDateOptions),
            deliveryRange: {
                start: startDate.toLocaleDateString('fr-FR', shortDateOptions),
                end: endDate.toLocaleDateString('fr-FR', shortDateOptions),
                formattedRange: `entre le ${startDate.toLocaleDateString('fr-FR', dateFormatOptions)} et le ${endDate.toLocaleDateString('fr-FR', dateFormatOptions)}`
            }
        };
    }
};

/**
 * Génère un message de livraison personnalisé selon la locale
 * @param {number} estimatedDays - Nombre de jours pour la livraison
 * @param {string} locale - Locale (ex: 'fr-FR', 'en-US')
 * @param {string} shippingMethodName - Nom de la méthode de livraison
 * @returns {string} Message de livraison formaté
 */
export const getDeliveryMessage = (estimatedDays, locale = 'fr-FR', shippingMethodName = '') => {
    const deliveryInfo = calculateDeliveryDate(estimatedDays, locale);
    
    if (!deliveryInfo.deliveryRange) {
        return locale.startsWith('fr') 
            ? 'Délai de livraison à confirmer'
            : 'Delivery time to be confirmed';
    }

    const methodText = shippingMethodName ? ` via ${shippingMethodName}` : '';
    
    if (locale.startsWith('fr')) {
        if (estimatedDays === 1) {
            return `Livraison express demain${methodText} avant ${deliveryInfo.formattedDate}`;
        } else if (estimatedDays <= 3) {
            return `Livraison rapide${methodText} ${deliveryInfo.deliveryRange.formattedRange}`;
        } else {
            return `Livraison standard${methodText} ${deliveryInfo.deliveryRange.formattedRange}`;
        }
    } else {
        // Anglais
        if (estimatedDays === 1) {
            return `Express delivery tomorrow${methodText} before ${deliveryInfo.formattedDate}`;
        } else if (estimatedDays <= 3) {
            return `Fast delivery${methodText} between ${deliveryInfo.deliveryRange.start} and ${deliveryInfo.deliveryRange.end}`;
        } else {
            return `Standard delivery${methodText} between ${deliveryInfo.deliveryRange.start} and ${deliveryInfo.deliveryRange.end}`;
        }
    }
};

/**
 * Génère un message court pour l'affichage dans les cartes/résumés
 * @param {number} estimatedDays - Nombre de jours pour la livraison
 * @param {string} locale - Locale
 * @returns {string} Message court
 */
export const getShortDeliveryMessage = (estimatedDays, locale = 'fr-FR') => {
    const deliveryInfo = calculateDeliveryDate(estimatedDays, locale);
    
    if (!deliveryInfo.deliveryRange) {
        return locale.startsWith('fr') ? 'À confirmer' : 'TBC';
    }

    if (locale.startsWith('fr')) {
        if (estimatedDays === 1) {
            return 'Demain';
        } else if (estimatedDays <= 3) {
            return `${estimatedDays} jours`;
        } else {
            return `${estimatedDays} jours ouvrés`;
        }
    } else {
        if (estimatedDays === 1) {
            return 'Tomorrow';
        } else if (estimatedDays <= 3) {
            return `${estimatedDays} days`;
        } else {
            return `${estimatedDays} business days`;
        }
    }
};

export default {
    calculateDeliveryDate,
    getDeliveryMessage,
    getShortDeliveryMessage
};