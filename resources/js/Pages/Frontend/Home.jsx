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
    TagIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/Utils/LocaleUtils';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import ModernProductCard from '@/Components/Frontend/ModernProductCard';
import ProductSlider from '@/Components/Frontend/ProductSlider';
import BlogPreviewSection from '@/Components/Blog/BlogPreviewSection';

// Hero Slider Section
const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progressKey, setProgressKey] = useState(0); // Key pour réinitialiser l'animation CSS

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
            setCurrentSlide((prev) => {
                const nextIndex = (prev + 1) % slides.length;
                setProgressKey(prevKey => prevKey + 1); // Réinitialise l'animation
                return nextIndex;
            });
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setProgressKey(prevKey => prevKey + 1); // Réinitialise l'animation
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setProgressKey(prevKey => prevKey + 1); // Réinitialise l'animation
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setProgressKey(prevKey => prevKey + 1); // Réinitialise l'animation
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
                                <div className="EecDefaultWidth">
                                    {/* Desktop: texte à gauche, Mobile: texte centré */}
                                    <div className="text-center md:text-left max-w-2xl md:max-w-none">
                                        {/* Titre */}
                                        <h2 className="text-white font-bold leading-tight mb-4">
                                            <span className="text-2xl md:text-5xl font-bold">
                                                {slide.title}
                                            </span>
                                        </h2>

                                        {/* Sous-texte */}
                                        <p className="text-white/90 text-base md:text-lg mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                                            {slide.subtitle}
                                        </p>

                                        {/* Bouton CTA */}
                                        <Link
                                            href={slide.ctaLink}
                                            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-bold rounded-none hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
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

                {/* Barres de progression */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="group relative h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/40"
                            style={{ width: '60px' }}
                            aria-label={`Aller au slide ${index + 1}`}
                        >
                            {/* Barre de fond */}
                            <div className="absolute inset-0 bg-gray-600 rounded-full" />
                            
                            {/* Barre de progression */}
                            <div 
                                key={`progress-${index}-${progressKey}`}
                                className={`absolute inset-0 bg-black rounded-full transform-gpu ${
                                    currentSlide === index 
                                        ? 'animate-progress-bar origin-left' 
                                        : currentSlide > index || (currentSlide === 0 && index === slides.length - 1) 
                                            ? 'w-full' 
                                            : 'w-0'
                                }`}
                                style={{
                                    animationDuration: currentSlide === index ? '5000ms' : '0ms',
                                    animationFillMode: 'forwards',
                                    animationTimingFunction: 'linear'
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Scrolling Text Section
const ScrollingTextSection = () => {
    const scrollingTexts = [
        { icon: <ShieldCheckIcon className="w-4 h-4" />, text: "SNEAKERS AUTHENTIQUES" },
        { icon: <TruckIcon className="w-4 h-4" />, text: "LIVRAISON RAPIDE" },
        { icon: <CreditCardIcon className="w-4 h-4" />, text: "PAIEMENT SÉCURISÉ" },
        { icon: <StarIcon className="w-4 h-4" />, text: "QUALITÉ PREMIUM" }
    ];

    return (
        <section className="w-full h-[60px] bg-white border-y border-gray-100 overflow-hidden">
            <div className="flex items-center h-full animate-scroll">
                {/* Dupliquer le contenu pour un défilement infini */}
                {[...Array(3)].map((_, groupIndex) => (
                    <div key={groupIndex} className="flex items-center whitespace-nowrap">
                        {scrollingTexts.map((item, index) => (
                            <div 
                                key={`${groupIndex}-${index}`} 
                                className="flex items-center mx-8 text-black"
                                style={{ fontFamily: 'Barlow' }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">{item.icon}</span>
                                    <span className="text-[16px] font-medium tracking-wide uppercase">
                                        {item.text}
                                    </span>
                                </div>
                                <span className="mx-4 text-gray-300">–</span>
                            </div>
                        ))}
                    </div>
                ))}
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
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
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

// Sneaker Brands Slider Section
const SneakerBrandsSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const brands = [
        {
            id: 1,
            name: "AIR JORDAN",
            slug: "air-jordan",
            image: "/images/brands/air-jordan.jpg"
        },
        {
            id: 2,
            name: "NIKE",
            slug: "nike", 
            image: "/images/brands/nike.jpg"
        },
        {
            id: 3,
            name: "ADIDAS",
            slug: "adidas",
            image: "/images/brands/adidas.webp"
        },
        {
            id: 4,
            name: "NEW BALANCE",
            slug: "new-balance",
            image: "/images/brands/new-balance.jpg"
        },
        {
            id: 5,
            name: "PUMA",
            slug: "puma",
            image: "/images/brands/puma.webp"
        },
        {
            id: 6,
            name: "ASICS",
            slug: "asics",
            image: "/images/brands/asics.webp"
        },
        {
            id: 7,
            name: "REEBOK",
            slug: "reebok",
            image: "/images/brands/reebok.webp"
        },
        {
            id: 8,
            name: "CONVERSE",
            slug: "converse",
            image: "/images/brands/converse.webp"
        }
    ];

    const itemsPerView = { desktop: 4, tablet: 2, mobile: 1 };
    const maxIndex = Math.max(0, brands.length - itemsPerView.desktop);

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    return (
        <section className="py-[30px] md:py-[60px] bg-white" style={{ fontFamily: 'Barlow' }}>
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                {/* Header avec titre et flèches */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-black">
                            SNEAKERS
                        </h2>
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
                <div className="relative overflow-hidden">
                    <div 
                        className="flex transition-transform duration-300 ease-in-out space-x-6"
                        style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)`
                        }}
                    >
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="flex-none w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                            >
                                <Link
                                    href={`/brand/${brand.slug}`}
                                    className="block relative"
                                >
                                    {/* Brand Image Container - Format rectangulaire */}
                                    <div 
                                        className="relative w-full"
                                        style={{ aspectRatio: '286/400' }}
                                    >
                                        <img
                                            src={brand.image}
                                            alt={brand.name}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Brand Name - Centré en bas */}
                                        <div className="bottom-0 p-4">
                                            <div className="text-center">
                                                <h3 
                                                    className="text-black font-bold tracking-wide"
                                                    style={{ 
                                                        fontSize: '21px'
                                                    }}
                                                >
                                                    {brand.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation Dots */}
                <div className="flex md:hidden items-center justify-center mt-8 space-x-1">
                    {Array.from({ length: Math.ceil(brands.length / itemsPerView.mobile) }).map((_, index) => (
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
            </div>
        </section>
    );
};

// Product Grid Section - Utilise ModernProductCard
const ProductGrid = ({ products = [] }) => {
    if (!products.length) return null;

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
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
                        <ModernProductCard key={product?.id || Math.random()} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Featured Products Section - Utilise ModernProductCard
const FeaturedProductsSection = ({ products = [] }) => {
    return (
        <section className="py-20 bg-white">
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 bg-black text-white text-xs font-bold rounded-full mb-4">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            MUST HAVE
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-black">
                            PRODUITS
                            <span className="block text-gray-400">PHARES</span>
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
                        <ModernProductCard key={product?.id || Math.random()} product={product} />
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
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8">
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
                    RESTEZ
                    <span className="block text-orange-400 uppercase">Informé(e)</span>
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
                            S'INSCRIRE
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
    blogPosts = [],
}) {
    // Fonction pour filtrer les produits en solde (basée sur la structure de la base de données)
    const filterSaleProducts = (products) => 
        products.filter(product => {
            const currentPrice = parseFloat(product?.current_sale_price || 0);
            const previousPrice = parseFloat(product?.previous_sale_price || 0);
            const hasDiscount = product?.discount && parseFloat(product.discount) > 0;
            
            // Produit en solde si :
            // - previous_sale_price existe et est supérieur au current_sale_price
            // - OU il y a une remise appliquée
            return (previousPrice > 0 && currentPrice > 0 && previousPrice > currentPrice) || hasDiscount;
        });

    return (
        <>
            {/* Hero Slider */}
            <HeroSlider />

            {/* Scrolling Text Section */}
            <ScrollingTextSection />

            {/* Nouveautés Slider */}
            <ProductSlider 
                title="NOUVEAUTÉS"
                icon={<SparklesIcon />}
                products={newProducts}
                backgroundColor="bg-white"
                filterType="new"
            />

            {/* En Solde Slider */}
            <ProductSlider 
                title="EN SOLDE"
                icon={<TagIcon className="text-black" />}
                products={featuredProducts}
                backgroundColor="bg-white"
                filterType="sale"
            />

            {/* Featured Products */}
            <FeaturedProductsSection products={featuredProducts} />

            {/* Sneaker Brands Slider */}
            <SneakerBrandsSlider />

            {/* Features Section */}
            <FeaturesSection />

            {/* Tendances Slider */}
            <ProductSlider 
                title="TENDANCES"
                products={featuredProducts}
                backgroundColor="bg-white"
                filterType="trending"
            />

            {/* Product Grid */}
            <ProductGrid products={newProducts} />

            {/* Categories */}
            <CategoriesSection categories={categories} />

            {/* Blog Section */}
            {blogPosts && blogPosts.length > 0 && (
                <BlogPreviewSection posts={blogPosts} />
            )}

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







