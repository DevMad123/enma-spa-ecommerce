import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Bars3Icon,
    UserIcon,
    MagnifyingGlassIcon,
    HeartIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

/**
 * MobileBottomMenu - Menu fixe en bas de l'écran pour mobile
 * 
 * Ordre des icônes :
 * 1. Menu (☰)
 * 2. Account
 * 3. Search (CENTRAL - mis en avant)
 * 4. Wishlist
 * 5. Cart (avec badge)
 * 
 * Caractéristiques :
 * - Position fixe en bas
 * - Search button central plus grand et élevé
 * - Badges sur wishlist et cart
 * - Uniquement visible sur mobile (<768px)
 */

const MobileBottomMenu = ({
    onMenuClick,
    onSearchClick,
    cartItemsCount = 0,
    wishlistItemsCount = 0,
    auth = {}
}) => {
    return (
        <div className="md:hidden fixed left-0 right-0 z-[9998] bg-white border-t border-gray-100 shadow-lg" style={{ bottom: '30px', margin: '0 30px', borderRadius: '45px' }}>
            <div className="relative flex items-end justify-around px-2 py-1">
                {/* 1. Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center flex-1 py-2 px-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Ouvrir le menu"
                >
                    <Bars3Icon className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-medium">Menu</span>
                </button>

                {/* 2. Account Button */}
                <Link
                    href={auth.user ? route('frontend.profile.index') : route('login')}
                    className="flex flex-col items-center justify-center flex-1 py-2 px-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Compte"
                >
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] mt-1 font-medium">Compte</span>
                </Link>

                {/* 3. Search Button (CENTRAL - MIS EN AVANT) */}
                <div className="flex-1 flex items-center justify-center -mt-6">
                    <button
                        onClick={onSearchClick}
                        className="flex items-center absolute justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                        aria-label="Rechercher"
                        style={{
                            width: '4.5rem',
                            height: '4.5rem',
                            bottom: '10px'
                        }}
                    >
                        <MagnifyingGlassIcon className="w-7 h-7" strokeWidth={2.5} />
                    </button>
                </div>

                {/* 4. Wishlist Button */}
                <Link
                    href={route('frontend.wishlist.index')}
                    className="flex flex-col items-center justify-center flex-1 py-2 px-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                    aria-label="Favoris"
                >
                    <div className="relative">
                        <HeartIcon className="w-6 h-6" />
                        {wishlistItemsCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {wishlistItemsCount > 9 ? '9+' : wishlistItemsCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] mt-1 font-medium">Favoris</span>
                </Link>

                {/* 5. Cart Button */}
                <Link
                    href={route('frontend.cart.index')}
                    className="flex flex-col items-center justify-center flex-1 py-2 px-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                    aria-label="Panier"
                >
                    <div className="relative">
                        <ShoppingCartIcon className="w-6 h-6" />
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {cartItemsCount > 9 ? '9+' : cartItemsCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] mt-1 font-medium">Panier</span>
                </Link>
            </div>
        </div>
    );
};

export default MobileBottomMenu;
