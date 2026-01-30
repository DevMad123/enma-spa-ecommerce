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

// Composant Accordéon Premium (style Wethenew)
const ProductAccordion = ({ product, appSettings }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'description',
      title: 'DESCRIPTION',
      content: (
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
          {product.description && (
            <p className="text-gray-700">{product.description}</p>
          )}
          {product.brand?.name && (
            <p><span className="font-medium text-gray-800">Marque :</span> {product.brand.name}</p>
          )}
          {product.sku && (
            <p><span className="font-medium text-gray-800">Référence :</span> {product.sku}</p>
          )}
          <p><span className="font-medium text-gray-800">Catégorie :</span> {product.category?.name || 'Mode'}</p>
        </div>
      )
    },
    {
      id: 'authenticity',
      title: 'AUTHENTICITÉ',
      content: (
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
          <p className="text-gray-700 font-medium">Garantie d'authenticité à 100%</p>
          <p>Tous nos produits sont rigoureusement contrôlés par nos experts avant expédition.</p>
          <p>Nous travaillons exclusivement avec des revendeurs agréés et des partenaires de confiance pour vous garantir des articles authentiques.</p>
          <p>Chaque commande est livrée avec une preuve de contrôle qualité et un scellé de sécurité.</p>
          <p className="text-gray-800 font-medium">Votre satisfaction et votre confiance sont notre priorité.</p>
        </div>
      )
    },
    {
      id: 'shipping',
      title: 'LIVRAISON & RETOUR',
      content: (
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
          <div>
            <p className="font-medium text-gray-800 mb-2">Livraison</p>
            <p>• Livraison rapide 24h - 48h en Côte d'Ivoire</p>
            <p>• Livraison gratuite dès {formatCurrency(appSettings?.free_shipping_threshold || 50000)}</p>
            <p>• Suivi de commande en temps réel</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-2">Retours</p>
            <p>• Retours gratuits sous 30 jours</p>
            <p>• Produits non portés et dans leur emballage d'origine</p>
            <p>• Remboursement intégral ou échange possible</p>
          </div>
        </div>
      )
    },
    {
      id: 'payment',
      title: 'MOYENS DE PAIEMENT',
      content: (
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
          <p className="font-medium text-gray-800">Paiement 100% sécurisé</p>
          <div className="space-y-1">
            <p>• Carte bancaire (Visa, Mastercard, American Express)</p>
            <p>• PayPal</p>
            <p>• Paiement mobile (Apple Pay, Google Pay)</p>
            <p>• Virement bancaire</p>
          </div>
          <p className="text-gray-700">Toutes vos données sont chiffrées et protégées par certificat SSL.</p>
        </div>
      )
    }
  ];

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="space-y-0">
        {sections.map((section, index) => (
          <div key={section.id} className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between py-5 px-0 text-left hover:bg-gray-50 transition-colors duration-200"
            >
              <h3 className="text-sm font-semibold text-black font-barlow tracking-wider uppercase">
                {section.title}
              </h3>
              <div className="flex-shrink-0 ml-4">
                {openSection === section.id ? (
                  <MinusIcon className="h-4 w-4 text-gray-600" />
                ) : (
                  <PlusIcon className="h-4 w-4 text-gray-600" />
                )}
              </div>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSection === section.id 
                  ? 'max-h-96 opacity-100 pb-5' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pr-8">
                {section.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Galerie d'images
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

// Composant d'attributs unifié (Tailles/Pointures et Couleurs)
const AttributeSelector = ({ 
  items, 
  selectedItem, 
  onItemChange, 
  isItemEnabled, 
  type = 'size', // 'size' ou 'color'
  autoDetectLabel = true 
}) => {
  // Logique de détection automatique du label pour les tailles
  const getAttributeLabel = () => {
    if (type === 'color') return 'Couleur';
    if (!autoDetectLabel || !items?.length) return 'Taille';
    
    // Vérifier si toutes les valeurs sont uniquement des chiffres
    const allNumeric = items.every(item => {
      const value = item.size || item.name || item.value || '';
      return /^\d+$/.test(value.toString().trim());
    });
    
    return allNumeric ? 'Pointure' : 'Taille';
  };

  // Rendu pour les couleurs
  const renderColorItem = (item) => {
    const disabled = isItemEnabled ? !isItemEnabled(item.id) : false;
    const selected = selectedItem?.id === item.id;
    
    return (
      <button
        key={item.id}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (selected) {
            onItemChange(null);
          } else {
            onItemChange(item);
          }
        }}
        className={`relative w-10 h-10 border-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
          selected 
            ? 'border-black scale-110' 
            : disabled 
              ? 'border-gray-200'
              : 'border-gray-300 hover:border-gray-500'
        }`}
        style={{ backgroundColor: item.hex_code || item.color_code || '#ccc' }}
        title={item.name}
      >
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckIcon className="h-4 w-4 text-white drop-shadow-lg" />
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-gray-400 rotate-45"></div>
          </div>
        )}
      </button>
    );
  };

  // Rendu pour les tailles
  const renderSizeItem = (item) => {
    const disabled = isItemEnabled ? !isItemEnabled(item.id) : false;
    const selected = selectedItem?.id === item.id;
    
    return (
      <button
        key={item.id}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (selected) {
            onItemChange(null);
          } else {
            onItemChange(item);
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
        {item.size || item.name || item.value}
      </button>
    );
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 font-barlow">
        {getAttributeLabel()}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
        {items.map((item) => 
          type === 'color' ? renderColorItem(item) : renderSizeItem(item)
        )}
      </div>
    </div>
  );
};

// Composant pour les avis
const ReviewSection = ({ reviews, averageRating: avgFromProps, product }) => {
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

// Composant produits similaires
const RelatedProducts = ({ products }) => {
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

function ProductShow({ product, relatedProducts = [], reviews = [], userCanReview = false }) {
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const { appSettings } = usePage().props;
  
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Déterminer si le produit est variable (a des variants) ou simple
  const isVariableProduct = Array.isArray(product.variants) && product.variants.length > 0;
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  // Availability maps from variants
  const availability = useMemo(() => {
    const byColor = new Map();
    const bySize = new Map();
    const availableColors = new Set();
    const availableSizes = new Set();
    
    if (isVariableProduct) {
      // Pour les produits variables : mapper selon les variants
      product.variants.forEach((v) => {
        const c = v.color_id ?? null;
        const s = v.size_id ?? null;
        
        if (c !== null && s !== null) {
          if (!byColor.has(c)) byColor.set(c, new Set());
          byColor.get(c).add(s);
          if (!bySize.has(s)) bySize.set(s, new Set());
          bySize.get(s).add(c);
          availableColors.add(c);
          availableSizes.add(s);
        } else {
          if (c !== null) availableColors.add(c);
          if (s !== null) availableSizes.add(s);
        }
      });
    } else {
      // Pour les produits simples : toutes les couleurs/tailles sont disponibles
      if (hasColors) {
        product.colors.forEach(color => {
          availableColors.add(color.id);
          // Pour produit simple, toutes les combinaisons sont possibles
          if (hasSizes) {
            if (!byColor.has(color.id)) byColor.set(color.id, new Set());
            product.sizes.forEach(size => byColor.get(color.id).add(size.id));
          }
        });
      }
      if (hasSizes) {
        product.sizes.forEach(size => {
          availableSizes.add(size.id);
          // Pour produit simple, toutes les combinaisons sont possibles
          if (hasColors) {
            if (!bySize.has(size.id)) bySize.set(size.id, new Set());
            product.colors.forEach(color => bySize.get(size.id).add(color.id));
          }
        });
      }
    }
    
    return { byColor, bySize, availableColors, availableSizes };
  }, [isVariableProduct, hasColors, hasSizes, product.variants, product.colors, product.sizes]);

  const isSizeEnabled = useCallback(
    (sizeId) => {
      // Pour les produits simples, toutes les tailles sont toujours disponibles
      if (!isVariableProduct) {
        return availability.availableSizes.has(sizeId);
      }
      
      // Pour les produits variables : vérifier selon la couleur sélectionnée
      if (!selectedColor) {
        return availability.availableSizes.has(sizeId);
      }
      
      const set = availability.byColor.get(selectedColor.id);
      return !!(set && set.has(sizeId));
    },
    [availability, selectedColor, isVariableProduct]
  );

  const isColorEnabled = useCallback(
    (colorId) => {
      // Pour les produits simples, toutes les couleurs sont toujours disponibles
      if (!isVariableProduct) {
        return availability.availableColors.has(colorId);
      }
      
      // Pour les produits variables : vérifier selon la taille sélectionnée
      if (!selectedSize) {
        return availability.availableColors.has(colorId);
      }
      
      const set = availability.bySize.get(selectedSize.id);
      return !!(set && set.has(colorId));
    },
    [availability, selectedSize, isVariableProduct]
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

  // Fetch selected variant (seulement pour les produits variables)
  useEffect(() => {
    // Pour les produits simples, pas de variant à récupérer
    if (!isVariableProduct) {
      setSelectedVariant(null);
      setVariantLoading(false);
      return;
    }

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
  }, [product.id, selectedColor?.id, selectedSize?.id, isVariableProduct, hasColors, hasSizes]);

  // Fonction pour calculer le prix avec réduction d'un variant
  const calculateDiscountedPrice = useCallback((variantPrice) => {
    const price = parseFloat(variantPrice || 0);
    if (price <= 0) return 0;

    const hasDiscount = product.has_discount || (product.discount && parseFloat(product.discount) > 0);
    if (!hasDiscount) return price;

    const discountValue = parseFloat(product.discount || 0);
    const discountType = product.discount_type; // 0 = fixe, 1 = pourcentage

    if (discountType === 1) { // Pourcentage
      return price - (price * (discountValue / 100));
    } else { // Montant fixe
      return Math.max(0, price - discountValue);
    }
  }, [product.has_discount, product.discount, product.discount_type]);

  // Calculer le prix minimum des variants pour les produits variables (avec réduction)
  const minVariantPrice = useMemo(() => {
    if (!isVariableProduct || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }
    const prices = product.variants
      .map(variant => calculateDiscountedPrice(variant.sale_price))
      .filter(price => price != null && price > 0);
    
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [isVariableProduct, product.variants, calculateDiscountedPrice]);

  // Calculer le prix minimum pour une couleur spécifique (avec réduction)
  const minPriceForColor = useMemo(() => {
    if (!isVariableProduct || !selectedColor || !Array.isArray(product.variants)) {
      return null;
    }
    
    const colorVariants = product.variants.filter(variant => variant.color_id === selectedColor.id);
    const prices = colorVariants
      .map(variant => calculateDiscountedPrice(variant.sale_price))
      .filter(price => price != null && price > 0);
    
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [isVariableProduct, selectedColor, product.variants, calculateDiscountedPrice]);

  // Calculer le prix minimum pour une taille spécifique (avec réduction)
  const minPriceForSize = useMemo(() => {
    if (!isVariableProduct || !selectedSize || !Array.isArray(product.variants)) {
      return null;
    }
    
    const sizeVariants = product.variants.filter(variant => variant.size_id === selectedSize.id);
    const prices = sizeVariants
      .map(variant => calculateDiscountedPrice(variant.sale_price))
      .filter(price => price != null && price > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [isVariableProduct, selectedSize, product.variants, calculateDiscountedPrice]);

  // Calculer le prix original (avant réduction) pour un variant
  const getOriginalPrice = useCallback((variantPrice) => {
    const price = parseFloat(variantPrice || 0);
    return price > 0 ? price : null;
  }, []);

  // Calculer le prix original minimum pour affichage barré
  const originalPriceForDisplay = useMemo(() => {
    if (isVariableProduct) {
      // Si un variant exact est sélectionné, utiliser son prix original
      if (selectedVariant?.sale_price && selectedColor && selectedSize) {
        return getOriginalPrice(selectedVariant.sale_price);
      }
      
      // Si seulement couleur sélectionnée, utiliser le prix original minimum pour cette couleur
      if (selectedColor) {
        const colorVariants = product.variants?.filter(v => v.color_id === selectedColor.id) || [];
        const prices = colorVariants.map(v => parseFloat(v.sale_price || 0)).filter(p => p > 0);
        return prices.length > 0 ? Math.min(...prices) : null;
      }
      
      // Si seulement taille sélectionnée, utiliser le prix original minimum pour cette taille
      if (selectedSize) {
        const sizeVariants = product.variants?.filter(v => v.size_id === selectedSize.id) || [];
        const prices = sizeVariants.map(v => parseFloat(v.sale_price || 0)).filter(p => p > 0);
        return prices.length > 0 ? Math.min(...prices) : null;
      }
      
      // Aucune sélection : prix original minimum global
      const prices = product.variants?.map(v => parseFloat(v.sale_price || 0)).filter(p => p > 0) || [];
      return prices.length > 0 ? Math.min(...prices) : (product.current_sale_price || product.price || 0);
    }
    
    // Produit simple : prix original
    return product.current_sale_price ?? product.price ?? 0;
  }, [
    isVariableProduct,
    selectedVariant,
    selectedColor,
    selectedSize,
    product.variants,
    product.current_sale_price,
    product.price,
    getOriginalPrice
  ]);

  // Pour les produits variables, utiliser une logique intelligente selon les sélections (avec réduction)
  const effectivePrice = useMemo(() => {
    if (isVariableProduct) {
      // Si un variant exact est sélectionné (couleur ET taille), utiliser son prix avec réduction
      if (selectedVariant?.sale_price && selectedColor && selectedSize) {
        return calculateDiscountedPrice(selectedVariant.sale_price);
      }
      
      // Si couleur ET taille sélectionnées mais pas de variant trouvé, utiliser le minimum des deux
      if (selectedColor && selectedSize) {
        return Math.min(minPriceForColor || Infinity, minPriceForSize || Infinity) || minVariantPrice || calculateDiscountedPrice(product.current_sale_price) || 0;
      }
      
      // Si seulement couleur sélectionnée, utiliser le prix minimum pour cette couleur (avec réduction)
      if (selectedColor && minPriceForColor) {
        return minPriceForColor;
      }
      
      // Si seulement taille sélectionnée, utiliser le prix minimum pour cette taille (avec réduction)
      if (selectedSize && minPriceForSize) {
        return minPriceForSize;
      }
      
      // Aucune sélection : utiliser le prix minimum global (avec réduction)
      return minVariantPrice ?? calculateDiscountedPrice(product.current_sale_price) ?? 0;
    }
    
    // Produit simple : prix avec réduction
    return calculateDiscountedPrice(product.current_sale_price ?? product.price ?? 0);
  }, [
    isVariableProduct, 
    selectedVariant?.sale_price, 
    selectedColor, 
    selectedSize, 
    minPriceForColor, 
    minPriceForSize, 
    minVariantPrice, 
    product.current_sale_price, 
    product.price,
    calculateDiscountedPrice
  ]);
  
  // Vérifier s'il y a une réduction à afficher
  const hasDiscount = product.has_discount || (product.discount && parseFloat(product.discount) > 0);
  const compareAt = hasDiscount && originalPriceForDisplay && originalPriceForDisplay > effectivePrice 
    ? originalPriceForDisplay 
    : null;
  
  // Forcer le stock à être un entier (pas de demi-produit)
  const effectiveStock = Math.floor(isVariableProduct 
    ? (selectedVariant?.stock ?? product.stock_quantity ?? product.available_quantity ?? 0)
    : (product.stock_quantity ?? product.available_quantity ?? 0));

  // Validation : pour produits simples ET variables, sélection obligatoire si attributs présents
  const canAddToCart = (
    (!hasSizes || selectedSize) && 
    (!hasColors || selectedColor)
  );

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    
    // Préparer les données du produit avec sélections
    const cartData = {
      ...product,
      current_sale_price: effectivePrice,
      stock_quantity: effectiveStock,
      sku: isVariableProduct ? (selectedVariant?.sku ?? product.sku) : product.sku,
      selected_variant_id: isVariableProduct ? (selectedVariant?.id ?? null) : null,
      selectedColor,
      selectedSize,
      // Métadonnées pour les produits simples avec attributs sélectionnés
      isSimpleWithAttributes: !isVariableProduct && (hasColors || hasSizes),
      simpleProductMeta: !isVariableProduct ? {
        selected_color: selectedColor ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex_code || selectedColor.color_code } : null,
        selected_size: selectedSize ? { id: selectedSize.id, name: selectedSize.size || selectedSize.name } : null
      } : null
    };
    
    addToCart(cartData, quantity);
    
    // Message de succès avec informations sur les sélections
    let successMessage = `${product.name} ajouté au panier`;
    const selections = [];
    if (selectedColor) selections.push(selectedColor.name);
    if (selectedSize) selections.push(selectedSize.size || selectedSize.name);
    if (selections.length > 0) {
      successMessage += ` (${selections.join(', ')})`;
    }
    
    showSuccess(successMessage, '✓ Produit ajouté');
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
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

      {/* Container principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* COLONNE GAUCHE - GALERIE */}
          <div className="lg:col-span-1">
            <ImageGallery 
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
                  {compareAt ? (
                    // Avec réduction : afficher prix original barré + prix en solde en rouge
                    <>
                      <span className="text-lg text-gray-500 line-through font-barlow">
                        {formatCurrency(compareAt)}
                      </span>
                      <span className="text-2xl font-bold text-black font-barlow">
                        {variantLoading ? '...' : formatCurrency(effectivePrice)}
                      </span>
                    </>
                  ) : (
                    // Sans réduction : afficher prix normal
                    <span className="text-2xl font-semibold text-gray-900 font-barlow">
                      {variantLoading ? '...' : formatCurrency(effectivePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. SÉLECTEUR DE COULEUR */}
              {hasColors && (
                <AttributeSelector
                  items={product.colors}
                  selectedItem={selectedColor}
                  onItemChange={setSelectedColor}
                  isItemEnabled={isColorEnabled}
                  type="color"
                />
              )}

              {/* 5. SÉLECTEUR DE POINTURE/TAILLE */}
              {hasSizes && (
                <AttributeSelector
                  items={product.sizes}
                  selectedItem={selectedSize}
                  onItemChange={setSelectedSize}
                  isItemEnabled={isSizeEnabled}
                  type="size"
                  autoDetectLabel={true}
                />
              )}

              {/* 6. SÉLECTEUR DE QUANTITÉ */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 font-barlow">
                  Quantité
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="flex items-center justify-center w-10 h-10 border border-gray-300 text-gray-600 hover:text-black hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="text-lg font-medium text-gray-900 font-barlow min-w-[3rem] text-center">
                    {Math.floor(quantity)}
                  </span>
                  
                  <button
                    onClick={() => setQuantity(Math.floor(quantity + 1))}
                    disabled={effectiveStock > 0 && quantity >= effectiveStock}
                    className="flex items-center justify-center w-10 h-10 border border-gray-300 text-gray-600 hover:text-black hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  
                  {effectiveStock > 0 && (
                    <span className="text-sm text-gray-500 font-barlow ml-4">
                      {Math.floor(effectiveStock)} en stock
                    </span>
                  )}
                </div>
              </div>

              {/* 7. BOUTON AJOUTER AU PANIER */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || (effectiveStock > 0 && quantity > effectiveStock)}
                className="w-full h-14 bg-black text-white font-barlow font-semibold text-base disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors duration-300"
              >
                {(() => {
                  if (effectiveStock > 0 && quantity > effectiveStock) return 'Stock insuffisant';
                  if (!canAddToCart) {
                    const needsColor = hasColors && !selectedColor;
                    const needsSize = hasSizes && !selectedSize;
                    
                    if (needsColor && needsSize) return 'Sélectionnez couleur et taille';
                    if (needsColor) return 'Sélectionnez une couleur';
                    if (needsSize) return 'Sélectionnez une taille';
                  }
                  return 'Ajouter au panier';
                })()} 
              </button>

              {/* 8. INFOS LIVRAISON */}
              <div className="text-sm text-gray-600 text-center font-barlow">
                Livraison rapide 24h – 48h
              </div>

              {/* 9. ACCORDÉON DESCRIPTION */}
              <ProductAccordion product={product} appSettings={appSettings} />

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
        <div className="mt-20 border-t border-gray-200 pt-16">
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>
    </div>
  );
}

export default function ProductShowWithCart({ wishlistItems, ...props }) {
  return (
    <FrontendLayout title={`${props.product.name} - ENMA SPA`} wishlistItems={wishlistItems}>
      <ProductShow {...props} />
    </FrontendLayout>
  );
}

