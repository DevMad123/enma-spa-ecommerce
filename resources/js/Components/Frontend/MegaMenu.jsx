import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const MegaMenu = ({ isOpen, type, categories = [] }) => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);

    // Configuration des marques et sous-catégories selon le type
    const sneakerBrands = [
        { 
            id: 'nike', 
            name: 'Nike', 
            subcategories: ['Air Force 1', 'Air Jordan 1', 'Air Max', 'Dunk', 'Blazer', 'Air Jordan 4']
        },
        { 
            id: 'adidas', 
            name: 'Adidas', 
            subcategories: ['Stan Smith', 'Gazelle', 'Forum', 'Superstar', 'Samba', 'Campus']
        },
        { 
            id: 'jordan', 
            name: 'Jordan', 
            subcategories: ['Air Jordan 1', 'Air Jordan 3', 'Air Jordan 4', 'Air Jordan 11', 'Air Jordan 6', 'Jordan Delta']
        },
        { 
            id: 'new-balance', 
            name: 'New Balance', 
            subcategories: ['550', '574', '327', '990', '2002R', '9060']
        },
        { 
            id: 'puma', 
            name: 'Puma', 
            subcategories: ['Suede', 'RS-X', 'Clyde', 'Cali', 'Thunder', 'Cell']
        },
        { 
            id: 'yeezy', 
            name: 'Yeezy', 
            subcategories: ['350 V2', '700', '500', 'Foam Runner', '380', 'Slide']
        }
    ];

    const streetwearBrands = [
        { 
            id: 'supreme', 
            name: 'Supreme', 
            subcategories: ['Box Logo', 'T-Shirts', 'Hoodies', 'Accessories', 'Jackets', 'Pants']
        },
        { 
            id: 'off-white', 
            name: 'Off-White', 
            subcategories: ['Graphic Tees', 'Hoodies', 'Jeans', 'Sneakers', 'Bags', 'Belts']
        },
        { 
            id: 'stussy', 
            name: 'Stussy', 
            subcategories: ['8 Ball', 'Stock Logo', 'Hoodies', 'T-Shirts', 'Caps', 'Shorts']
        },
        { 
            id: 'kith', 
            name: 'Kith', 
            subcategories: ['Williams III', 'Classics', 'Hoodies', 'Sweatshirts', 'Tees', 'Accessories']
        },
        { 
            id: 'fear-of-god', 
            name: 'Fear of God', 
            subcategories: ['Essentials', 'Main Line', 'Hoodies', 'T-Shirts', 'Pants', 'Shorts']
        },
        { 
            id: 'palm-angels', 
            name: 'Palm Angels', 
            subcategories: ['Track Suits', 'Hoodies', 'T-Shirts', 'Jeans', 'Accessories', 'Sneakers']
        }
    ];

    const brands = type === 'sneakers' ? sneakerBrands : streetwearBrands;

    useEffect(() => {
        if (isOpen && brands.length > 0) {
            setActiveCategory(brands[0].id);
            setSubcategories(brands[0].subcategories);
        }
    }, [isOpen, type]);

    const handleCategoryHover = (brand) => {
        setActiveCategory(brand.id);
        setSubcategories(brand.subcategories);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-4xl bg-white shadow-2xl border border-gray-100 rounded-lg overflow-hidden z-50 transition-all duration-300 ease-out">
            <div className="flex">
                {/* Colonne gauche - Catégories */}
                <div className="w-1/3 bg-gray-50 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {type === 'sneakers' ? 'Marques Sneakers' : 'Marques Streetwear'}
                    </h3>
                    <div className="space-y-1">
                        {brands.map((brand) => (
                            <button
                                key={brand.id}
                                onMouseEnter={() => handleCategoryHover(brand)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                                    activeCategory === brand.id
                                        ? 'bg-amber-100 text-amber-800 font-medium'
                                        : 'text-gray-700 hover:bg-white hover:text-amber-600'
                                }`}
                            >
                                {brand.name}
                            </button>
                        ))}
                    </div>

                    {/* Lien voir tout */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Link
                            href={route('frontend.shop.index', { category: type })}
                            className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
                        >
                            Voir toutes les {type === 'sneakers' ? 'sneakers' : 'pièces streetwear'} →
                        </Link>
                    </div>
                </div>

                {/* Colonne droite - Sous-catégories */}
                <div className="w-2/3 p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                        {brands.find(b => b.id === activeCategory)?.name || 'Sélections'}
                    </h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {subcategories.map((subcategory, index) => (
                            <Link
                                key={index}
                                href={route('frontend.shop.index', { 
                                    search: subcategory,
                                    category: type 
                                })}
                                className="flex items-center text-gray-700 hover:text-amber-600 transition-colors duration-200 py-1"
                            >
                                <span className="text-sm font-medium">{subcategory}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Section populaire */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h5 className="text-md font-bold text-gray-900 mb-3">
                            {type === 'sneakers' ? '🔥 Tendances Sneakers' : '🔥 Tendances Streetwear'}
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                            {type === 'sneakers' ? (
                                <>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Jordan 1' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        Air Jordan 1 Retro
                                    </Link>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Dunk Low' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        Nike Dunk Low
                                    </Link>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'New Balance 550' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        New Balance 550
                                    </Link>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Yeezy 350' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        Yeezy 350 V2
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Supreme Box Logo' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        Supreme Box Logo
                                    </Link>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Off-White Hoodie' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        Off-White Hoodies
                                    </Link>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Fear of God Essentials' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        FOG Essentials
                                    </Link>
                                    <Link 
                                        href={route('frontend.shop.index', { search: 'Palm Angels' })}
                                        className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                                    >
                                        Palm Angels Track
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Call to action */}
                    <div className="mt-6">
                        <Link
                            href={route('frontend.shop.index', { category: type })}
                            className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-full hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Explorer la collection →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MegaMenu;