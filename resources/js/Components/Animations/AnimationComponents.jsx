import React, { useState, useRef, forwardRef } from 'react';

// Hook pour l'animation "flying cart"
export const useCartAnimation = () => {
    const [isAnimating, setIsAnimating] = useState(false);

    const animateToCart = (sourceElement, cartElement, productImage = null) => {
        if (!sourceElement || !cartElement || isAnimating) return;

        setIsAnimating(true);

        // Récupérer les positions des éléments
        const sourceRect = sourceElement.getBoundingClientRect();
        const cartRect = cartElement.getBoundingClientRect();

        // Créer l'élément d'animation
        const animatedElement = document.createElement('div');
        animatedElement.className = `
            fixed pointer-events-none z-[9999] 
            w-12 h-12 rounded-lg bg-white shadow-2xl
            border-2 border-amber-500
            flex items-center justify-center
            transition-all duration-700 ease-out
        `;

        // Ajouter l'image du produit si fournie
        if (productImage) {
            const img = document.createElement('img');
            img.src = productImage;
            img.className = 'w-full h-full object-cover rounded-md';
            animatedElement.appendChild(img);
        } else {
            // Fallback avec icône panier
            animatedElement.innerHTML = `
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H19"></path>
                </svg>
            `;
        }

        // Position initiale
        animatedElement.style.left = `${sourceRect.left + sourceRect.width / 2 - 24}px`;
        animatedElement.style.top = `${sourceRect.top + sourceRect.height / 2 - 24}px`;
        animatedElement.style.transform = 'scale(1)';

        document.body.appendChild(animatedElement);

        // Animation vers le panier
        requestAnimationFrame(() => {
            animatedElement.style.left = `${cartRect.left + cartRect.width / 2 - 24}px`;
            animatedElement.style.top = `${cartRect.top + cartRect.height / 2 - 24}px`;
            animatedElement.style.transform = 'scale(0.5) rotate(360deg)';
            animatedElement.style.opacity = '0.8';
        });

        // Animation du panier (bounce effect)
        if (cartElement) {
            cartElement.style.transform = 'scale(1.2)';
            cartElement.style.transition = 'transform 0.2s ease-out';
            
            setTimeout(() => {
                cartElement.style.transform = 'scale(1)';
            }, 200);
        }

        // Nettoyage après animation
        setTimeout(() => {
            if (animatedElement.parentNode) {
                document.body.removeChild(animatedElement);
            }
            setIsAnimating(false);
        }, 700);
    };

    return { animateToCart, isAnimating };
};

// Composant pour l'animation de pulse sur les boutons
export const PulseButton = ({ children, isPulsing, className = "", ...props }) => {
    return (
        <button
            className={`
                ${className}
                ${isPulsing ? 'animate-pulse scale-105' : ''}
                transition-all duration-200
            `}
            {...props}
        >
            {children}
        </button>
    );
};

// Composant pour l'effet de "ripple" sur les clics
export const RippleButton = forwardRef(({ children, className = "", onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState([]);
    const internalRef = useRef(null);
    const buttonRef = ref || internalRef;

    const createRipple = (event) => {
        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const newRipple = {
            id: Date.now(),
            x,
            y,
            size
        };

        setRipples(prev => [...prev, newRipple]);

        // Supprimer le ripple après animation
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
    };

    const handleClick = (event) => {
        createRipple(event);
        if (onClick) onClick(event);
    };

    return (
        <button
            ref={buttonRef}
            className={`
                relative overflow-hidden
                ${className}
            `}
            onClick={handleClick}
            {...props}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}
        </button>
    );
});

RippleButton.displayName = 'RippleButton';

// Composant pour l'animation de chargement
export const LoadingSpinner = ({ size = "default", className = "" }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-6 h-6",
        large: "w-8 h-8"
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent">
            </div>
        </div>
    );
};

// Composant pour les micro-interactions de survol
export const HoverCard = ({ children, className = "", hoverScale = true, ...props }) => {
    return (
        <div
            className={`
                ${className}
                transition-all duration-200 ease-out
                ${hoverScale ? 'hover:scale-105 hover:shadow-lg' : ''}
                hover:shadow-xl
            `}
            {...props}
        >
            {children}
        </div>
    );
};