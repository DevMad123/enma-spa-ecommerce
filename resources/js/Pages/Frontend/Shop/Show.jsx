import React, { useState, useEffect } from 'react';
import FrontendLayout, { CartProvider, useCart } from '@/Layouts/FrontendLayout';
import { Link } from '@inertiajs/react';
import { 
    StarIcon,
    HeartIcon,
    ShoppingCartIcon,
    MinusIcon,
    PlusIcon,
    ShareIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckIcon,
    TruckIcon,
    ShieldCheckIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ImageGallery = ({ images, productName }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const allImages = images && images.length > 0 ? images : ['/images/placeholder.jpg'];

    return (
        <div className="space-y-4">
            {/* Image principale */}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-gray-100">
                <img
                    src={allImages[selectedImage]}
                    alt={`${productName} - Image ${selectedImage + 1}`}
                    className="h-96 w-full object-cover object-center"
                />
            </div>

            {/* Miniatures */}
            {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {allImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`
                                aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border-2 transition-all duration-200
                                ${selectedImage === index ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'}
                            `}
                        >
                            <img
                                src={image}
                                alt={`${productName} - Miniature ${index + 1}`}
                                className="h-20 w-full object-cover object-center"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductVariants = ({ colors, sizes, selectedColor, selectedSize, onColorChange, onSizeChange }) => {
    return (
        <div className="space-y-6">
            {/* Couleurs */}
            {colors && colors.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Couleur: {selectedColor ? selectedColor.name : 'Sélectionner une couleur'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => onColorChange(color)}
                                className={`
                                    relative w-12 h-12 rounded-full border-2 transition-all duration-200
                                    ${selectedColor?.id === color.id 
                                        ? 'border-amber-500 ring-2 ring-amber-200 scale-110' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    }
                                `}
                                style={{ backgroundColor: color.hex_code || color.name.toLowerCase() }}
                                title={color.name}
                            >
                                {selectedColor?.id === color.id && (
                                    <CheckIcon className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-sm" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tailles */}
            {sizes && sizes.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Taille: {selectedSize ? selectedSize.name : 'Sélectionner une taille'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {sizes.map((size) => (
                            <button
                                key={size.id}
                                onClick={() => onSizeChange(size)}
                                className={`
                                    px-4 py-3 border rounded-lg font-medium transition-all duration-200
                                    ${selectedSize?.id === size.id
                                        ? 'border-amber-500 bg-amber-500 text-white'
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {size.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReviewSection = ({ reviews, averageRating }) => {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Avis clients</h3>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                                key={i}
                                className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                        {averageRating.toFixed(1)}/5
                    </span>
                    <span className="text-gray-500">({reviews.length} avis)</span>
                </div>
            </div>

            {reviews.length > 0 ? (
                <>
                    <div className="space-y-6">
                        {displayedReviews.map((review) => (
                            <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.customer_name}</h4>
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIconSolid
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">{review.created_at}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>

                    {reviews.length > 3 && (
                        <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            {showAllReviews ? 'Voir moins d\'avis' : `Voir les ${reviews.length - 3} autres avis`}
                        </button>
                    )}
                </>
            ) : (
                <p className="text-gray-500 text-center py-8">
                    Aucun avis pour ce produit. Soyez le premier à laisser un commentaire !
                </p>
            )}
        </div>
    );
};

const RelatedProducts = ({ products }) => {
    const { addToCart } = useCart();

    if (!products || products.length === 0) return null;

    return (
        <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                            <img
                                src={product.image || '/images/placeholder.jpg'}
                                alt={product.name}
                                className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                <Link href={route('frontend.shop.show', product.id)} className="hover:text-amber-600">
                                    {product.name}
                                </Link>
                            </h4>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">
                                    {product.current_sale_price}€
                                </span>
                                <button
                                    onClick={() => addToCart(product, 1)}
                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    <ShoppingCartIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function ProductShow({ product, relatedProducts = [], reviews = [] }) {
    const { addToCart } = useCart();
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);

    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

    useEffect(() => {
        // Auto-sélectionner la première couleur/taille disponible
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            setSelectedColor(product.colors[0]);
        }
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            setSelectedSize(product.sizes[0]);
        }
    }, [product]);

    const handleAddToCart = () => {
        const requiredColor = product.colors && product.colors.length > 0;
        const requiredSize = product.sizes && product.sizes.length > 0;

        if (requiredColor && !selectedColor) {
            alert('Veuillez sélectionner une couleur');
            return;
        }
        if (requiredSize && !selectedSize) {
            alert('Veuillez sélectionner une taille');
            return;
        }

        addToCart(product, quantity, selectedColor?.id, selectedSize?.id);
        
        // Notification de succès
        // Vous pouvez ajouter ici une notification toast
        alert('Produit ajouté au panier !');
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
            setQuantity(newQuantity);
        }
    };

    return (
        <FrontendLayout title={`${product.name} - ENMA SPA`}>
            {/* Breadcrumb */}
            <div className="bg-gray-50 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link href={route('home')} className="text-gray-500 hover:text-gray-700">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                    <Link href={route('frontend.shop.index')} className="ml-4 text-gray-500 hover:text-gray-700">
                                        Boutique
                                    </Link>
                                </div>
                            </li>
                            {product.category && product.category.slug && (
                                <li>
                                    <div className="flex items-center">
                                        <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                        <Link 
                                            href={route('frontend.shop.category', product.category.slug)} 
                                            className="ml-4 text-gray-500 hover:text-gray-700"
                                        >
                                            {product.category.name}
                                        </Link>
                                    </div>
                                </li>
                            )}
                            <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                    <span className="ml-4 text-gray-700 font-medium">{product.name}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                    {/* Galerie d'images */}
                    <div className="lg:col-span-1">
                        <ImageGallery 
                            images={product.images} 
                            productName={product.name} 
                        />
                    </div>

                    {/* Informations du produit */}
                    <div className="mt-8 lg:mt-0 lg:col-span-1">
                        <div className="space-y-6">
                            {/* Catégorie */}
                            {product.category && product.category.slug && (
                                <Link 
                                    href={route('frontend.shop.category', product.category.slug)}
                                    className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    {product.category.name}
                                </Link>
                            )}

                            {/* Titre */}
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                            {/* Évaluations */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIconSolid
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    {averageRating.toFixed(1)}/5 ({reviews.length} avis)
                                </span>
                            </div>

                            {/* Prix */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {product.current_sale_price}€
                                    </span>
                                    {product.price > product.current_sale_price && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">
                                                {product.price}€
                                            </span>
                                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                -{product.discount_percentage}%
                                            </span>
                                        </>
                                    )}
                                </div>
                                {product.price > product.current_sale_price && (
                                    <p className="text-green-600 font-medium">
                                        Vous économisez {(product.price - product.current_sale_price).toFixed(2)}€
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Variantes */}
                            <ProductVariants
                                colors={product.colors}
                                sizes={product.sizes}
                                selectedColor={selectedColor}
                                selectedSize={selectedSize}
                                onColorChange={setSelectedColor}
                                onSizeChange={setSelectedSize}
                            />

                            {/* Quantité et ajout au panier */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-gray-900 mb-3">
                                        Quantité
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                className="p-3 hover:bg-gray-50 transition-colors"
                                                disabled={quantity <= 1}
                                            >
                                                <MinusIcon className="h-5 w-5" />
                                            </button>
                                            <span className="px-4 py-3 font-medium">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                className="p-3 hover:bg-gray-50 transition-colors"
                                                disabled={quantity >= (product.stock || 99)}
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        
                                        {product.stock && (
                                            <span className="text-gray-600">
                                                {product.stock} en stock
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <ShoppingCartIcon className="h-6 w-6" />
                                        <span>Ajouter au panier</span>
                                    </button>

                                    <button
                                        onClick={() => setIsInWishlist(!isInWishlist)}
                                        className={`
                                            p-4 border-2 rounded-xl font-medium transition-all duration-200
                                            ${isInWishlist 
                                                ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100' 
                                                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <HeartIcon className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                                    </button>

                                    <button className="p-4 border-2 border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                                        <ShareIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Informations de livraison */}
                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <TruckIcon className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Livraison gratuite</p>
                                        <p className="text-sm text-gray-600">Dès 50€ d'achat</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <ArrowPathIcon className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Retours gratuits</p>
                                        <p className="text-sm text-gray-600">30 jours pour changer d'avis</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Paiement sécurisé</p>
                                        <p className="text-sm text-gray-600">Vos données sont protégées</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onglets de contenu détaillé */}
                <div className="mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button className="border-b-2 border-amber-500 py-4 px-1 text-sm font-medium text-amber-600">
                                Description détaillée
                            </button>
                            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                                Caractéristiques
                            </button>
                            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                                Livraison & retours
                            </button>
                        </nav>
                    </div>

                    <div className="py-8">
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                                {product.long_description || product.description}
                            </p>
                            {product.features && (
                                <ul className="mt-4">
                                    {product.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section des avis */}
                <div className="mt-16 border-t border-gray-200 pt-16">
                    <ReviewSection reviews={reviews} averageRating={averageRating} />
                </div>

                {/* Produits similaires */}
                <div className="mt-16 border-t border-gray-200 pt-16">
                    <RelatedProducts products={relatedProducts} />
                </div>
            </div>
        </FrontendLayout>
    );
}

// Wrapper avec CartProvider
export default function ProductShowWithCart(props) {
    return (
        <CartProvider>
            <ProductShow {...props} />
        </CartProvider>
    );
}