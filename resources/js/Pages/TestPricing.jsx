import React from 'react';
import { usePage } from '@inertiajs/react';
import { usePriceSettings } from '@/Utils/priceFormatter';

export default function TestPricing() {
    const { testPrices, appSettings } = usePage().props;
    const { formatPrice, formatPriceWithCurrency, currencySymbol, showDecimals } = usePriceSettings(appSettings);

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Test du formatage des prix</h1>
                    
                    {/* Paramètres actuels */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-blue-900 mb-4">Paramètres actuels</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Devise:</span> {currencySymbol}
                            </div>
                            <div>
                                <span className="font-medium">Afficher décimales:</span> {showDecimals ? 'Oui' : 'Non'}
                            </div>
                            <div>
                                <span className="font-medium">Taux TVA:</span> {(appSettings.tax_rate * 100).toFixed(0)}%
                            </div>
                            <div>
                                <span className="font-medium">Seuil livraison gratuite:</span> {formatPriceWithCurrency(appSettings.shipping_threshold)}
                            </div>
                        </div>
                    </div>

                    {/* Tests de formatage */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Tests de formatage</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix original
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avec décimales (.toFixed(2))
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            formatPrice() - Réglage actuel
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            formatPriceWithCurrency() - Final
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {testPrices.map((price, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {price.toFixed(2)} {currencySymbol}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatPrice(price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                {formatPriceWithCurrency(price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Simulation panier */}
                    <div className="mt-8 bg-amber-50 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-amber-900 mb-4">Simulation panier</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Sous-total (2 articles):</span>
                                <span className="font-medium">{formatPriceWithCurrency(12500.50)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Livraison:</span>
                                <span className="font-medium">{formatPriceWithCurrency(appSettings.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>TVA ({(appSettings.tax_rate * 100).toFixed(0)}%):</span>
                                <span className="font-medium">{formatPriceWithCurrency(12500.50 * appSettings.tax_rate)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-amber-200 pt-2">
                                <span>Total:</span>
                                <span className="text-amber-600">{formatPriceWithCurrency(12500.50 + appSettings.shipping_cost + (12500.50 * appSettings.tax_rate))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Liens de retour */}
                    <div className="mt-8 text-center">
                        <a href="/shop" className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 mr-4">
                            Aller à la boutique
                        </a>
                        <a href="/cart" className="inline-flex items-center px-4 py-2 bg-amber-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-amber-700 focus:bg-amber-700 active:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition ease-in-out duration-150">
                            Voir le panier
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}