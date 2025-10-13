import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

/**
 * Hook personnalisé pour gérer les pays et le calcul de la TVA avec le nouveau système de règles
 */
export const useCountryTax = (initialCountry = null) => {
    const { props } = usePage();
    const { appSettings } = props;
    
    const [selectedCountry, setSelectedCountry] = useState(
        initialCountry || appSettings?.default_country_code || 'CI'
    );
    const [taxRules, setTaxRules] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les règles de TVA depuis l'API
    const loadTaxRules = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await axios.get('/api/countries/tax-rules');
            const rules = response.data.reduce((acc, rule) => {
                acc[rule.country_code] = {
                    name: rule.country_name,
                    taxRate: parseFloat(rule.tax_rate) / 100,
                    deliveryAllowed: rule.delivery_allowed,
                    minOrderAmount: rule.min_order_amount ? parseFloat(rule.min_order_amount) : 0,
                    isActive: rule.is_active,
                    isDefault: rule.is_default
                };
                return acc;
            }, {});
            
            setTaxRules(rules);
        } catch (err) {
            setError('Impossible de charger les règles de TVA');
            console.error('Erreur lors du chargement des règles de TVA:', err);
            
            // Fallback avec les anciennes données
            setTaxRules({
                'CI': { name: 'Côte D\'Ivoire', taxRate: 0.00, deliveryAllowed: true, minOrderAmount: 0, isActive: true, isDefault: true },
                'FR': { name: 'France', taxRate: 0.20, deliveryAllowed: true, minOrderAmount: 30, isActive: true, isDefault: false },
                'BE': { name: 'Belgique', taxRate: 0.21, deliveryAllowed: true, minOrderAmount: 50, isActive: true, isDefault: false },
                'CH': { name: 'Suisse', taxRate: 0.077, deliveryAllowed: true, minOrderAmount: 100, isActive: true, isDefault: false },
                'LU': { name: 'Luxembourg', taxRate: 0.17, deliveryAllowed: true, minOrderAmount: 0, isActive: true, isDefault: false },
                'DE': { name: 'Allemagne', taxRate: 0.19, deliveryAllowed: true, minOrderAmount: 0, isActive: true, isDefault: false },
                'IT': { name: 'Italie', taxRate: 0.22, deliveryAllowed: true, minOrderAmount: 0, isActive: true, isDefault: false },
                'ES': { name: 'Espagne', taxRate: 0.21, deliveryAllowed: true, minOrderAmount: 0, isActive: true, isDefault: false }
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Charger les règles au montage du composant
    useEffect(() => {
        loadTaxRules();
    }, [loadTaxRules]);

    // Pays disponibles (actifs et avec livraison autorisée)
    const availableCountries = useMemo(() => {
        return Object.fromEntries(
            Object.entries(taxRules).filter(([code, rule]) => 
                rule.isActive && rule.deliveryAllowed
            )
        );
    }, [taxRules]);

    // Calculer la TVA pour un montant donné
    const calculateTax = useCallback(async (amount, countryCode = selectedCountry) => {
        try {
            const response = await axios.post('/api/tax/calculate', {
                amount: amount,
                country_code: countryCode
            });

            return response.data;
        } catch (err) {
            console.error('Erreur lors du calcul de la TVA:', err);
            
            // Calcul fallback local
            const rule = taxRules[countryCode] || getDefaultTaxRule();
            const taxAmount = amount * rule.taxRate;
            
            return {
                amount_ht: amount,
                tax_rate: rule.taxRate * 100,
                tax_amount: taxAmount,
                amount_ttc: amount + taxAmount,
                delivery_possible: rule.deliveryAllowed && amount >= rule.minOrderAmount,
                country_info: {
                    code: countryCode,
                    name: rule.name
                }
            };
        }
    }, [selectedCountry, taxRules]);

    // Obtenir la règle de TVA par défaut
    const getDefaultTaxRule = useCallback(() => {
        const defaultRule = Object.values(taxRules).find(rule => rule.isDefault);
        return defaultRule || taxRules['CI'] || { name: 'Côte D\'Ivoire', taxRate: 0.20, deliveryAllowed: true, minOrderAmount: 0 };
    }, [taxRules]);

    // Obtenir le taux de TVA actuel
    const currentTaxRate = useMemo(() => {
        const rule = taxRules[selectedCountry];
        return rule ? rule.taxRate : getDefaultTaxRule().taxRate;
    }, [selectedCountry, taxRules, getDefaultTaxRule]);

    // Vérifier si un pays est autorisé pour la livraison
    const isCountryAllowed = useCallback((countryCode) => {
        const rule = taxRules[countryCode];
        return rule ? rule.isActive && rule.deliveryAllowed : false;
    }, [taxRules]);

    // Vérifier si un montant minimum est requis pour la livraison
    const checkMinOrderAmount = useCallback((amount, countryCode = selectedCountry) => {
        const rule = taxRules[countryCode];
        if (!rule) return { isValid: false, minRequired: 0 };
        
        return {
            isValid: amount >= rule.minOrderAmount,
            minRequired: rule.minOrderAmount,
            difference: rule.minOrderAmount - amount
        };
    }, [selectedCountry, taxRules]);

    // Obtenir les informations du pays sélectionné
    const selectedCountryInfo = useMemo(() => {
        return taxRules[selectedCountry] || getDefaultTaxRule();
    }, [selectedCountry, taxRules, getDefaultTaxRule]);

    // Obtenir les informations d'un pays spécifique
    const getCountryInfo = useCallback(async (countryCode) => {
        try {
            const response = await axios.get(`/api/tax/info/${countryCode}`);
            return response.data;
        } catch (err) {
            console.error('Erreur lors de la récupération des infos pays:', err);
            return taxRules[countryCode] || null;
        }
    }, [taxRules]);

    // Rafraîchir les règles de TVA
    const refreshTaxRules = useCallback(() => {
        loadTaxRules();
    }, [loadTaxRules]);

    return {
        // État
        selectedCountry,
        setSelectedCountry,
        isLoading,
        error,
        
        // Données
        availableCountries,
        taxRules,
        selectedCountryInfo,
        currentTaxRate,
        
        // Méthodes
        calculateTax,
        isCountryAllowed,
        checkMinOrderAmount,
        getCountryInfo,
        getDefaultTaxRule,
        refreshTaxRules,
        
        // Compatibilité
        defaultCountry: appSettings?.default_country_code || 'CI',
        isInternationalShippingEnabled: Object.keys(availableCountries).length > 1
    };
};

export default useCountryTax;