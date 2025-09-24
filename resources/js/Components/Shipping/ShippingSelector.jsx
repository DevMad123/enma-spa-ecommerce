import React, { useState, useEffect } from 'react';
import { FaTruck, FaDollarSign, FaClock, FaCheck, FaInfoCircle } from 'react-icons/fa';

const ShippingSelector = ({ 
    shippingMethods = [], 
    selectedShipping = null, 
    onShippingChange, 
    showPrice = true,
    showDescription = true,
    className = '' 
}) => {
    const [selectedId, setSelectedId] = useState(selectedShipping?.id || null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSelectedId(selectedShipping?.id || null);
    }, [selectedShipping]);

    const handleShippingSelect = (shipping) => {
        setSelectedId(shipping.id);
        if (onShippingChange) {
            onShippingChange(shipping);
        }
    };

    const formatPrice = (price) => {
        const numPrice = parseFloat(price);
        return numPrice === 0 ? 'Gratuit' : `${numPrice.toFixed(2)} €`;
    };

    const formatEstimatedDays = (days) => {
        if (!days) return null;
        return days === 1 ? '1 jour' : `${days} jours`;
    };

    if (!shippingMethods || shippingMethods.length === 0) {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center gap-2 text-yellow-800">
                    <FaInfoCircle />
                    <span className="font-medium">Aucune méthode de livraison disponible</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                    Veuillez contacter le support pour organiser la livraison.
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <FaTruck className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Méthode de livraison
                </h3>
                <span className="text-red-500">*</span>
            </div>

            <div className="grid gap-3">
                {shippingMethods.map((shipping) => {
                    const isSelected = selectedId === shipping.id;
                    const estimatedDays = formatEstimatedDays(shipping.estimated_days);
                    
                    return (
                        <div
                            key={shipping.id}
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                            onClick={() => handleShippingSelect(shipping)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    {/* Radio button */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 bg-white'
                                        }`}>
                                            {isSelected && (
                                                <FaCheck className="text-white text-xs" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-medium ${
                                                isSelected ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                                {shipping.name}
                                            </h4>
                                            
                                            {/* Prix badge */}
                                            {showPrice && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    shipping.price == 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    <FaDollarSign className="text-xs" />
                                                    {formatPrice(shipping.price)}
                                                </span>
                                            )}

                                            {/* Délai badge */}
                                            {estimatedDays && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    <FaClock className="text-xs" />
                                                    {estimatedDays}
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {showDescription && shipping.description && (
                                            <p className={`text-sm ${
                                                isSelected ? 'text-blue-700' : 'text-gray-600'
                                            }`}>
                                                {shipping.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Prix à droite (version alternative) */}
                                {showPrice && (
                                    <div className="text-right flex-shrink-0">
                                        <div className={`text-lg font-bold ${
                                            shipping.price == 0
                                                ? 'text-green-600'
                                                : isSelected ? 'text-blue-700' : 'text-gray-900'
                                        }`}>
                                            {formatPrice(shipping.price)}
                                        </div>
                                        {estimatedDays && (
                                            <div className={`text-xs ${
                                                isSelected ? 'text-blue-600' : 'text-gray-500'
                                            }`}>
                                                {estimatedDays}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Indicateur de sélection */}
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <FaCheck className="text-white text-xs" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Résumé de la sélection */}
            {selectedId && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                        <FaCheck className="text-green-600" />
                        <span className="font-medium">Livraison sélectionnée :</span>
                    </div>
                    {(() => {
                        const selected = shippingMethods.find(s => s.id === selectedId);
                        return selected ? (
                            <div className="mt-1 text-blue-700">
                                <span className="font-medium">{selected.name}</span>
                                {showPrice && (
                                    <span className="mx-2">•</span>
                                )}
                                {showPrice && (
                                    <span className="font-bold">{formatPrice(selected.price)}</span>
                                )}
                                {selected.estimated_days && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <span>{formatEstimatedDays(selected.estimated_days)}</span>
                                    </>
                                )}
                            </div>
                        ) : null;
                    })()}
                </div>
            )}

            {/* Message d'aide */}
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                <FaInfoCircle />
                <span>Sélectionnez votre méthode de livraison préférée</span>
            </div>
        </div>
    );
};

export default ShippingSelector;