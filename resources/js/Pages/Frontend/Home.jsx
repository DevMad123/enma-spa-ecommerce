import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    StarIcon,
    HeartIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/Layouts/FrontendLayout';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import { NotificationProvider } from '@/Components/Notifications/NotificationProvider';
import NewsletterSection from '@/Components/Newsletter/NewsletterSection';

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

const CategoryCard = ({ category }) => {
    return (
        <Link
            href={category?.slug ? route('frontend.shop.category', category.slug) : '#'}
            className="group relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
            <div className="aspect-w-16 aspect-h-9 sm:aspect-w-2 sm:aspect-h-3">
                <img
                    src={category.image || '/images/category-placeholder.jpg'}
                    alt={category.name}
                    className="h-48 w-full object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{category.description}</p>
                    <div className="flex items-center text-white">
                        <span className="text-sm font-medium">Découvrir</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
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
    const appName = appSettings?.app_name || 'ENMA SPA';
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-[calc(100vh_-_100px)] flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Bienvenue chez
                            <span className="block bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                                {appName}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                            Découvrez notre collection unique de produits de qualité supérieure.
                            Une expérience shopping exceptionnelle vous attend.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={route('frontend.shop.index')}
                                className="bg-white text-amber-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span>Découvrir la boutique</span>
                                <ArrowRightIcon className="h-5 w-5" />
                            </Link>

                            <Link
                                href={route('a-propos-de-nous')}
                                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-amber-600 transition-all duration-200"
                            >
                                En savoir plus
                            </Link>
                        </div>

                        {/* Stats */}
                        {Object.keys(stats).length > 0 && (
                            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{stats.products || '500+'}+</div>
                                    <div className="text-gray-200">Produits</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{stats.customers || '1000+'}+</div>
                                    <div className="text-gray-200">Clients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{stats.orders || '5000+'}+</div>
                                    <div className="text-gray-200">Commandes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">4.9</div>
                                    <div className="text-gray-200">Note client</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            {console.log('categories:', categories)}
            {categories.length > 0 && (
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

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
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

            {/* New Products Section */}
            {newProducts.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Nouveautés
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Les derniers arrivages de notre collection
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {newProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} appSettings={appSettings} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Newsletter Section */}
            <NewsletterSection
                title="Restez informé de nos nouveautés"
                subtitle="Inscrivez-vous à notre newsletter et recevez 10% de réduction sur votre première commande"
                variant="colored"
                showFeatures={true}
            />
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
