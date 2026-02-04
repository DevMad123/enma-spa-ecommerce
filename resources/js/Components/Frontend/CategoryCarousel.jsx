import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CategoryCard = ({ category }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const getImage = (c) => {
        return (
            c.image || c.photo || c.icon || c.banner || '/images/category-placeholder.jpg'
        );
    };

    return (
        <div className="group cursor-pointer" style={{ fontFamily: 'Barlow, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <Link href={route('frontend.shop.category', category.id)}>
                {/* Image avec ratio plus grand que les produits */}
                <div className="relative bg-gray-50 overflow-hidden mb-3" style={{ aspectRatio: '1 / 1.2' }}>
                    <img
                        src={getImage(category)}
                        alt={category.name || 'Catégorie'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>

                {/* Category Info */}
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {category.name || 'Catégorie'}
                    </h3>
                </div>
            </Link>
        </div>
    );
};

// Category Carousel Component - Structure identique à ProductSlider
const CategoryCarousel = ({ 
    title = "CATÉGORIES", 
    icon = null,
    categories = [], 
    backgroundColor = "bg-white"
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef(null);
    const [itemWidth, setItemWidth] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    
    // Utiliser directement les catégories sans filtre
    const displayedCategories = categories;
    
    // Calcul dynamique de la largeur d'un item
    useEffect(() => {
        const calculateItemWidth = () => {
            if (sliderRef.current && sliderRef.current.children.length > 0) {
                const firstItem = sliderRef.current.children[0];
                const rect = firstItem.getBoundingClientRect();
                const gap = parseFloat(getComputedStyle(sliderRef.current).gap) || 24;
                setItemWidth(rect.width + gap);
            }
        };

        calculateItemWidth();
        window.addEventListener('resize', calculateItemWidth);
        
        return () => window.removeEventListener('resize', calculateItemWidth);
    }, [displayedCategories]);
    
    // Nombre de catégories visibles par breakpoint
    const getItemsPerView = () => {
        if (typeof window === 'undefined') return 4;
        const width = window.innerWidth;
        if (width < 768) return 1.5; // Mobile : 1.5 catégories
        if (width < 1024) return 2.5; // Tablette : 2.5 catégories
        return 4; // Desktop : 4 catégories
    };
    
    const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
    
    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView());
            setCurrentIndex(0); // Reset à la position initiale lors du resize
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const maxIndex = Math.max(0, displayedCategories.length - Math.floor(itemsPerView));

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
        const minSwipeDistance = 50; // Seuil minimum pour déclencher le swipe
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe vers la gauche - slide suivant
                nextSlide();
            } else {
                // Swipe vers la droite - slide précédent
                prevSlide();
            }
        }
        
        // Reset
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    if (!displayedCategories.length) return null;

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
                <div 
                    className="relative overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div 
                        ref={sliderRef}
                        className="flex transition-transform duration-500 ease-out gap-6"
                        style={{ 
                            transform: itemWidth > 0 ? `translateX(-${currentIndex * itemWidth}px)` : 'translateX(0)'
                        }}
                    >
                        {displayedCategories.map((category) => (
                            <div
                                key={category?.id || Math.random()}
                                className="flex-none w-[calc(66.67%-16px)] md:w-[calc(40%-12px)] lg:w-[calc(25%-18px)]"
                            >
                                <CategoryCard category={category} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation Dots */}
                <div className="flex md:hidden items-center justify-center mt-8 space-x-1">
                    {Array.from({ length: Math.ceil(displayedCategories.length / 1.5) }).map((_, index) => (
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
};

export default CategoryCarousel;
