import { usePage } from '@inertiajs/react';

/**
 * Hook pour utiliser les paramètres d'application
 */
export const useAppSettings = () => {
    const { props } = usePage();
    const { appSettings } = props;
    
    // Formatage de devise
    const formatCurrency = (amount, options = {}) => {
        if (amount === null || amount === undefined || amount === '') return 'N/A';
        
        const currency = appSettings?.currency || 'XOF';
        const currencySymbol = appSettings?.currency_symbol || 'F CFA';
        const locale = appSettings?.locale || 'fr-FR';
        const showDecimals = appSettings?.show_decimals === true || appSettings?.show_decimals === 'true';
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return 'N/A';
        
        // Options de formatage
        const formatOptions = {
            minimumFractionDigits: showDecimals ? 2 : 0,
            maximumFractionDigits: showDecimals ? 2 : 0,
            ...options
        };
        
        // Formatage selon la devise
        if (currency === 'EUR') {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'EUR',
                ...formatOptions
            }).format(numAmount);
        } else if (currency === 'XOF') {
            // Format spécifique pour le F CFA
            const formatted = new Intl.NumberFormat(locale, formatOptions).format(numAmount);
            return `${formatted} ${currencySymbol}`;
        } else {
            // Format générique
            const formatted = new Intl.NumberFormat(locale, formatOptions).format(numAmount);
            return `${formatted} ${currencySymbol}`;
        }
    };
    
    // Formatage de date
    const formatDate = (dateString, options = {}) => {
        if (!dateString) return 'N/A';
        
        const locale = appSettings?.locale || 'fr-FR';
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };
        
        try {
            return new Date(dateString).toLocaleDateString(locale, defaultOptions);
        } catch (error) {
            return 'Date invalide';
        }
    };
    
    // Formatage de date et heure
    const formatDateTime = (dateString, options = {}) => {
        if (!dateString) return 'N/A';
        
        const locale = appSettings?.locale || 'fr-FR';
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        
        try {
            return new Date(dateString).toLocaleDateString(locale, defaultOptions);
        } catch (error) {
            return 'Date invalide';
        }
    };
    
    // Formatage de pourcentage
    const formatPercentage = (value, decimals = 1) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'N/A';
        
        return `${numValue.toFixed(decimals)}%`;
    };
    
    // Formatage de nombre
    const formatNumber = (value, decimals = 0) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'N/A';
        
        const locale = appSettings?.locale || 'fr-FR';
        
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(numValue);
    };
    
    // Validation de montant minimum
    const checkMinimumAmount = (amount, minRequired) => {
        if (!minRequired || minRequired === 0) {
            return { isValid: true, message: null };
        }
        
        const numAmount = parseFloat(amount);
        const numMin = parseFloat(minRequired);
        
        if (numAmount >= numMin) {
            return { isValid: true, message: null };
        }
        
        const difference = numMin - numAmount;
        return {
            isValid: false,
            message: `Il manque ${formatCurrency(difference)} pour atteindre le montant minimum`,
            difference: difference
        };
    };
    
    return {
        // Paramètres
        appSettings,
        currency: appSettings?.currency || 'XOF',
        currencySymbol: appSettings?.currency_symbol || 'F CFA',
        locale: appSettings?.locale || 'fr-FR',
        showDecimals: appSettings?.show_decimals === true || appSettings?.show_decimals === 'true',
        
        // Méthodes de formatage
        formatCurrency,
        formatDate,
        formatDateTime,
        formatPercentage,
        formatNumber,
        checkMinimumAmount,
    };
};

export default useAppSettings;
