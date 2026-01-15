import React, { useState, useEffect } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link, usePage, router } from '@inertiajs/react';
import {
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FireIcon,
    SparklesIcon,
    TruckIcon,
    ShieldCheckIcon,
    CreditCardIcon,
    HeartIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/Utils/LocaleUtils';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';

// Hero Slider Section
const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Données des slides (vous pouvez les remplacer par des données dynamiques)
    const slides = [
        {
            id: 1,
            title: "NOUVEAUX DROPS",
            subtitle: "Découvrez les dernières sorties exclusives de vos marques préférées",
            ctaText: "DÉCOUVRIR",
            ctaLink: '/shop',
            image: "/images/slides/slide1.jpg", // Remplacez par vos vraies images
            mobileImage: "/images/slides/slide1-mobile.jpg"
        },
        {
            id: 2,
            title: "COLLECTION STREET",
            subtitle: "L'authenticité streetwear rencontre la performance premium",
            ctaText: "SHOP NOW",
            ctaLink: '/shop',
            image: "/images/slides/slide2.jpg",
            mobileImage: "/images/slides/slide2-mobile.jpg"
        },
        {
            id: 3,
            title: "ÉDITIONS LIMITÉES",
            subtitle: "Pièces rares et collaborations exclusives pour vrais passionnés",
            ctaText: "VOIR TOUT",
            ctaLink: '/shop',
            image: "/images/slides/slide3.jpg",
            mobileImage: "/images/slides/slide3-mobile.jpg"
        }
    ];

    // Auto-play slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <section className="relative w-full overflow-hidden">
            {/* Container du slider avec hauteurs responsives */}
            <div 
                className="relative h-[680px] w-full"
                style={{ fontFamily: 'Barlow' }}
            >
                {/* Slides */}
                <div 
                    className="flex transition-transform duration-700 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="min-w-full h-full relative flex items-center"
                        >
                            {/* Image de fond */}
                            <div className="absolute inset-0">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover hidden md:block"
                                />
                                <img
                                    src={slide.mobileImage || slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover md:hidden"
                                />
                                {/* Overlay sombre léger */}
                                <div className="absolute inset-0 bg-black/40"></div>
                            </div>

                            {/* Contenu du slide */}
                            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
                                <div className="max-w-7xl mx-auto">
                                    {/* Desktop: texte à gauche, Mobile: texte centré */}
                                    <div className="text-center md:text-left max-w-2xl md:max-w-none">
                                        {/* Titre */}
                                        <h1 
                                            className="text-white font-bold leading-tight mb-4"
                                            style={{ 
                                                fontSize: '26px',
                                                '@media (min-width: 768px)': {
                                                    fontSize: '42px'
                                                }
                                            }}
                                        >
                                            <span className="text-2xl md:text-5xl font-bold">
                                                {slide.title}
                                            </span>
                                        </h1>

                                        {/* Sous-texte */}
                                        <p className="text-white/90 text-base md:text-lg mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                                            {slide.subtitle}
                                        </p>

                                        {/* Bouton CTA */}
                                        <Link
                                            href={slide.ctaLink}
                                            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-none hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                                            style={{
                                                padding: '16px 32px',
                                                fontSize: '14px',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            {slide.ctaText}
                                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Flèches de navigation */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 z-20"
                    aria-label="Slide précédent"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 z-20"
                    aria-label="Slide suivant"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>

                {/* Indicateurs (dots) */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                currentSlide === index 
                                    ? 'bg-white' 
                                    : 'bg-white/50 hover:bg-white/70'
                            }`}
                            aria-label={`Aller au slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Features Section
const FeaturesSection = () => {
    const features = [
        {
            icon: <TruckIcon className="w-8 h-8" />,
            title: "LIVRAISON GRATUITE",
            description: "Livraison gratuite dès 50€ d'achat"
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8" />,
            title: "AUTHENTICITÉ GARANTIE", 
            description: "100% authentique ou remboursé"
        },
        {
            icon: <CreditCardIcon className="w-8 h-8" />,
            title: "PAIEMENT SÉCURISÉ",
            description: "Paiement en 3x sans frais"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Product Card Modern - Inspiration BSTN
const ModernProductCard = ({ product }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const productUrl = product?.slug ? `/products/${product.slug}` : `/products/${product?.id || '#'}`;

    return (
        <div className="group cursor-pointer" style={{ fontFamily: 'Barlow, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                {/* Badges */}
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {/* Badge EN SOLDE */}
                    {product?.current_sale_price && product?.price && product.price > product.current_sale_price && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
                            EN SOLDE
                        </span>
                    )}
                    
                    {/* Badge SUR COMMANDE */}
                    {product?.is_pre_order && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide">
                            SUR COMMANDE
                        </span>
                    )}
                    
                    {/* Badge 24H */}
                    {product?.fast_delivery && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-sm font-medium tracking-wide flex items-center gap-1">
                            <BoltIcon className="w-3 h-3" />
                            24H
                        </span>
                    )}
                </div>

                {/* Bouton Wishlist */}
                <div className="absolute top-2 right-2 z-20">
                    <WishlistButton 
                        product={product}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm transition-all"
                    />
                </div>

                {/* Product Image */}
                <Link href={productUrl}>
                    <img
                        src={product?.image || '/images/placeholder.jpg'}
                        alt={product?.name || 'Produit'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setIsLoaded(true)}
                    />
                </Link>
            </div>

            {/* Product Info */}
            <Link href={productUrl}>
                <div className="space-y-1">
                    {/* Nom produit */}
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                        {product?.name || 'Nom du produit'}
                    </h3>
                    
                    {/* Catégorie */}
                    {product?.category?.name && (
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                            {product.category.name}
                        </p>
                    )}

                    {/* Prix */}
                    <div className="flex items-center gap-2 pt-1">
                        {product?.current_sale_price && product?.price && product.price > product.current_sale_price ? (
                            <>
                                <span className="text-base font-semibold text-gray-900">
                                    {formatCurrency(product.current_sale_price)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-base font-semibold text-gray-900">
                                {formatCurrency(product?.price || 0)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

// Product Slider Section - Inspiration WeTheNew
const ProductSlider = ({ products = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = {
        mobile: 1.5,
        tablet: 2.4,
        desktop: 4
    };

    // Permettre l'affichage partiel du dernier élément
    const maxIndex = Math.max(0, products.length - Math.floor(itemsPerView.desktop));

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    if (!products.length) return null;

    return (
        <section className="py-[30px] md:py-[60px] bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header avec titre et flèches */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[28px] font-bold text-black font-['Barlow']">
                        TENDANCES
                    </h2>

                    {/* Navigation Arrows */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className="p-2 rounded-full border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={currentIndex >= maxIndex}
                            className="p-2 rounded-full border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="relative overflow-hidden">
                    <div 
                        className="flex transition-transform duration-300 ease-in-out space-x-6"
                        style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)`
                        }}
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex-none w-[66.67%] md:w-[41.67%] lg:w-[calc(24%-9px)]"
                            >
                                <ModernProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// Product Grid Section - Inspiration WeTheNew
const ProductGrid = ({ products = [] }) => {
    // Clean Product Card sans hover effects
    const CleanProductCard = ({ product }) => {
        const productUrl = product?.slug ? `/products/${product.slug}` : `/products/${product?.id || '#'}`;
        
        return (
            <Link href={productUrl} className="block">
                <div className="bg-white">
                    {/* Image Container */}
                    <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                        {/* Badge si nécessaire */}
                        {product?.is_new && (
                            <div className="absolute top-3 left-3 z-10">
                                <span className="bg-black text-white text-xs px-2 py-1 rounded-md font-medium">
                                    NOUVEAU
                                </span>
                            </div>
                        )}
                        {product?.current_sale_price && product?.price && product.price > product.current_sale_price && (
                            <div className="absolute top-3 right-3 z-10">
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                                    PROMO
                                </span>
                            </div>
                        )}

                        {/* Image centrée - aucun effet hover */}
                        <img
                            src={product?.image || '/images/placeholder.jpg'}
                            alt={product?.name || 'Produit'}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Informations produit */}
                    <div className="space-y-2">
                        {/* Nom produit - 15px */}
                        <h3 className="text-[15px] font-medium text-gray-900 line-clamp-2">
                            {product?.name || 'Nom du produit'}
                        </h3>
                        
                        {/* Catégorie */}
                        {product?.category?.name && (
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                                {product.category.name}
                            </p>
                        )}

                        {/* Prix - 14px */}
                        <div className="flex items-center space-x-2">
                            {product?.current_sale_price && product?.price && product.price > product.current_sale_price ? (
                                <>
                                    <span className="text-[14px] font-bold text-black">
                                        {formatCurrency(product.current_sale_price)}
                                    </span>
                                    <span className="text-[12px] text-gray-400 line-through">
                                        {formatCurrency(product.price)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[14px] font-bold text-black">
                                    {formatCurrency(product?.price || 0)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    if (!products.length) return null;

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-black font-['Barlow'] mb-4">
                        SÉLECTION
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Découvrez notre sélection de produits premium
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                    {products.slice(0, 12).map((product) => (
                        <CleanProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Featured Products Section
const FeaturedProductsSection = ({ products = [] }) => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 bg-black text-white text-xs font-bold rounded-full mb-4">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            MUST HAVE
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-black">
                            FEATURED
                            <span className="block text-gray-400">PRODUCTS</span>
                        </h2>
                    </div>
                    <Link 
                        href="/shop"
                        className="inline-flex items-center text-black hover:text-gray-600 font-medium group"
                    >
                        Voir tout
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.slice(0, 8).map((product) => (
                        <ModernProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Categories Section
const CategoriesSection = ({ categories = [] }) => {
    return (
        <section className="py-20 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        SHOP BY
                        <span className="block text-orange-400">CATEGORY</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Explorez nos collections exclusives
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.slice(0, 4).map((category, index) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.slug || category.id}`}
                            className="group relative aspect-square bg-gray-900 rounded-2xl overflow-hidden"
                        >
                            <img
                                src={category.image || '/images/category-placeholder.jpg'}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute inset-0 flex items-end p-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {category.name}
                                    </h3>
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                        Découvrir →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Newsletter Section
const NewsletterSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                    STAY IN
                    <span className="block text-orange-400">THE LOOP</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Soyez les premiers informés des nouveautés, des drops exclusifs et des offres spéciales
                </p>

                {/* Newsletter Form */}
                <div className="max-w-md mx-auto">
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Votre email"
                            className="flex-1 px-6 py-4 border-2 border-black rounded-l-full focus:outline-none focus:border-orange-400"
                        />
                        <button className="px-8 py-4 bg-black text-white font-bold rounded-r-full hover:bg-gray-800 transition-colors">
                            JOIN
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        En vous inscrivant, vous acceptez nos conditions d'utilisation
                    </p>
                </div>
            </div>
        </section>
    );
};

// Main Home Content Component
function HomeContent({
    featuredProducts = [],
    newProducts = [],
    categories = [],
    brands = [],
    stats = {},
    appSettings = {},
    featuredCategory = null,
    featuredCategoryProducts = [],
    galleryItems = [],
}) {
    return (
        <>
            {/* Hero Slider */}
            <HeroSlider />

            {/* Features Section */}
            <FeaturesSection />

            {/* Product Slider */}
            <ProductSlider products={featuredProducts} />

            {/* Product Grid */}
            <ProductGrid products={newProducts} />

            {/* Featured Products */}
            <FeaturedProductsSection products={featuredProducts} />

            {/* Categories */}
            <CategoriesSection categories={categories} />

            {/* Newsletter */}
            <NewsletterSection />
        </>
    );
}

export default function Home({ wishlistItems, ...props }) {
    const { appSettings } = usePage().props;

    return (
        <FrontendLayout
            title="Accueil"
            wishlistItems={wishlistItems}
        >
            <HomeContent {...props} appSettings={appSettings} />
        </FrontendLayout>
    );
}







