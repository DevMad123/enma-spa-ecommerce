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
import { StarIcon } from '@heroicons/react/24/outline';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import CartButton from '@/Components/Frontend/CartButton';
import ProductCardUnified from '@/Components/Frontend/ProductCardNew';
import ReviewCard from '@/Components/Frontend/ReviewCard';
import ReviewForm from '@/Components/Frontend/ReviewForm';
import { useNotification } from '@/Components/Notifications/NotificationProvider';
import { PulseButton } from '@/Components/Animations/AnimationComponents';
import { formatCurrency } from '@/Utils/LocaleUtils';

const ImageGallery = ({ images, productName, productImage }) => {
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
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={allImages[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className="h-96 w-full object-cover object-center"
        />
      </div>
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                selectedImage === index
                  ? 'border-amber-500 ring-2 ring-amber-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
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

const ProductVariants = ({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  isColorEnabled = () => true,
  isSizeEnabled = () => true,
}) => {
  return (
    <div className="space-y-6">
      {Array.isArray(colors) && colors.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Couleur: {selectedColor ? selectedColor.name : 'Selectionner une couleur'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const disabled = selectedSize ? !isColorEnabled(color.id) : false;
              const selected = selectedColor?.id === color.id;
              return (
                <button
                  key={color.id}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    if (selected) {
                      onColorChange(null);
                    } else {
                      onColorChange(color);
                    }
                  }}
                  className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selected ? 'border-amber-500 ring-2 ring-amber-200 scale-110' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.color_code || (color.name || '').toLowerCase() }}
                  title={color.name}
                >
                  {selected && (
                    <CheckIcon className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {Array.isArray(sizes) && sizes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Taille: {selectedSize ? selectedSize.name : 'Selectionner une taille'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const disabled = selectedColor ? !isSizeEnabled(size.id) : false;
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
                  className={`px-4 py-3 border rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selected ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {size.size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewSection = ({ reviews, averageRating: avgFromProps, product }) => {
    const { auth } = usePage().props;
    const { showSuccess, showError, showInfo } = useNotification();
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    // état local pour gérer les avis supprimés visuellement
    const [deletedReviewIds, setDeletedReviewIds] = useState(new Set());

    const avgRating = typeof avgFromProps === 'number' && !Number.isNaN(avgFromProps)
        ? avgFromProps
        : (reviews.length > 0
            ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length
            : 0);

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
                'Votre avis a été publié avec succés ! Les données vont étre mises é jour automatiquement.', 
                '? Avis publié'
            );
        } else if (action === 'updated') {
            showSuccess(
                'Votre avis a été modifié avec succés ! Les modifications sont visibles.', 
                '?? Avis modifié'
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
                'Votre avis a été supprimé avec succés !', 
                '??? Avis supprimé'
            );
            
            // Recharger les données en arriére-plan aprés un délai
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
            {/* En-téte des avis */}
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-900">Avis clients</h3>
                <div className="flex items-center space-x-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIconSolid
                                        key={i}
                                        className={`h-6 w-6 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                {avgRating.toFixed(1)}
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
                        Soyez le premier é partager votre expérience !
                    </p>
                    {auth.user ? (
                        <PulseButton
                            onClick={() => setShowReviewForm(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
                        >
                            écrire le premier avis
                        </PulseButton>
                    ) : (
                        <PulseButton
                            onClick={() => {
                                showInfo('Connectez-vous pour étre le premier é laisser un avis', 'Connexion requise');
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
    const { appSettings } = usePage().props;
    const currencySymbol = appSettings?.currency_symbol || 'F CFA';

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
                                    {formatCurrency(product.current_sale_price)}
                                </span>
                                <PulseButton
                                    onClick={() => {
                                        addToCart(product, 1);
                                        showSuccess(`${product.name} ajouté au panier`, '?? Produit similaire ajouté');
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

const RelatedProductsUnified = ({ products }) => {
    if (!products || products.length === 0) return null;
    return (
        <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCardUnified key={product.id} product={product} variant="mini" />
                ))}
            </div>
        </div>
    );
};

function ProductShow({ product, relatedProducts = [], reviews = [], userCanReview = false }) {
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const { appSettings } = usePage().props;
  const currencySymbol = appSettings?.currency_symbol || 'F CFA';

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

  // Minimal auto-selection if only one option exists in a dimension
  useEffect(() => {
    if (!selectedColor && Array.isArray(product.colors) && product.colors.length === 1) {
      setSelectedColor(product.colors[0]);
    }
    if (!selectedSize && Array.isArray(product.sizes) && product.sizes.length === 1) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  // Fetch selected variant when attributes change
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

  const handleQuantityChange = (change) => {
    const next = quantity + change;
    const maxStock = selectedVariant?.stock ?? product.stock ?? product.stock_quantity ?? 99;
    if (next >= 1 && next <= maxStock) setQuantity(next);
  };

  const handleShare = () => {
    try {
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const effectivePrice = selectedVariant?.sale_price ?? product.current_sale_price ?? 0;
  const compareAt = product.price && product.price > effectivePrice ? product.price : null;
  const effectiveStock = selectedVariant?.stock ?? product.stock_quantity ?? product.available_quantity ?? 0;

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
          <div className="lg:col-span-1">
            <ImageGallery images={product.images} productImage={product.image} productName={product.name} />
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-1">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Prix dynamique */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {variantLoading ? '...' : formatCurrency(effectivePrice)}
                  </span>
                  {compareAt && (
                    <span className="text-xl text-gray-500 line-through">{formatCurrency(compareAt)}</span>
                  )}
                </div>
              </div>

              {/* Variantes */}
              <ProductVariants
                colors={product.colors || []}
                sizes={product.sizes || []}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorChange={setSelectedColor}
                onSizeChange={setSelectedSize}
                isColorEnabled={isColorEnabled}
                isSizeEnabled={isSizeEnabled}
              />

              {/* Quantite + actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => handleQuantityChange(-1)} className="p-3 hover:bg-gray-50" disabled={quantity <= 1}>
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-3 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:bg-gray-50"
                      disabled={quantity >= (selectedVariant?.stock ?? product.stock ?? product.stock_quantity ?? 99)}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {(selectedVariant?.stock ?? product.stock ?? product.stock_quantity) && (
                    <span className="text-gray-600">{(selectedVariant?.stock ?? product.stock ?? product.stock_quantity)} en stock</span>
                  )}
                </div>

                <div className="flex space-x-4">
                  <CartButton
                    product={{
                      ...product,
                      current_sale_price: effectivePrice,
                      stock_quantity: effectiveStock,
                      sku: selectedVariant?.sku ?? product.sku,
                      selected_variant_id: selectedVariant?.id ?? null,
                      selectedColor,
                      selectedSize,
                    }}
                    quantity={quantity}
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    className="flex-1 py-4 px-8 text-lg font-bold"
                    variant="gradient"
                  />

                  <WishlistButton product={product} size="large" className="border-2 border-gray-300 hover:border-gray-400" />

                  <PulseButton onClick={handleShare} className="p-4 border-2 border-gray-300 text-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-50">
                    <ShareIcon className="h-6 w-6" />
                  </PulseButton>
                </div>

                {/* Informations de livraison */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-gray-900">Livraison gratuite</p>
                      <p className="text-sm text-gray-600">Des {formatCurrency(appSettings?.free_shipping_threshold || 50000)} d'achat</p>
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
                      <p className="font-medium text-gray-900">Paiement securise</p>
                      <p className="text-sm text-gray-600">Vos donnees sont protegees</p>
                    </div>
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
        <div className="mt-16 border-t border-gray-200 pt-16">
            <RelatedProductsUnified products={relatedProducts} />
        </div>
      </div>
    </>
  );
}

export default function ProductShowWithCart({ wishlistItems, ...props }) {
  return (
    <FrontendLayout title={`${props.product.name} - ENMA SPA`} wishlistItems={wishlistItems}>
      <ProductShow {...props} />
    </FrontendLayout>
  );
}

