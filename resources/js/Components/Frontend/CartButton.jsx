import React, { useState, useRef, forwardRef } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/Layouts/FrontendLayout';
import { useNotification } from '@/Components/Notifications/NotificationProvider';
import { useCartAnimation, RippleButton, LoadingSpinner } from '@/Components/Animations/AnimationComponents';

const CartButton = forwardRef(({ 
    product, 
    quantity = 1, 
    selectedColor = null, 
    selectedSize = null, 
    className = "",
    size = "default",
    variant = "gradient",
    showAnimation = true,
    onValidationError = null,
    children = null 
}, ref) => {
    const { addToCart } = useCart();
    const { showSuccess, showError, showWarning } = useNotification();
    const { animateToCart, isAnimating } = useCartAnimation();
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const buttonRef = useRef(null);

    // Configuration des tailles
    const sizeConfig = {
        small: {
            button: "px-3 py-2 text-sm",
            icon: "h-4 w-4",
            text: "text-sm"
        },
        default: {
            button: "px-4 py-3",
            icon: "h-5 w-5", 
            text: "text-base"
        },
        large: {
            button: "px-8 py-4 text-lg",
            icon: "h-6 w-6",
            text: "text-lg"
        }
    };

    const currentSize = sizeConfig[size] || sizeConfig.default;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        
        // Vérifications préliminaires
        if (isAdding || justAdded) return;

        // Vérifier la disponibilité du stock
        if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
            showError("Ce produit est actuellement en rupture de stock", "Stock insuffisant");
            return;
        }

        // Vérifier les variantes requises
        const requiredColor = product.colors && product.colors.length > 0;
        const requiredSize = product.sizes && product.sizes.length > 0;

        if (requiredColor && !selectedColor) {
            showWarning("Veuillez sélectionner une couleur", "Sélection requise");
            return;
        }
        if (requiredSize && !selectedSize) {
            showWarning("Veuillez sélectionner une taille", "Sélection requise");
            return;
        }

        setIsAdding(true);

        try {
            // Ajouter au panier
            const success = addToCart(product, quantity, selectedColor?.id, selectedSize?.id);
            
            if (success !== false) {
                // Animation vers le panier si demandée
                if (showAnimation && buttonRef.current) {
                    const cartIcon = document.querySelector('[data-cart-icon]');
                    if (cartIcon) {
                        animateToCart(
                            buttonRef.current, 
                            cartIcon, 
                            product.image || '/images/placeholder.jpg'
                        );
                    }
                }

                // Feedback visuel du bouton
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 2000);

                // Notification de succès
                const variants = [];
                if (selectedColor) variants.push(`Couleur: ${selectedColor.name}`);
                if (selectedSize) variants.push(`Taille: ${selectedSize.name}`);
                
                const variantText = variants.length > 0 ? ` (${variants.join(', ')})` : '';
                showSuccess(
                    `${product.name}${variantText} ajouté au panier`, 
                    "🛒 Produit ajouté",
                    { duration: 3000 }
                );
            } else {
                showError("Impossible d'ajouter le produit au panier", "Erreur");
            }
        } catch (error) {
            showError("Une erreur s'est produite lors de l'ajout au panier", "Erreur technique");
            console.error('Erreur ajout panier:', error);
        } finally {
            setIsAdding(false);
        }
    };

    // Contenu du bouton
    const renderButtonContent = () => {
        if (isAdding) {
            return (
                <>
                    <LoadingSpinner size={size} />
                    <span className={currentSize.text}>Ajout...</span>
                </>
            );
        }

        if (justAdded) {
            return (
                <>
                    <CheckIcon className={`${currentSize.icon} text-green-500`} />
                    <span className={currentSize.text}>Ajouté !</span>
                </>
            );
        }

        if (children) {
            return children;
        }

        return (
            <>
                <ShoppingCartIcon className={currentSize.icon} />
                <span className={currentSize.text}>
                    {product.stock_quantity <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </span>
            </>
        );
    };

    // Classes CSS dynamiques
    const getButtonClasses = () => {
        const baseClasses = `
            ${currentSize.button}
            font-medium rounded-xl transition-all duration-200
            flex items-center justify-center space-x-2
            disabled:cursor-not-allowed
        `;

        if (product.stock_quantity <= 0) {
            return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed ${className}`;
        }

        if (justAdded) {
            return `
                ${baseClasses}
                bg-green-500 text-white
                shadow-lg transform scale-105
                ${className}
            `;
        }

        if (isAdding || isAnimating) {
            return `
                ${baseClasses}
                bg-gradient-to-r from-amber-400 to-orange-500 text-white
                opacity-80 cursor-wait
                ${className}
            `;
        }

        return `
            ${baseClasses}
            bg-gradient-to-r from-amber-500 to-orange-600 text-white
            hover:from-amber-600 hover:to-orange-700
            shadow-lg hover:shadow-xl transform hover:scale-105
            ${className}
        `;
    };

    return (
        <RippleButton
            ref={ref || buttonRef}
            onClick={handleAddToCart}
            disabled={isAdding || justAdded || product.stock_quantity <= 0}
            className={getButtonClasses()}
            title={
                product.stock_quantity <= 0 
                    ? "Produit en rupture de stock"
                    : "Ajouter ce produit au panier"
            }
        >
            {renderButtonContent()}
        </RippleButton>
    );
});

// Définir displayName pour le debugging
CartButton.displayName = 'CartButton';

export default CartButton;