import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children, initialWishlistItems = [] }) => {
    const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);

    // Initialiser avec les données du serveur
    useEffect(() => {
        if (initialWishlistItems.length > 0) {
            setWishlistItems(initialWishlistItems);
        }
    }, [initialWishlistItems]);

    const addToWishlist = (product) => {
        // Optimistic update
        setWishlistItems(prev => [...prev, { product }]);
        
        // API call
        router.post(route('frontend.wishlist.store'), {
            product_id: product.id
        }, {
            preserveState: true,
            onSuccess: () => {
                // La mise à jour optimiste est déjà faite
            },
            onError: () => {
                // Rollback en cas d'erreur
                setWishlistItems(prev => prev.filter(item => item.product.id !== product.id));
            }
        });
    };

    const removeFromWishlist = (productId) => {
        // Optimistic update
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        
        // API call
        router.delete(route('frontend.wishlist.destroy', productId), {
            preserveState: true,
            onSuccess: () => {
                // La mise à jour optimiste est déjà faite
            },
            onError: () => {
                // Rollback en cas d'erreur - on devrait récupérer l'item depuis le serveur
                router.reload({ only: ['wishlistItems'] });
            }
        });
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.product.id === productId);
    };

    const getTotalItems = () => {
        return wishlistItems.length;
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            getTotalItems
        }}>
            {children}
        </WishlistContext.Provider>
    );
};