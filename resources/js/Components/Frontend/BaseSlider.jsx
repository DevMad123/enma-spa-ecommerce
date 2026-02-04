import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * BaseSlider - Composant réutilisable pour tous les sliders (produits, catégories, marques, etc.)
 * 
 * @param {Object} props
 * @param {Array} props.items - Liste des éléments à afficher
 * @param {Function} props.renderItem - Fonction pour rendre chaque élément
 * @param {string} props.title - Titre du slider
 * @param {ReactNode} props.icon - Icône optionnelle à côté du titre
 * @param {string} props.backgroundColor - Couleur de fond (défaut: bg-white)
 * @param {number} props.gap - Espacement entre les items en px (défaut: 24 pour produits, 16 pour catégories)
 * @param {Object} props.breakpoints - Configuration responsive { mobile, tablet, desktop }
 */
export default function BaseSlider({
    items = [],
    renderItem,
    title = '',
    icon = null,
    backgroundColor = 'bg-white',
    gap = 24,
    breakpoints = {
        mobile: 1.5,    // < 768px
        tablet: 2.5,    // 768-1023px
        desktop: 4      // >= 1024px
    }
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef(null);
    const [itemWidth, setItemWidth] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Calcul dynamique de la largeur d'un item
    useEffect(() => {
        const calculateItemWidth = () => {
            if (sliderRef.current && sliderRef.current.children.length > 0) {
                const firstItem = sliderRef.current.children[0];
                const rect = firstItem.getBoundingClientRect();
                const computedGap = parseFloat(getComputedStyle(sliderRef.current).gap) || gap;
                setItemWidth(rect.width + computedGap);
            }
        };

        calculateItemWidth();
        window.addEventListener('resize', calculateItemWidth);
        
        return () => window.removeEventListener('resize', calculateItemWidth);
    }, [items, gap]);

    // Nombre d'items visibles par breakpoint
    const getItemsPerView = () => {
        if (typeof window === 'undefined') return breakpoints.desktop;
        const width = window.innerWidth;
        if (width < 768) return breakpoints.mobile;
        if (width < 1024) return breakpoints.tablet;
        return breakpoints.desktop;
    };

    const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView());
            setCurrentIndex(0);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    // Support tactile (swipe)
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    // Calcul des largeurs CSS selon les breakpoints
    const getItemWidthClasses = () => {
        const mobilePercent = 100 / breakpoints.mobile;
        const tabletPercent = 100 / breakpoints.tablet;
        const desktopPercent = 100 / breakpoints.desktop;
        
        const gapAdjustment = {
            mobile: gap * (breakpoints.mobile - 1) / breakpoints.mobile,
            tablet: gap * (breakpoints.tablet - 1) / breakpoints.tablet,
            desktop: gap * (breakpoints.desktop - 1) / breakpoints.desktop
        };
        
        return `flex-none w-[calc(${mobilePercent}%-${gapAdjustment.mobile}px)] md:w-[calc(${tabletPercent}%-${gapAdjustment.tablet}px)] lg:w-[calc(${desktopPercent}%-${gapAdjustment.desktop}px)]`;
    };

    if (!items.length) return null;

    return (
        <section className={`py-[30px] md:py-[60px] ${backgroundColor}`}>
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                {/* Header avec titre et navigation */}
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
                <div 
                    className="relative overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div 
                        ref={sliderRef}
                        className={`flex transition-transform duration-500 ease-out gap-${gap === 24 ? '6' : '4'}`}
                        style={{ 
                            transform: itemWidth > 0 ? `translateX(-${currentIndex * itemWidth}px)` : 'translateX(0)'
                        }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={item.id || index}
                                className={getItemWidthClasses()}
                            >
                                {renderItem(item)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation Dots */}
                <div className="flex md:hidden items-center justify-center mt-8 space-x-1">
                    {Array.from({ length: Math.ceil(items.length / breakpoints.mobile) }).map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-black w-6'
                                    : 'bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
