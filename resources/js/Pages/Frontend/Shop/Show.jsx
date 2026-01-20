import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FrontendLayout, { useCart } from '@/Layouts/FrontendLayout';
import { Link, usePage, router } from '@inertiajs/react';
import {
  ChevronRightIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import ProductCardUnified from '@/Components/Frontend/ProductCardNew';
import ReviewCard from '@/Components/Frontend/ReviewCard';
import ReviewForm from '@/Components/Frontend/ReviewForm';
import { useNotification } from '@/Components/Notifications/NotificationProvider';
import { PulseButton } from '@/Components/Animations/AnimationComponents';
import { formatCurrency } from '@/Utils/LocaleUtils';

// Galerie d'images style AfrikSneakers
const AfrikSneakersImageGallery = ({ images, productName, productImage }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const allImages = useMemo(() => {
    const list = [];
    if (productImage) list.push(productImage);
    if (Array.isArray(images) && images.length > 0) {
      const extra = images
        .map((img) => (typeof img === 'object' && img.image ? img.image : img))
        .filter((src) => !!src && src !== productImage)
        .map((src) => (String(src).startsWith('http') ? src : `${window.location.origin}/${src}`));
      return [...list, ...extra];
    }
    return list.length > 0 ? list : ['/images/placeholder.jpg'];
  }, [images, productImage]);

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="bg-white">
        <div className="aspect-square w-full overflow-hidden bg-white">
          <img
            src={allImages[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="h-full w-full object-cover object-center transition-opacity duration-500"
            style={{ height: '520px' }}
          />
        </div>
      </div>
      
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 aspect-square w-20 h-20 overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Miniature ${index + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Sélecteur de tailles style AfrikSneakers
const SizeSelector = ({ sizes, selectedSize, onSizeChange, isSizeEnabled }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 font-barlow">
        Pointure
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {sizes.map((size) => {
          const disabled = !isSizeEnabled(size.id);
          const selected = selectedSize?.id === size.id;
          return (
            <button
              key={size.id}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                if (selected) {
                  onSizeChange(null);
                } else {
                  onSizeChange(size);
                }
              }}
              className={`aspect-square h-12 border transition-all duration-200 font-barlow font-medium disabled:opacity-30 disabled:cursor-not-allowed ${
                selected 
                  ? 'border-black bg-black text-white' 
                  : disabled 
                    ? 'border-gray-200 text-gray-400 line-through'
                    : 'border-gray-300 text-gray-900 hover:border-black'
              }`}
            >
              {size.size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Simplifié pour AfrikSneakers - les couleurs seront gérées différemment
const ProductVariants = ({ colors, sizes, selectedColor, selectedSize, onColorChange, onSizeChange, isColorEnabled = () => true, isSizeEnabled = () => true }) => {
  return null; // Géré directement dans le composant principal
};

// Composant pour les avis avec style adapté AfrikSneakers
const AfrikSneakersReviewSection = ({ reviews, averageRating: avgFromProps, product }) => {
    const { auth } = usePage().props;
    const { showSuccess, showError, showInfo } = useNotification();
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [deletedReviewIds, setDeletedReviewIds] = useState(new Set());

    const avgRating = typeof avgFromProps === 'number' && !Number.isNaN(avgFromProps)
        ? avgFromProps
        : (reviews.length > 0
            ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length
            : 0);

    const filteredReviews = reviews.filter(review => !deletedReviewIds.has(review.id));
    const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

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
        
        if (action === 'created') {
            showSuccess(
                'Votre avis a été publié avec succès !', 
                '✓ Avis publié'
            );
        } else if (action === 'updated') {
            showSuccess(
                'Votre avis a été modifié avec succès !', 
                '✓ Avis modifié'
            );
        } else if (action === 'deleted') {
            if (reviewId) {
                setDeletedReviewIds(prev => new Set([...prev, reviewId]));
                if (userReview && userReview.id === reviewId) {
                    setUserReview(null);
                }
            }
            
            showSuccess(
                'Votre avis a été supprimé avec succès !', 
                '✓ Avis supprimé'
            );
            
            setTimeout(() => {
                router.reload({
                    preserveState: true,
                    preserveScroll: true,
                    only: ['reviews'],
                });
            }, 2000);
        }
    };

    return (
        <div className="space-y-8 font-barlow">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900 font-barlow">Avis clients</h3>
                <div className="flex items-center space-x-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIconSolid
                                        key={i}
                                        className={`h-5 w-5 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-medium text-gray-900">
                                {avgRating.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                            {filteredReviews.length} avis
                        </p>
                    </div>
                    
                    {auth.user && !userReview && (
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            {showReviewForm ? 'Annuler' : 'Écrire un avis'}
                        </button>
                    )}
                    
                    {!auth.user && (
                        <button
                            onClick={() => showInfo('Connectez-vous pour laisser un avis', 'Connexion requise')}
                            className="bg-gray-500 text-white px-4 py-2 text-sm font-medium hover:bg-gray-600 transition-colors"
                        >
                            Se connecter
                        </button>
                    )}
                </div>
            </div>

            {showReviewForm && (
                <div className="bg-gray-50 border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">
                            {editingReview ? 'Modifier votre avis' : 'Laisser un avis'}
                        </h4>
                        <button
                            onClick={editingReview ? handleCancelEdit : () => setShowReviewForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <span className="sr-only">Fermer</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <ReviewForm 
                        product={product}
                        existingReview={editingReview}
                        onCancel={editingReview ? handleCancelEdit : () => setShowReviewForm(false)}
                        onSuccess={handleReviewSuccess}
                    />
                </div>
            )}

            {userReview && !editingReview && (
                <div className="bg-blue-50 border border-blue-200 p-1">
                    <div className="bg-blue-100 px-4 py-2">
                        <h4 className="font-medium text-blue-900">Votre avis</h4>
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

                    {filteredReviews.length > 3 && (
                        <div className="text-center">
                            <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="text-gray-600 hover:text-black text-sm font-medium"
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
                    <StarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun avis pour ce produit
                    </h4>
                    <p className="text-gray-600 mb-6">
                        Soyez le premier à partager votre expérience !
                    </p>
                    {auth.user ? (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Écrire le premier avis
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                showInfo('Connectez-vous pour être le premier à laisser un avis', 'Connexion requise');
                            }}
                            className="bg-gray-500 text-white px-6 py-2 text-sm font-medium hover:bg-gray-600 transition-colors"
                        >
                            Se connecter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Composant produits similaires style AfrikSneakers
const AfrikSneakersRelatedProducts = ({ products }) => {
    if (!products || products.length === 0) return null;
    
    return (
        <div className="mt-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 font-barlow">Produits similaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCardUnified key={product.id} product={product} variant="mini" />
                ))}
            </div>
        </div>
    );
};

function AfrikSneakersProductShow({ product, relatedProducts = [], reviews = [], userCanReview = false }) {
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const { appSettings } = usePage().props;
  
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Availability maps from variants
  const availability = useMemo(() => {
    const byColor = new Map();
    const bySize = new Map();
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        const c = v.color_id ?? null;
        const s = v.size_id ?? null;
        if (c !== null && s !== null) {
          if (!byColor.has(c)) byColor.set(c, new Set());
          byColor.get(c).add(s);
          if (!bySize.has(s)) bySize.set(s, new Set());
          bySize.get(s).add(c);
        }
      });
    }
    return { byColor, bySize };
  }, [product.variants]);

  const isSizeEnabled = useCallback(
    (sizeId) => {
      if (!selectedColor) return true;
      const set = availability.byColor.get(selectedColor.id);
      return !!(set && set.has(sizeId));
    },
    [availability, selectedColor]
  );

  const isColorEnabled = useCallback(
    (colorId) => {
      if (!selectedSize) return true;
      const set = availability.bySize.get(selectedSize.id);
      return !!(set && set.has(colorId));
    },
    [availability, selectedSize]
  );

  // Auto-selection
  useEffect(() => {
    if (!selectedColor && Array.isArray(product.colors) && product.colors.length === 1) {
      setSelectedColor(product.colors[0]);
    }
    if (!selectedSize && Array.isArray(product.sizes) && product.sizes.length === 1) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  // Fetch selected variant
  useEffect(() => {
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    if (!hasColors && !hasSizes) {
      setSelectedVariant(null);
      return;
    }
    let cancelled = false;
    async function load() {
      const params = new URLSearchParams();
      if (selectedColor?.id) params.append('color_id', selectedColor.id);
      if (selectedSize?.id) params.append('size_id', selectedSize.id);
      setVariantLoading(true);
      try {
        const resp = await fetch(`/api/products/${product.id}/variant?${params.toString()}`, {
          headers: { Accept: 'application/json' },
        });
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
    load();
    return () => {
      cancelled = true;
    };
  }, [product.id, selectedColor?.id, selectedSize?.id]);

  const effectivePrice = selectedVariant?.sale_price ?? product.current_sale_price ?? 0;
  const compareAt = product.price && product.price > effectivePrice ? product.price : null;
  const effectiveStock = selectedVariant?.stock ?? product.stock_quantity ?? product.available_quantity ?? 0;

  const canAddToCart = (!product.sizes || product.sizes.length === 0 || selectedSize) && 
                       (!product.colors || product.colors.length === 0 || selectedColor);

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    
    addToCart({
      ...product,
      current_sale_price: effectivePrice,
      stock_quantity: effectiveStock,
      sku: selectedVariant?.sku ?? product.sku,
      selected_variant_id: selectedVariant?.id ?? null,
      selectedColor,
      selectedSize,
    }, quantity);
    
    showSuccess(`${product.name} ajouté au panier`, '✓ Produit ajouté');
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb style AfrikSneakers */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href={route('home')} className="text-gray-500 hover:text-gray-700 font-barlow">
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href={route('frontend.shop.index')} className="text-gray-500 hover:text-gray-700 font-barlow">
                    Boutique
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900 font-barlow font-medium">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Container principal style AfrikSneakers */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* COLONNE GAUCHE - GALERIE */}
          <div className="lg:col-span-1">
            <AfrikSneakersImageGallery 
              images={product.images} 
              productImage={product.image} 
              productName={product.name} 
            />
          </div>

          {/* COLONNE DROITE - INFOS PRODUIT */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* 1. NOM DU PRODUIT */}
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 font-barlow leading-tight">
                  {product.name}
                </h1>
                
                {/* 2. MARQUE */}
                {product.brand && (
                  <p className="text-sm text-gray-600 font-barlow">
                    {product.brand.name}
                  </p>
                )}
              </div>

              {/* 3. PRIX */}
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-semibold text-gray-900 font-barlow">
                    {variantLoading ? '...' : formatCurrency(effectivePrice)}
                  </span>
                  {compareAt && (
                    <span className="text-lg text-gray-500 line-through font-barlow">
                      {formatCurrency(compareAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. SÉLECTEUR DE POINTURE */}
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                console.log('Rendering SizeSelector with sizes:', product.sizes),
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  isSizeEnabled={isSizeEnabled}
                />
              )}

              {/* 5. BOUTON AJOUTER AU PANIER */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full h-14 bg-black text-white font-barlow font-semibold text-base disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors duration-300"
              >
                {!canAddToCart 
                  ? 'Sélectionnez une taille' 
                  : `Ajouter au panier`
                }
              </button>

              {/* 6. INFOS LIVRAISON */}
              <div className="text-sm text-gray-600 text-center font-barlow">
                Livraison rapide 24h – 48h
              </div>

              {/* 7. DESCRIPTION COURTE */}
              {product.description && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 font-barlow">Description</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed font-barlow text-sm">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Informations additionnelles */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <TruckIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-barlow">Livraison gratuite dès {formatCurrency(appSettings?.free_shipping_threshold || 50000)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-barlow">Retours gratuits sous 30 jours</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-barlow">Paiement 100% sécurisé</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Section des avis */}
        <div className="mt-20 border-t border-gray-200 pt-16">
          <AfrikSneakersReviewSection 
            reviews={reviews} 
            averageRating={(() => {
              const fromReviews = (Array.isArray(reviews) && reviews.length > 0)
                ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length)
                : null;
              return fromReviews ?? (Number(product?.average_rating) || 0);
            })()}
            product={product} 
          />
        </div>

        {/* Produits similaires */}
        <div className="mt-20 border-t border-gray-200 pt-16">
          <AfrikSneakersRelatedProducts products={relatedProducts} />
        </div>
      </div>
    </div>
  );
}

export default function ProductShowWithCart({ wishlistItems, ...props }) {
  return (
    <FrontendLayout title={`${props.product.name} - ENMA SPA`} wishlistItems={wishlistItems}>
      <AfrikSneakersProductShow {...props} />
    </FrontendLayout>
  );
}

