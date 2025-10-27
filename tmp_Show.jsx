import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FrontendLayout, { useCart } from '@/Layouts/FrontendLayout';
import { Link, usePage, router } from '@inertiajs/react';
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
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import ReviewCard from '@/Components/Frontend/ReviewCard';
import ReviewForm from '@/Components/Frontend/ReviewForm';
import { useNotification, NotificationProvider } from '@/Components/Notifications/NotificationProvider';
import { PulseButton } from '@/Components/Animations/AnimationComponents';
import { formatVariablePrice } from '@/Utils/productPrice';
import { formatCurrency } from '@/Utils/LocaleUtils';

const ImageGallery = ({ images, productName, productImage }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    
    // Construire le tableau d'images
    let allImages = [];
    
    // Ajouter l'image principale du produit en premier
    if (productImage) {
        allImages.push(productImage);
    }
    
    // Ajouter les images additionnelles
    if (images && images.length > 0) {
        const additionalImages = images.map(img => {
            if (typeof img === 'object' && img.image) {
                // Si l'image commence par 'http', c'est une URL complète
                if (img.image.startsWith('http')) {
                    return img.image;
                }
                // Sinon, construire l'URL complète
                return `${window.location.origin}/${img.image}`;
            }
            return img;
        }).filter(img => img !== productImage); // Ã‰viter les doublons avec l'image principale
        
        allImages = [...allImages, ...additionalImages];
    }
    
    // Si aucune image, utiliser le placeholder
    if (allImages.length === 0) {
        allImages = ['/images/placeholder.jpg'];
    }

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
                        Couleur: {selectedColor ? selectedColor.name : 'Selectionner une couleur'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => onColorChange(color)}
                                className={`
                                    relative w-12 h-12 rounded-full border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${selectedColor?.id === color.id 
                                        ? 'border-amber-500 ring-2 ring-amber-200 scale-110' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    }
                                `}
                                style={{ backgroundColor: color.color_code || color.name.toLowerCase() }}
                                title={color.name} disabled={selectedSize ? !(isColorEnabled && isColorEnabled(color.id)) : false}>
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
                        Taille: {selectedSize ? selectedSize.name : 'Selectionner une taille'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {sizes.map((size) => (
                            <button
                                key={size.id}
                                onClick={() => onSizeChange(size)}
                                className={` px-4 py-3 border rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${selectedSize?.id === size.id
                                        ? 'border-amber-500 bg-amber-500 text-white'
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                    }
                                `}
                             disabled={selectedColor ? !(isSizeEnabled && isSizeEnabled(size.id)) : false}>`n                                {size.size}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReviewSection = ({ reviews, averageRating, product }) => {
    const { auth } = usePage().props;
    const { showSuccess, showError, showInfo } = useNotification();
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    // Ã‰tat local pour gérer les avis supprimés visuellement
    const [deletedReviewIds, setDeletedReviewIds] = useState(new Set());

    // Filtrer les avis supprimés localement
    const filteredReviews = reviews.filter(review => !deletedReviewIds.has(review.id));
    const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

    // Trouver l'avis de l'utilisateur connecté
    useEffect(() => {
        if (auth.user && reviews.length > 0) {
            const existingReview = reviews.find(review => review.user_id === auth.user.id);
            setUserReview(existingReview);
        }
    }, [auth.user, reviews]);

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setShowReviewForm(false);
    };

    const handleReviewSuccess = (action = 'created', reviewId = null) => {
        setEditingReview(null);
        setShowReviewForm(false);
        
        // Afficher la notification appropriée
        if (action === 'created') {
            showSuccess(
                'Votre avis a été publié avec succès ! Les données vont Ãªtre mises Ã  jour automatiquement.', 
                'â­ Avis publié'
            );
        } else if (action === 'updated') {
            showSuccess(
                'Votre avis a été modifié avec succès ! Les modifications sont visibles.', 
                'âœï¸ Avis modifié'
            );
        } else if (action === 'deleted') {
            // Retirer visuellement l'avis immédiatement
            if (reviewId) {
                setDeletedReviewIds(prev => new Set([...prev, reviewId]));
                // Vérifier si c'était l'avis de l'utilisateur
                if (userReview && userReview.id === reviewId) {
                    setUserReview(null);
                }
            }
            
            showSuccess(
                'Votre avis a été supprimé avec succès !', 
                'ðŸ—‘ï¸ Avis supprimé'
            );
            
            // Recharger les données en arrière-plan après un délai
            setTimeout(() => {
                router.reload({
                    preserveState: true,  // Garder l'état React
                    preserveScroll: true, // Garder la position de scroll
                    only: ['reviews'], // Recharger seulement les reviews
                });
            }, 2000);
        }
    };

    return (
        <div className="space-y-8">
            {/* En-tÃªte des avis */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-900">Avis clients</h3>
                <div className="flex items-center space-x-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIconSolid
                                        key={i}
                                        className={`h-6 w-6 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                {averageRating.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                            {filteredReviews.length} avis client{filteredReviews.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    {/* Bouton pour ajouter un avis */}
                    {auth.user && !userReview && (
                        <PulseButton
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
                        >
                            {showReviewForm ? 'Annuler' : 'Laisser un avis'}
                        </PulseButton>
                    )}
                    
                    {!auth.user && (
                        <PulseButton
                            onClick={() => showInfo('Connectez-vous pour laisser un avis', 'Connexion requise')}
                            className="bg-gray-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                        >
                            Laisser un avis
                        </PulseButton>
                    )}
                </div>
            </div>

            {/* Formulaire d'ajout/modification d'avis */}
            {showReviewForm && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-gray-900">
                            {editingReview ? 'Modifier votre avis' : 'Laisser un avis'}
                        </h4>
                        <PulseButton
                            onClick={editingReview ? handleCancelEdit : () => setShowReviewForm(false)}
                            className="text-gray-500 hover:text-gray-700 p-2"
                        >
                            <span className="sr-only">Fermer</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </PulseButton>
                    </div>
                    <ReviewForm 
                        product={product}
                        existingReview={editingReview}
                        onCancel={editingReview ? handleCancelEdit : () => setShowReviewForm(false)}
                        onSuccess={handleReviewSuccess}
                    />
                </div>
            )}

            {/* Avis de l'utilisateur connecté */}
            {userReview && !editingReview && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-1">
                    <div className="bg-blue-100 px-4 py-2 rounded-t-xl">
                        <h4 className="font-semibold text-blue-900">Votre avis</h4>
                    </div>
                    <div className="p-4">
                        <ReviewCard
                            review={userReview}
                            canEdit={true}
                            onEdit={handleEditReview}
                            onSuccess={(action) => handleReviewSuccess(action, userReview.id)}
                            product={product}
                        />
                    </div>
                </div>
            )}

            {/* Liste des avis */}
            {filteredReviews.length > 0 ? (
                <>
                    <div className="space-y-6">
                        {displayedReviews.filter(review => !userReview || review.id !== userReview.id).map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onSuccess={(action) => handleReviewSuccess(action, review.id)}
                                product={product}
                            />
                        ))}
                    </div>

                    {/* Bouton voir plus/moins */}
                    {filteredReviews.length > 3 && (
                        <div className="text-center">
                            <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="text-amber-600 hover:text-amber-700 font-medium text-lg"
                            >
                                {showAllReviews 
                                    ? 'Voir moins d\'avis' 
                                    : `Voir les ${filteredReviews.length - 3} autres avis`
                                }
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <StarIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun avis pour ce produit
                    </h4>
                    <p className="text-gray-600 mb-6">
                        Soyez le premier Ã  partager votre expérience !
                    </p>
                    {auth.user ? (
                        <PulseButton
                            onClick={() => setShowReviewForm(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
                        >
                            Ã‰crire le premier avis
                        </PulseButton>
                    ) : (
                        <PulseButton
                            onClick={() => {
                                showInfo('Connectez-vous pour Ãªtre le premier Ã  laisser un avis', 'Connexion requise');
                            }}
                            className="bg-gray-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                        >
                            Connectez-vous pour laisser un avis
                        </PulseButton>
                    )}
                </div>
            )}
        </div>
    );
};

const RelatedProducts = ({ products }) => {
    const { addToCart } = useCart();
    const { showSuccess } = useNotification();

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
                                    {(() => {
                                        const fp = formatVariablePrice(product);
                                        return (
                                            <>
                                                {fp.hasRange && <span>À partir de </span>}
                                                <span>{formatCurrency(fp.min)}</span>
                                                {fp.compareAt && (
                                                    <span className="ml-2 text-gray-500 line-through text-sm">{formatCurrency(fp.compareAt)}</span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </span>
                                <PulseButton
                                    onClick={() => {
                                        addToCart(product, 1);
                                        showSuccess(`${product.name} ajouté au panier`, 'ðŸ›’ Produit similaire ajouté');
                                    }}
                                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    title={`Ajouter ${product.name} au panier`}
                                >
                                    <ShoppingCartIcon className="h-4 w-4" />
                                </PulseButton>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function ProductShow({ product, relatedProducts = [], reviews = [], userCanReview = false }) {
    const { addToCart } = useCart();
    const { showSuccess, showError, showWarning } = useNotification();
    const { appSettings } = usePage().props;
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [variantLoading, setVariantLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

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

    // Met Ã  jour la variante selon la sélection couleur/taille
    useEffect(() => {
        const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
        const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
        if (!hasColors && !hasSizes) {
            setSelectedVariant(null);
            return;
        }

        let cancelled = false;
        async function loadVariant() {
            const params = new URLSearchParams();
            if (selectedColor?.id) params.append('color_id', selectedColor.id);
            if (selectedSize?.id) params.append('size_id', selectedSize.id);
            setVariantLoading(true);
            try {
                const resp = await fetch(`/api/products/${product.id}/variant?${params.toString()}`, { headers: { 'Accept': 'application/json' } });
                if (cancelled) return;
                if (resp.ok) {
                    const data = await resp.json();
                    setSelectedVariant(data || null);
                } else {
                    setSelectedVariant(null);
                }
            } catch (e) {
                if (!cancelled) setSelectedVariant(null);
            } finally {
                if (!cancelled) setVariantLoading(false);
            }
        }
        loadVariant();
        return () => { cancelled = true; };
    }, [product.id, selectedColor?.id, selectedSize?.id]);

    const handleAddToCart = () => {
        const requiredColor = product.colors && product.colors.length > 0;
        const requiredSize = product.sizes && product.sizes.length > 0;

        if (requiredColor && !selectedColor) {
            showError('Veuillez sélectionner une couleur', 'Couleur requise');
            return;
        }
        if (requiredSize && !selectedSize) {
            showError('Selectionner une taille', 'Taille requise');
            return;
        }

        const effectiveStock = selectedVariant?.stock ?? product.stock_quantity ?? product.available_quantity ?? 0;
        if (effectiveStock <= 0) {
            showError('Ce produit n\'est plus en stock', 'Stock épuisé');
                return;
            }
        try {
            const enriched = { ...product, current_sale_price: selectedVariant?.sale_price ?? product.current_sale_price, stock_quantity: effectiveStock, sku: selectedVariant?.sku ?? product.sku, selected_variant_id: selectedVariant?.id ?? null };
            addToCart(enriched, quantity, selectedColor?.id, selectedSize?.id);
            
            const variantText = [
                selectedColor ? `couleur: ${selectedColor.name}` : null,
                selectedSize ? `taille: ${selectedSize.name}` : null
            ].filter(Boolean).join(', ');
            
            const message = quantity > 1 
                ? `${quantity} x ${product.name} ajoutés au panier`
                : `${product.name} ajouté au panier`;
                
            showSuccess(
                variantText ? `${message} (${variantText})` : message, 
                '🛒 Produit ajouté'
            );
        } catch (error) {
            showError('Impossible d\'ajouter le produit au panier', 'Erreur');
        }
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        const maxStock = selectedVariant?.stock ?? product.stock ?? product.stock_quantity ?? 99;
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            setQuantity(newQuantity);
        }
    };

    return (
        <>
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
                            productImage={product.image}
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

                            {/* Ã‰valuations */}
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
                                        {formatCurrency(selectedVariant?.sale_price ?? product.current_sale_price ?? 0)}
                                    </span>
                                    {(product.price && (product.price > (selectedVariant?.sale_price ?? product.current_sale_price ?? 0))) && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">
                                                {formatCurrency(product.price)}
                                            </span>
                                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                -{product.discount_percentage}%
                                            </span>
                                        </>
                                    )}
                                </div>
                                {(product.price && (product.price > (selectedVariant?.sale_price ?? product.current_sale_price ?? 0))) && (
                                    <p className="text-green-600 font-medium">
                                        Vous économisez {formatCurrency(product.price - (selectedVariant?.sale_price ?? product.current_sale_price ?? 0))}
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

                            {/* Alerte si la combinaison sélectionnée n'existe pas */}
                            {(() => {
                                const requiresVariants = (Array.isArray(product.colors) && product.colors.length > 0) || (Array.isArray(product.sizes) && product.sizes.length > 0);
                                const hasSelection = (!!selectedColor || !!selectedSize);
                                if (requiresVariants && hasSelection && !variantLoading && !selectedVariant) {
                                    return (
                                        <div className="text-sm text-red-600">Cette combinaison n'existe pas pour ce produit.</div>
                                    );
                                }
                                return null;
                            })()}

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
                                                disabled={quantity >= ((selectedVariant?.stock ?? product.stock ?? product.stock_quantity ?? 99))}
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        
                                        {(selectedVariant?.stock ?? product.stock ?? product.stock_quantity) && (
                                            <span className="text-gray-600">
                                                {(selectedVariant?.stock ?? product.stock ?? product.stock_quantity)} en stock
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <CartButton
                                        product={{
                                            ...product,
                                            current_sale_price: selectedVariant?.sale_price ?? product.current_sale_price,
                                            stock_quantity: (selectedVariant?.stock ?? ((((Array.isArray(product.colors) && product.colors.length > 0) || (Array.isArray(product.sizes) && product.sizes.length > 0)) && (selectedColor || selectedSize) && !variantLoading) ? 0 : (product.stock_quantity ?? product.available_quantity ?? 0))),
                                            sku: selectedVariant?.sku ?? product.sku,
                                            selected_variant_id: selectedVariant?.id ?? null,
                                            selectedColor,
                                            selectedSize,
                                            quantity
                                        }}
                                        quantity={quantity}
                                        selectedColor={selectedColor}
                                        selectedSize={selectedSize}
                                        className="flex-1 py-4 px-8 text-lg font-bold"
                                        variant="gradient"
                                        onValidationError={(message) => showWarning(message, 'Sélection requise')}
                                        showAnimation={true}
                                    />

                                    <WishlistButton 
                                        product={product}
                                        size="large"
                                        className="border-2 border-gray-300 hover:border-gray-400"
                                    />

                                    <PulseButton 
                                        onClick={() => {
                                            navigator.share({
                                                title: product.name,
                                                text: product.description,
                                                url: window.location.href
                                            }).catch(() => {
                                                // Fallback pour navigateurs sans support Web Share API
                                                navigator.clipboard.writeText(window.location.href);
                                                showSuccess('Lien copié dans le presse-papiers', 'ðŸ”— Lien partagé');
                                            });
                                        }}
                                        className="p-4 border-2 border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                                        title="Partager ce produit"
                                    >
                                        <ShareIcon className="h-6 w-6" />
                                    </PulseButton>
                                </div>
                            </div>

                            {/* Informations de livraison */}
                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <TruckIcon className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">Livraison gratuite</p>
                                        <p className="text-sm text-gray-600">Dès {appSettings?.free_shipping_threshold || '50000'} {currencySymbol} d'achat</p>
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
                    <ReviewSection 
                        reviews={reviews} 
                        averageRating={averageRating} 
                        product={product} 
                    />
                </div>

                {/* Produits similaires */}
                <div className="mt-16 border-t border-gray-200 pt-16">
                    <RelatedProducts products={relatedProducts} />
                </div>
            </div>
        </>
    );
}

// Wrapper avec le nouveau système
export default function ProductShowWithCart({ wishlistItems, ...props }) {
    return (
        <FrontendLayout 
            title={`${props.product.name} - ENMA SPA`} 
            wishlistItems={wishlistItems}
        >
            <ProductShow {...props} />
        </FrontendLayout>
    );
}















