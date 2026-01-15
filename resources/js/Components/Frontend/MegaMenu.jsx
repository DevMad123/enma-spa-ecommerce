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
            subcategories: ['Air Force 1', 'Air Jordan 1', 'Air Max 90', 'Dunk Low', 'Blazer Mid', 'Air Jordan 4', 'React', 'VaporMax']
        },
        { 
            id: 'adidas', 
            name: 'Adidas', 
            subcategories: ['Stan Smith', 'Gazelle', 'Forum Low', 'Superstar', 'Samba OG', 'Campus 00s', 'Ultraboost', 'NMD']
        },
        { 
            id: 'jordan', 
            name: 'Jordan', 
            subcategories: ['Air Jordan 1', 'Air Jordan 3', 'Air Jordan 4', 'Air Jordan 11', 'Air Jordan 6', 'Jordan Delta', 'Jordan Max Aura', 'Jordan Why Not']
        },
        { 
            id: 'new-balance', 
            name: 'New Balance', 
            subcategories: ['550', '574', '327', '990v5', '2002R', '9060', '1906R', '530']
        },
        { 
            id: 'puma', 
            name: 'Puma', 
            subcategories: ['Suede Classic', 'RS-X', 'Clyde Court', 'Cali Sport', 'Thunder', 'Cell Endura', 'Mayze', 'Kosmo Rider']
        },
        { 
            id: 'yeezy', 
            name: 'Yeezy', 
            subcategories: ['350 V2', '700', '500', 'Foam Runner', '380', 'Slide', '450', 'QNTM']
        }
    ];

    const streetwearBrands = [
        { 
            id: 'supreme', 
            name: 'Supreme', 
            subcategories: ['Box Logo', 'T-Shirts', 'Hoodies', 'Accessories', 'Jackets', 'Pants', 'Caps', 'Bags']
        },
        { 
            id: 'off-white', 
            name: 'Off-White', 
            subcategories: ['Graphic Tees', 'Hoodies', 'Jeans', 'Sneakers', 'Bags', 'Belts', 'Jackets', 'Accessories']
        },
        { 
            id: 'stussy', 
            name: 'Stussy', 
            subcategories: ['8 Ball', 'Stock Logo', 'Hoodies', 'T-Shirts', 'Caps', 'Shorts', 'Jackets', 'Sweatpants']
        },
        { 
            id: 'kith', 
            name: 'Kith', 
            subcategories: ['Williams III', 'Classics', 'Hoodies', 'Sweatshirts', 'Tees', 'Accessories', 'Shorts', 'Outerwear']
        },
        { 
            id: 'fear-of-god', 
            name: 'Fear of God', 
            subcategories: ['Essentials', 'Main Line', 'Hoodies', 'T-Shirts', 'Pants', 'Shorts', 'Jackets', 'Sneakers']
        },
        { 
            id: 'palm-angels', 
            name: 'Palm Angels', 
            subcategories: ['Track Suits', 'Hoodies', 'T-Shirts', 'Jeans', 'Accessories', 'Sneakers', 'Jackets', 'Shorts']
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
        <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white z-50 transition-all duration-300 ease-out shadow-xl border border-gray-100"
            style={{
                width: '90vw',
                maxWidth: '1200px',
                minWidth: '800px',
                padding: '40px',
            }}
        >
            <div className="w-full">
                <div className="flex gap-8">
                    {/* COLONNE GAUCHE - CATEGORIES (30%) */}
                    <div className="w-80 flex-shrink-0 pr-8">
                        <div className="space-y-2">
                            {brands.map((brand) => (
                                <button
                                    key={brand.id}
                                    onMouseEnter={() => handleCategoryHover(brand)}
                                    className={`w-full text-left px-4 py-3 transition-all duration-200 ${
                                        activeCategory === brand.id
                                            ? 'bg-gray-50 text-black font-semibold'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-black hover:font-semibold'
                                    }`}
                                    style={{
                                        fontSize: '15px',
                                        backgroundColor: activeCategory === brand.id ? '#f7f7f7' : 'transparent',
                                        fontWeight: activeCategory === brand.id ? 600 : 400
                                    }}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>

                        {/* Lien voir tout */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Link
                                href={route('frontend.shop.index', { category: type })}
                                className="inline-flex items-center text-black hover:text-gray-600 transition-colors duration-200"
                                style={{ fontSize: '14px', fontWeight: 500 }}
                            >
                                Voir tout →
                            </Link>
                        </div>
                    </div>

                    {/* COLONNE DROITE - SOUS-CATEGORIES (Reste de l'espace) */}
                    <div className="flex-1 pl-8 border-l border-gray-100 min-w-0">
                        <div className="mb-6">
                            <h4 
                                className="text-black font-semibold mb-6"
                                style={{ fontSize: '16px', fontWeight: 600 }}
                            >
                                {brands.find(b => b.id === activeCategory)?.name || 'Collection'}
                            </h4>
                            
                            <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
                                {subcategories.map((subcategory, index) => (
                                    <Link
                                        key={index}
                                        href={route('frontend.shop.index', { 
                                            search: subcategory,
                                            category: type 
                                        })}
                                        className="text-gray-700 hover:text-black transition-colors duration-200 py-2 truncate"
                                        style={{ fontSize: '14px', fontWeight: 400 }}
                                        title={subcategory}
                                    >
                                        {subcategory}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Section tendances */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h5 
                                className="text-black font-semibold mb-4"
                                style={{ fontSize: '14px', fontWeight: 600 }}
                            >
                                🔥 Tendances
                            </h5>
                            <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-3">
                                {type === 'sneakers' ? (
                                    <>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Jordan 1' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="Jordan 1 Retro"
                                        >
                                            Jordan 1 Retro
                                        </Link>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Dunk Low' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="Nike Dunk Low"
                                        >
                                            Nike Dunk Low
                                        </Link>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'New Balance 550' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="New Balance 550"
                                        >
                                            New Balance 550
                                        </Link>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Yeezy 350' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="Yeezy 350 V2"
                                        >
                                            Yeezy 350 V2
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Supreme Box Logo' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="Supreme Box Logo"
                                        >
                                            Supreme Box Logo
                                        </Link>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Off-White Hoodie' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="Off-White Hoodies"
                                        >
                                            Off-White Hoodies
                                        </Link>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Fear of God Essentials' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="FOG Essentials"
                                        >
                                            FOG Essentials
                                        </Link>
                                        <Link 
                                            href={route('frontend.shop.index', { search: 'Palm Angels' })}
                                            className="text-gray-600 hover:text-black transition-colors duration-200 truncate"
                                            style={{ fontSize: '13px' }}
                                            title="Palm Angels Track"
                                        >
                                            Palm Angels Track
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Call to action */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Link
                                href={route('frontend.shop.index', { category: type })}
                                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
                                style={{ fontSize: '14px', fontWeight: 500 }}
                            >
                                Explorer toute la collection →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MegaMenu;

// Composant MegaMenu Mobile (pour l'intégration dans le menu burger)
export const MegaMenuMobile = ({ type, categories = [], isOpen, onClose }) => {
    const [activeAccordion, setActiveAccordion] = useState(null);

    const sneakerBrands = [
        { 
            id: 'nike', 
            name: 'Nike', 
            subcategories: ['Air Force 1', 'Air Jordan 1', 'Air Max 90', 'Dunk Low', 'Blazer Mid', 'Air Jordan 4']
        },
        { 
            id: 'adidas', 
            name: 'Adidas', 
            subcategories: ['Stan Smith', 'Gazelle', 'Forum Low', 'Superstar', 'Samba OG', 'Campus 00s']
        },
        { 
            id: 'jordan', 
            name: 'Jordan', 
            subcategories: ['Air Jordan 1', 'Air Jordan 3', 'Air Jordan 4', 'Air Jordan 11', 'Air Jordan 6', 'Jordan Delta']
        },
        { 
            id: 'new-balance', 
            name: 'New Balance', 
            subcategories: ['550', '574', '327', '990v5', '2002R', '9060']
        },
        { 
            id: 'puma', 
            name: 'Puma', 
            subcategories: ['Suede Classic', 'RS-X', 'Clyde Court', 'Cali Sport', 'Thunder', 'Cell Endura']
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

    const toggleAccordion = (brandId) => {
        setActiveAccordion(activeAccordion === brandId ? null : brandId);
    };

    if (!isOpen) return null;

    return (
        <div className="space-y-4">
            {brands.map((brand) => (
                <div key={brand.id} className="border border-gray-200">
                    <button
                        onClick={() => toggleAccordion(brand.id)}
                        className="w-full px-4 py-3 text-left font-medium text-black hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                    >
                        {brand.name}
                        <span className={`transform transition-transform duration-200 ${
                            activeAccordion === brand.id ? 'rotate-180' : ''
                        }`}>
                            ⌄
                        </span>
                    </button>
                    
                    {activeAccordion === brand.id && (
                        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                            {brand.subcategories.map((subcategory, index) => (
                                <Link
                                    key={index}
                                    href={route('frontend.shop.index', { 
                                        search: subcategory,
                                        category: type 
                                    })}
                                    onClick={onClose}
                                    className="block text-gray-600 hover:text-black transition-colors duration-200 py-1 text-sm"
                                >
                                    {subcategory}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};