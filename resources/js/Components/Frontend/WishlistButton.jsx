import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
    HeartIcon as HeartIconSolid,
    ShoppingCartIcon 
} from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/Components/Notifications/NotificationProvider';
import { RippleButton } from '@/Components/Animations/AnimationComponents';
import { useWishlist } from '@/Contexts/WishlistContext';

const WishlistButton = ({ product, className = "", size = "default" }) => {
    const { auth } = usePage().props;
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { showSuccess, showError, showInfo } = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    
    const inWishlist = isInWishlist(product.id);

    // Tailles des boutons
    const sizeClasses = {
        small: {
            button: "p-2",
            icon: "h-4 w-4"
        },
        default: {
            button: "p-3",
            icon: "h-5 w-5"
        },
        large: {
            button: "p-4",
            icon: "h-6 w-6"
        }
    };

    const currentSize = sizeClasses[size] || sizeClasses.default;

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.user) {
            showInfo("Connectez-vous pour ajouter des produits à votre wishlist", "Connexion requise");
            router.visit(route('login'));
            return;
        }

        setIsLoading(true);

        try {
            if (inWishlist) {
                // Retirer de la wishlist avec contexte (optimistic update)
                removeFromWishlist(product.id);
                showSuccess(`${product.name} retiré de votre wishlist`, "💔 Produit retiré");
            } else {
                // Ajouter à la wishlist avec contexte (optimistic update)
                addToWishlist(product);
                showSuccess(`${product.name} ajouté à votre wishlist`, "❤️ Produit ajouté");
            }
        } catch (error) {
            console.error('Erreur wishlist:', error);
            showError("Une erreur inattendue s'est produite", "Erreur technique");
            console.error('Erreur wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RippleButton
            onClick={handleWishlistToggle}
            disabled={isLoading}
            className={`
                ${currentSize.button}
                bg-white/90 backdrop-blur-sm rounded-full 
                border border-gray-200 shadow-sm
                hover:bg-white hover:shadow-md
                transition-all duration-200 group
                ${isLoading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}
                ${isInWishlist ? 'animate-pulse-glow' : ''}
                ${className}
            `}
            title={
                !auth.user 
                    ? "Connectez-vous pour ajouter à votre wishlist"
                    : isInWishlist 
                        ? "Retirer de la wishlist" 
                        : "Ajouter à la wishlist"
            }
        >
            {isLoading ? (
                <div className={`${currentSize.icon} animate-spin rounded-full border-2 border-current border-t-transparent text-gray-400`} />
            ) : inWishlist ? (
                <HeartIconSolid 
                    className={`
                        ${currentSize.icon} 
                        text-red-500 
                        group-hover:scale-110
                        transition-transform duration-200
                        animate-bounce-in
                    `} 
                />
            ) : (
                <HeartIcon 
                    className={`
                        ${currentSize.icon} 
                        text-gray-600 
                        group-hover:text-red-500 
                        group-hover:scale-110
                        transition-all duration-200
                    `} 
                />
            )}
        </RippleButton>
    );
};

export default WishlistButton;