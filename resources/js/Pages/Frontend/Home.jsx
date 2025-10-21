import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    StarIcon,
    HeartIcon,
    ShoppingCartIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/Layouts/FrontendLayout';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import { NotificationProvider } from '@/Components/Notifications/NotificationProvider';
import NewsletterSection from '@/Components/Newsletter/NewsletterSection';
import CategoryCarousel from '@/Components/Frontend/CategoryCarousel';
import FeaturesCarousel from '@/Components/Features/FeaturesCarousel';
import ProductCarousel from '@/Components/Frontend/ProductCarousel';
import useCustomizations from '@/Hooks/useCustomizations';

const ProductCard = ({ product, appSettings }) => {
    const { addToCart } = useCart();
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';

    return (
        <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            {/* Badge de promotion */}
            {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount_percentage}%
                    </span>
                </div>
            )}

            {/* Bouton favoris */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <WishlistButton
                    product={product}
                    size="default"
                />
            </div>

            {/* Image du produit */}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="p-6">
                {/* Catégorie */}
                <p className="text-sm text-amber-600 font-medium mb-2">
                    {product.category?.name}
                </p>

                {/* Nom du produit */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link href={route('frontend.shop.show', product.id)} className="hover:text-amber-600 transition-colors">
                        {product.name}
                    </Link>
                </h3>

                {/* Description courte */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                </p>

                {/* Évaluations */}
                <div className="flex items-center mb-4">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(product.average_rating || 4.5)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                        ({product.reviews_count || 0})
                    </span>
                </div>

                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">
                            {product.current_sale_price} {currencySymbol}
                        </span>
                        {product.price > product.current_sale_price && (
                            <span className="ml-2 text-lg text-gray-500 line-through">
                                {product.price} {currencySymbol}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bouton d'ajout au panier */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    <CartButton
                        product={product}
                        className="w-full"
                        variant="gradient"
                    />
                </div>
            </div>
        </div>
    );
};

// Carte Catégorie (fallback si manquante)
const CategoryCard = ({ category }) => {
    const href = category?.slug ? route('frontend.shop.category', category.slug) : route('frontend.shop.index');
    const img = category?.image || '/images/category-placeholder.jpg';
    const name = category?.name || 'Catégorie';

    return (
        <Link
            href={href}
            className="group block rounded-2xl border border-gray-200 hover:border-gray-300 bg-white overflow-hidden"
        >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                    src={img}
                    alt={name}
                    loading="lazy"
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-3 text-center">
                <div className="text-sm font-medium text-gray-900">{name}</div>
            </div>
        </Link>
    );
};

const CustomHero = ({ customizations, appSettings }) => {
    if (!customizations?.hero_enabled) return null;
    const hero = customizations;
    const product = hero?.hero_product;
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    const price = product ? (product.current_sale_price ?? product.price) : null;
    const currency = appSettings?.currency || 'XOF';

    const productSchema = product ? {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        offers: {
            '@type': 'Offer',
            priceCurrency: currency,
            price: String(price ?? ''),
            availability: 'https://schema.org/InStock',
            url: route('frontend.shop.show', product.id),
        },
    } : null;

    return (
        <section
            className="relative min-h-[calc(60vh)] flex items-center overflow-hidden"
            style={{
                backgroundImage: hero?.hero_background_image ? `url(${hero.hero_background_image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {productSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-2xl text-white">
                    {hero?.hero_title && (
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{hero.hero_title}</h1>
                    )}
                    {hero?.hero_subtitle && (
                        <p className="text-lg md:text-xl text-gray-200 mb-8">{hero.hero_subtitle}</p>
                    )}
                    {product && (
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 inline-flex items-center space-x-4">
                            <div>
                                <div className="text-xl font-semibold">{product.name}</div>
                                <div className="text-lg">
                                    <span className="font-bold">{product.current_sale_price ?? product.price} {currencySymbol}</span>
                                    {product.current_sale_price && product.price && product.price > product.current_sale_price && (
                                        <span className="ml-2 line-through opacity-70">{product.price} {currencySymbol}</span>
                                    )}
                                </div>
                            </div>
                            <a href={route('frontend.shop.show', product.id)} className="inline-flex items-center px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition">Acheter</a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const HeroSlider = ({ slides = [], appSettings }) => {
    const [index, setIndex] = React.useState(0);
    const [touchStart, setTouchStart] = React.useState(null);
    const [touchEnd, setTouchEnd] = React.useState(null);

    React.useEffect(() => {
        if (!slides.length) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
        return () => clearInterval(id);
    }, [slides.length]);

    const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIndex((i) => (i + 1) % slides.length);

    const onTouchStart = (e) => setTouchStart(e.changedTouches[0].clientX);
    const onTouchMove = (e) => setTouchEnd(e.changedTouches[0].clientX);
    const onTouchEnd = () => {
        if (touchStart !== null && touchEnd !== null) {
            const delta = touchEnd - touchStart;
            if (Math.abs(delta) > 40) {
                delta > 0 ? prev() : next();
            }
        }
        setTouchStart(null); setTouchEnd(null);
    };

    if (!slides.length) return null;
    const product = slides[index]?.product;
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';

    return (
        <section className="relative overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="relative h-[60vh]">
                <div className="absolute inset-0">
                    <div className="h-full w-full flex transition-transform duration-700" style={{ transform: `translateX(-${index * 100}%)` }}>
                        {slides.map((s, i) => (
                            <div key={i} className="min-w-full h-full" style={{
                                backgroundImage: s.background_image ? `url(${s.background_image})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }} />
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex justify-end h-full items-center">
                    <div className="bg-white/80 backdrop-blur rounded-xl p-6 md:p-8 max-w-md">
                        {product?.name && (<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>)}
                        {slides[index]?.tagline && (<p className="text-gray-700 mb-4">{slides[index].tagline}</p>)}
                        {product && (
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xl font-semibold text-gray-900">{product.current_sale_price ?? product.price} {currencySymbol}</span>
                                {(product.price && product.current_sale_price && product.price > product.current_sale_price) && (
                                    <span className="text-gray-500 line-through">{product.price} {currencySymbol}</span>
                                )}
                            </div>
                        )}
                        {product?.id && (
                            <a href={route('frontend.shop.show', product.id)} className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition">Découvrir</a>
                        )}
                    </div>
                </div>
                {/* Arrows */}
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow" aria-label="Précédent">
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow" aria-label="Suivant">
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {slides.map((_, i) => (
                        <button key={i} onClick={() => setIndex(i)} className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`} aria-label={`Aller au slide ${i+1}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};

function HomeContent({
    featuredProducts = [],
    newProducts = [],
    categories = [],
    brands = [],
    stats = {},
    appSettings = {}
}) {
    const { customizations } = useCustomizations();
    const appName = appSettings?.app_name || 'ENMA SPA';
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    return (
        <>
            {/* Hero Section (slider if available else custom/default) */}
            {Array.isArray(customizations?.hero_slides) && customizations.hero_slides.length > 0 ? (
                <HeroSlider slides={customizations.hero_slides} appSettings={appSettings} />
            ) : customizations?.hero_enabled ? (
                <CustomHero customizations={customizations} appSettings={appSettings} />
            ) : (
                <section className="relative min-h-[calc(100vh_-_100px)] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                Bienvenue chez
                                <span className="block bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">{appName}</span>
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">Découvrez notre collection unique de produits de qualité supérieure. Une expérience shopping exceptionnelle vous attend.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link href={route('frontend.shop.index')} className="bg-white text-amber-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                                    <span>Découvrir la boutique</span>
                                    <ArrowRightIcon className="h-5 w-5" />
                                </Link>
                                <Link href={route('a-propos-de-nous')} className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-amber-600 transition-all duration-200">En savoir plus</Link>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                        </div>
                    </div>
                </section>
            )}

            {/* Slide 1: Features Carousel */}
            <FeaturesCarousel />

            {/* Categories Carousel */}
            <CategoryCarousel categories={categories || []} title="Catégories" />
            {false && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Explorez nos catégories
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Découvrez notre large gamme de produits soigneusement sélectionnés pour vous
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.slice(0, 6).map((category) => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link
                                href={route('frontend.shop.index')}
                                className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Voir toutes les catégories
                                <ArrowRightIcon className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
            {/* New In Carousel */}
            {console.log(newProducts)}
            {newProducts.length > 0 && (
                <ProductCarousel
                    products={newProducts}
                    title="Nouveautés"
                    viewMoreHref={route('nouveautes')}
                    currencySymbol={currencySymbol}
                />
            )}

{/* Featured Products Section */}
            {featuredProducts.length > 0 && (customizations?.featured_section_enabled !== false) && (
                <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Produits vedettes
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Nos coups de cœur sélectionnés spécialement pour vous
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.slice(0, 8).map((product) => (
                                <ProductCard key={product.id} product={product} appSettings={appSettings} />
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link
                                href={route('frontend.shop.index')}
                                className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Voir tous les produits
                                <ArrowRightIcon className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
            {/* Newsletter Section (toggle) */}
            {customizations?.newsletter_enabled !== false && (
                <NewsletterSection
                    title="Restez informé de nos nouveautés"
                    subtitle="Inscrivez-vous à notre newsletter et recevez 10% de réduction sur votre première commande"
                    variant="colored"
                    showFeatures={true}
                />
            )}
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







