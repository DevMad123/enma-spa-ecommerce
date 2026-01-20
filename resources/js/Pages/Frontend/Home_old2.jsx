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
    BoltIcon,
    StarIcon,
    EyeIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { 
    HeartIcon as HeartSolid,
    StarIcon as StarSolid 
} from '@heroicons/react/24/solid';
import { formatCurrency } from '@/Utils/LocaleUtils';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';

// Modern Hero Section
const ModernHeroSection = () => {
    return (
        <section className="relative w-full min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'Barlow' }}>
            {/* Background Video or Image */}
            <div className="absolute inset-0">
                <img
                    src="/images/hero-bg-sneakers.jpg"
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium tracking-wide">NOUVELLE COLLECTION</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
                            <span className="block">ELEVATE</span>
                            <span className="block text-white/60">YOUR STYLE</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Découvrez les sneakers les plus exclusives et authentiques du moment. Design premium, qualité garantie.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/shop"
                                className="group relative bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 min-w-[200px]"
                            >
                                SHOP NOW
                                <ArrowRightIcon className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/collections"
                                className="group relative border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300 min-w-[200px]"
                            >
                                COLLECTIONS
                                <EyeIcon className="w-5 h-5 ml-2 inline-block" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
                    <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
                </div>
            </div>
        </section>
    );
};

// Stats Section - Premium Numbers
const StatsSection = () => {
    const stats = [
        { value: "50K+", label: "SNEAKERS VENDUES" },
        { value: "100%", label: "AUTHENTICITÉ GARANTIE" },
        { value: "24H", label: "LIVRAISON EXPRESS" },
        { value: "500+", label: "MARQUES PARTENAIRES" }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-black mb-2" style={{ fontFamily: 'Barlow' }}>
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600 font-medium tracking-wide">
                                {stat.label}
                            </div>
                        </div>
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

// Modern Premium Product Card
const PremiumProductCard = ({ product }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const productUrl = product?.slug ? `/products/${product.slug}` : `/products/${product?.id || '#'}`;

    return (
        <div 
            className="group relative bg-white rounded-lg overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{ fontFamily: 'Barlow' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                    {product?.is_new && (
                        <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-medium">
                            NEW
                        </span>
                    )}
                    {product?.current_sale_price && product?.price && product.price > product.current_sale_price && (
                        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                            SALE
                        </span>
                    )}
                    {product?.is_limited && (
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                            LIMITED
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-20">
                    <WishlistButton 
                        product={product}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white p-2.5 rounded-full shadow-md transition-all"
                    />
                </div>

                {/* Product Image */}
                <Link href={productUrl}>
                    <img
                        src={product?.image || '/images/placeholder.jpg'}
                        alt={product?.name || 'Produit'}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                            isHovered ? 'scale-110' : 'scale-100'
                        } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsLoaded(true)}
                    />
                </Link>

                {/* Quick View Overlay */}
                <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-4 left-4 right-4">
                        <Link
                            href={productUrl}
                            className="w-full bg-white text-black py-3 px-6 rounded-full text-center font-semibold transition-all duration-300 hover:bg-gray-100 block"
                        >
                            VOIR LE PRODUIT
                        </Link>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
                {/* Brand */}
                {product?.brand && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
                        {typeof product.brand === 'string' ? product.brand : product.brand?.name || ''}
                    </p>
                )}

                {/* Product Name */}
                <Link href={productUrl}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight hover:text-gray-700 transition-colors">
                        {product?.name || 'Nom du produit'}
                    </h3>
                </Link>

                {/* Ratings */}
                {product?.rating && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${
                                        i < Math.floor(typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">
                            ({product.reviews_count || 0})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {product?.current_sale_price && product?.price && product.price > product.current_sale_price ? (
                            <>
                                <span className="text-xl font-bold text-black">
                                    {formatCurrency(product.current_sale_price)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-black">
                                {formatCurrency(product?.price || 0)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hero Product Showcase - Featured Drop
const HeroProductShowcase = ({ product }) => {
    if (!product) return null;

    return (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Product Image */}
                    <div className="relative">
                        <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                            <img
                                src={product.image || '/images/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-15 blur-xl"></div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                            <FireIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm font-semibold">FEATURED DROP</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-4xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: 'Barlow' }}>
                            {product.name}
                        </h2>

                        {/* Description */}
                        <p className="text-xl text-gray-300 leading-relaxed">
                            {product.description || "Découvrez cette pièce exceptionnelle qui allie style, performance et authenticité. Une création unique pour les passionnés."}
                        </p>

                        {/* Price */}
                        <div className="text-3xl font-bold">
                            {product.current_sale_price && product.price > product.current_sale_price ? (
                                <span className="text-yellow-400">{formatCurrency(product.current_sale_price)}</span>
                            ) : (
                                <span>{formatCurrency(product.price)}</span>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="flex gap-4">
                            <Link
                                href={`/products/${product.slug || product.id}`}
                                className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center"
                            >
                                SHOP NOW
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </Link>
                            <button className="border border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300">
                                EN SAVOIR PLUS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Modern Product Slider
const ModernProductSlider = ({ title = "TENDANCES", products = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const itemsPerView = {
        mobile: 1.2,
        tablet: 2.5,
        desktop: 4
    };

    const maxIndex = Math.max(0, products.length - Math.floor(itemsPerView.desktop));

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    if (!products.length) return null;

    return (
        <section className={`py-16 md:py-24 bg-white transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-black font-['Barlow'] mb-2">
                            {title}
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-3">
                        <button
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group"
                        >
                            <ChevronLeftIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={currentIndex >= maxIndex}
                            className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group"
                        >
                            <ChevronRightIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="relative overflow-hidden">
                    <div 
                        className="flex transition-transform duration-500 ease-out gap-6"
                        style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)`
                        }}
                    >
                        {products.map((product, index) => (
                            <div
                                key={product?.id || Math.random()}
                                className="flex-none w-[calc(83.33%-12px)] md:w-[calc(40%-12px)] lg:w-[calc(25%-18px)]"
                            >
                                <PremiumProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center justify-center mt-8 space-x-4">
                    <button
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.ceil(products.length / itemsPerView.mobile) }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === Math.floor(currentIndex / itemsPerView.mobile)
                                        ? 'bg-black w-6'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={nextSlide}
                        disabled={currentIndex >= maxIndex}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

// Product Grid Section
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
                                {typeof product.category.name === 'string' ? product.category.name : String(product.category.name)}
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
                        <CleanProductCard key={product?.id || Math.random()} product={product} />
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
                        <PremiumProductCard key={product?.id || Math.random()} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Categories Grid - Premium Style
const CategoriesGrid = ({ categories = [] }) => {
    return (
        <section className="py-16 md:py-24 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 font-['Barlow']">
                        EXPLORE
                        <span className="block text-gray-400">CATEGORIES</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Découvrez nos collections soigneusement sélectionnées pour chaque style et passion.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.slice(0, 6).map((category, index) => (
                        <Link
                            key={category?.id || index}
                            href={`/category/${category?.slug || category?.id}`}
                            className="group relative aspect-[4/5] bg-gray-900 rounded-3xl overflow-hidden"
                        >
                            {/* Image */}
                            <img
                                src={category.image || '/images/category-placeholder.jpg'}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-colors duration-500" />
                            
                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl font-bold text-white mb-2 font-['Barlow']">
                                        {category?.name || 'Catégorie'}
                                    </h3>
                                    <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        {category?.description || 'Découvrez notre sélection'}
                                    </p>
                                    <div className="flex items-center text-white font-medium">
                                        <span className="mr-2">Explorer</span>
                                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Border */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-3xl transition-colors duration-500"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Newsletter Section - Modern Design
const ModernNewsletterSection = () => {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter subscription
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 3000);
    };

    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="mb-12">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 font-['Barlow']">
                            STAY IN
                            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                THE LOOP
                            </span>
                        </h2>
                        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                            Soyez les premiers informés des drops exclusifs, des offres spéciales et des dernières tendances sneakers.
                        </p>
                    </div>

                    {/* Newsletter Form */}
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Votre email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-all duration-300"
                                required
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                            >
                                {isSubscribed ? '✓' : 'JOIN'}
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                            En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                        </p>
                    </form>

                    {/* Success Message */}
                    {isSubscribed && (
                        <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-300">Merci ! Vous êtes maintenant abonné à notre newsletter.</p>
                        </div>
                    )}
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
    // Featured product for hero showcase
    const heroProduct = featuredProducts?.[0] || null;

    return (
        <>
            {/* Modern Hero Section */}
            <ModernHeroSection />

            {/* Stats Section */}
            <StatsSection />

            {/* Hero Product Showcase */}
            {heroProduct && <HeroProductShowcase product={heroProduct} />}

            {/* Features Section */}
            <FeaturesSection />

            {/* Trending Products Slider */}
            <ModernProductSlider 
                title="TRENDING NOW" 
                products={featuredProducts} 
            />

            {/* New Arrivals Grid */}
            <ProductGrid products={newProducts} />

            {/* Categories Grid */}
            <CategoriesGrid categories={categories} />

            {/* Best Sellers Slider */}
            <ModernProductSlider 
                title="BEST SELLERS" 
                products={newProducts.slice(0, 8)} 
            />

            {/* Newsletter */}
            <ModernNewsletterSection />
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







