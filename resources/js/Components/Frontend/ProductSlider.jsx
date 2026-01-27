import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ModernProductCard from '@/Components/Frontend/ModernProductCard';

// Product Slider Component - Réutilisable
const ProductSlider = ({ 
    title = "PRODUITS", 
    icon = null,
    products = [], 
    backgroundColor = "bg-white",
    filterProducts = null, // fonction pour filtrer les produits si nécessaire
    filterType = null // type de filtre : 'sale', 'new', 'popular', 'trending'
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Fonction de filtrage interne basée sur la structure de la base de données
    const filterProductsByType = (productsArray, type) => {
        if (!productsArray || !Array.isArray(productsArray)) return [];
        
        switch (type) {
            case 'sale':
                return productsArray.filter(product => {
                    const currentPrice = parseFloat(product?.current_sale_price || 0);
                    const previousPrice = parseFloat(product?.previous_sale_price || 0);
                    const hasDiscount = product?.discount && parseFloat(product.discount) > 0;
                    
                    // Produit en solde si :
                    // - previous_sale_price existe et est supérieur au current_sale_price
                    // - OU il y a une remise appliquée
                    return (previousPrice > 0 && currentPrice > 0 && previousPrice > currentPrice) || hasDiscount;
                });
            
            case 'new':
                // Récupérer les 10 derniers produits ajoutés (triés par created_at desc)
                return productsArray
                    .sort((a, b) => {
                        const dateA = new Date(a?.created_at || 0);
                        const dateB = new Date(b?.created_at || 0);
                        return dateB - dateA; // Tri décroissant (plus récent en premier)
                    })
                    .slice(0, 10);
            
            case 'popular':
                return productsArray.filter(product => product?.is_popular === 1);
                
            case 'trending':
                return productsArray.filter(product => product?.is_trending === 1);
            
            default:
                return productsArray;
        }
    };
    
    // Appliquer le filtre
    let displayedProducts = products;
    
    // Priorité au filtre personnalisé
    if (filterProducts) {
        displayedProducts = filterProducts(products);
    } else if (filterType) {
        displayedProducts = filterProductsByType(products, filterType);
    }
    
    const itemsPerView = { desktop: 4, tablet: 3, mobile: 1 };
    const maxIndex = Math.max(0, displayedProducts.length - itemsPerView.desktop);

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    if (!displayedProducts.length) return null;

    return (
        <section className={`py-[30px] md:py-[60px] ${backgroundColor}`}>
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                {/* Header avec titre et flèches */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <h2 className="text-4xl md:text-5xl font-bold text-black font-['Barlow']">
                            {title}
                        </h2>
                        {icon && (
                            <span className="w-8 h-8 md:w-8 md:h-8 text-gray-600">
                                {icon}
                            </span>
                        )}
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className="p-4 border border-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={currentIndex >= maxIndex}
                            className="p-4 border border-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="relative overflow-hidden">
                    <div 
                        className="flex transition-transform duration-300 ease-in-out space-x-6"
                        style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)`
                        }}
                    >
                        {displayedProducts.map((product) => (
                            <div
                                key={product?.id || Math.random()}
                                className="flex-none w-full md:w-[calc(33.33%-12px)] lg:w-[calc(25%-22px)]"
                            >
                                <ModernProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation Dots */}
                <div className="flex md:hidden items-center justify-center mt-8 space-x-1">
                    {Array.from({ length: Math.ceil(displayedProducts.length / itemsPerView.mobile) }).map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === Math.floor(currentIndex / itemsPerView.mobile)
                                    ? 'bg-black w-6'
                                    : 'bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductSlider;