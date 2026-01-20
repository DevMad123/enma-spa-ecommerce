import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

// ANCIEN MEGAMENU - Conservé pour référence
const MegaMenu_old = ({ isOpen, type, categories = [] }) => {
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
            {/* Ancien contenu ici... */}
            <div>Ancien MegaMenu</div>
        </div>
    );
};

// NOUVEAU MEGAMENU PHENOMENAL - Inspiré de Fenom.com
const MegaMenuFenomenal = ({ isOpen, type, categories = [], translateX }) => {
    const [activeCategory, setActiveCategory] = useState('sneakers-homme');
    
    // Structure des données selon le design Fenom
    const navigationItems = [
        {
            id: 'sneakers-homme',
            name: 'SNEAKERS HOMME',
            collections: [
                'Asics Gel-Kayano 14',
                'Nike Air Max',
                'Salomon XT-6',
                'Adidas Spezial',
                'New Balance 2010',
                'Nike Air Force 1',
                'Adidas Samba'
            ],
            brands: [
                'Sneakers Adidas Homme',
                'Sneakers Asics Homme',
                'Sneakers Converse Homme',
                'Sneakers Jordan Homme',
                'Sneakers New Balance Homme',
                'Sneakers Nike Homme',
                'Sneakers Puma Homme',
                'Sneakers Reebok Homme',
                'Sneakers Salomon Homme'
            ]
        },
        {
            id: 'vetements-homme',
            name: 'VÊTEMENTS HOMME',
            collections: [
                'Stone Island',
                'CP Company',
                'Palace',
                'Supreme',
                'Stussy',
                'Carhartt WIP',
                'Brain Dead'
            ],
            brands: [
                'T-Shirts Homme',
                'Hoodies Homme',
                'Sweatshirts Homme',
                'Pantalons Homme',
                'Shorts Homme',
                'Vestes Homme',
                'Manteaux Homme',
                'Accessoires Homme'
            ]
        },
        {
            id: 'accessoires-homme',
            name: 'ACCESSOIRES HOMME',
            collections: [
                'Casquettes',
                'Bonnets',
                'Sacs à dos',
                'Portefeuilles',
                'Ceintures',
                'Lunettes',
                'Montres'
            ],
            brands: [
                'Nike Accessoires',
                'Adidas Accessoires',
                'New Era',
                'Carhartt WIP',
                'Supreme Accessoires',
                'Palace Accessoires',
                'Stone Island Accessoires'
            ]
        }
    ];

    const currentItem = navigationItems.find(item => item.id === activeCategory) || navigationItems[0];

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="flex absolute top-full left-1/2 -translate-x-[30%] bg-white z-50"
  style={{
    '--tw-translate-x': translateX,
    width: '90vw',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    left: 0,
    right: 0,
  }}
        >
            <div className="flex h-full flex-1">
                {/* COLONNE GAUCHE - Navigation principale */}
                <div 
                    className="bg-black text-white flex-none"
                    style={{ width: '260px' }}
                >
                    <div className="py-4">
                        {navigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleCategoryChange(item.id)}
                                onMouseEnter={() => handleCategoryChange(item.id)}
                                className={`w-full text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 flex items-center justify-between group megamenu-nav-item ${
                                    activeCategory === item.id
                                        ? 'bg-gray-800 active'
                                        : 'hover:bg-gray-800'
                                }`}
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    letterSpacing: '0.05em',
                                    paddingTop: '16px',
                                    paddingBottom: '16px'
                                }}
                            >
                                {item.name}
                                <svg 
                                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

                {/* COLONNE CENTRALE - Collections */}
                <div 
                    className="bg-white flex-none px-8 py-8"
                    style={{ width: '250px' }}
                >
                    <h3 
                        className="text-gray-900 font-bold mb-6"
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}
                    >
                        COLLECTIONS
                    </h3>
                    
                    <div className="space-y-3">
                        {currentItem.collections.map((collection, index) => (
                            <Link
                                key={index}
                                href={route('frontend.shop.index', { 
                                    search: collection,
                                    category: type 
                                })}
                                className="block text-gray-800 hover:text-black hover:underline transition-colors duration-200 megamenu-link"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    lineHeight: '2'
                                }}
                            >
                                {collection}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* COLONNE DROITE - Marques/Catégories */}
                <div className="bg-white flex-1 px-8 py-8">
                    <h3 
                        className="text-gray-900 font-bold mb-6"
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}
                    >
                        {currentItem.name}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {currentItem.brands.map((brand, index) => (
                            <Link
                                key={index}
                                href={route('frontend.shop.index', { 
                                    search: brand,
                                    category: type 
                                })}
                                className="text-gray-800 hover:text-black hover:underline transition-colors duration-200 megamenu-link"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    lineHeight: '2'
                                }}
                            >
                                {brand}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MegaMenuFenomenal;
export { MegaMenu_old };

// Composant MegaMenuFenomenal Mobile
export const MegaMenuFenomenalMobile = ({ type, categories = [], isOpen, onClose }) => {
    const [activeAccordion, setActiveAccordion] = useState(null);
    
    const navigationItems = [
        {
            id: 'sneakers-homme',
            name: 'SNEAKERS HOMME',
            collections: [
                'Asics Gel-Kayano 14',
                'Nike Air Max',
                'Salomon XT-6',
                'Adidas Spezial',
                'New Balance 2010',
                'Nike Air Force 1',
                'Adidas Samba'
            ],
            brands: [
                'Sneakers Adidas Homme',
                'Sneakers Asics Homme',
                'Sneakers Converse Homme',
                'Sneakers Jordan Homme',
                'Sneakers New Balance Homme',
                'Sneakers Nike Homme',
                'Sneakers Puma Homme',
                'Sneakers Reebok Homme',
                'Sneakers Salomon Homme'
            ]
        },
        {
            id: 'vetements-homme',
            name: 'VÊTEMENTS HOMME',
            collections: [
                'Stone Island',
                'CP Company',
                'Palace',
                'Supreme',
                'Stussy',
                'Carhartt WIP',
                'Brain Dead'
            ],
            brands: [
                'T-Shirts Homme',
                'Hoodies Homme',
                'Sweatshirts Homme',
                'Pantalons Homme',
                'Shorts Homme',
                'Vestes Homme',
                'Manteaux Homme',
                'Accessoires Homme'
            ]
        },
        {
            id: 'accessoires-homme',
            name: 'ACCESSOIRES HOMME',
            collections: [
                'Casquettes',
                'Bonnets',
                'Sacs à dos',
                'Portefeuilles',
                'Ceintures',
                'Lunettes',
                'Montres'
            ],
            brands: [
                'Nike Accessoires',
                'Adidas Accessoires',
                'New Era',
                'Carhartt WIP',
                'Supreme Accessoires',
                'Palace Accessoires',
                'Stone Island Accessoires'
            ]
        }
    ];

    const toggleAccordion = (itemId) => {
        setActiveAccordion(activeAccordion === itemId ? null : itemId);
    };

    if (!isOpen) return null;

    return (
        <div className="space-y-2" style={{ fontFamily: 'Barlow, sans-serif' }}>
            {navigationItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleAccordion(item.id)}
                        className="w-full px-4 py-4 text-left font-semibold text-black hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between bg-white"
                        style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            letterSpacing: '0.05em'
                        }}
                    >
                        {item.name}
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${
                                activeAccordion === item.id ? 'rotate-180' : ''
                            }`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    {activeAccordion === item.id && (
                        <div className="border-t border-gray-200 bg-gray-50">
                            {/* Collections */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                    Collections
                                </h4>
                                <div className="space-y-1">
                                    {item.collections.map((collection, index) => (
                                        <Link
                                            key={index}
                                            href={route('frontend.shop.index', { 
                                                search: collection,
                                                category: type 
                                            })}
                                            onClick={onClose}
                                            className="block text-gray-600 hover:text-black transition-colors duration-200 py-1 text-sm"
                                        >
                                            {collection}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Brands */}
                            <div className="px-4 py-3">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                    Catégories
                                </h4>
                                <div className="space-y-1">
                                    {item.brands.map((brand, index) => (
                                        <Link
                                            key={index}
                                            href={route('frontend.shop.index', { 
                                                search: brand,
                                                category: type 
                                            })}
                                            onClick={onClose}
                                            className="block text-gray-600 hover:text-black transition-colors duration-200 py-1 text-sm"
                                        >
                                            {brand}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

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