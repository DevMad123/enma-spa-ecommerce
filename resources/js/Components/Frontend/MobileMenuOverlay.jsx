import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
    XMarkIcon, 
    ChevronLeftIcon,
    ChevronRightIcon 
} from '@heroicons/react/24/outline';

/**
 * MobileMenuOverlay - Menu mobile premium plein écran
 * 
 * Fonctionnalités :
 * - Navigation hiérarchique multi-niveaux
 * - Historique de navigation (stack)
 * - Images pour toutes les catégories
 * - Animations fluides
 * - Body scroll lock
 */

const MobileMenuOverlay = ({ 
    isOpen, 
    onClose, 
    categories = [], 
    appName = 'ENMA SPA',
    appSettings = {}
}) => {
    // État de navigation
    const [navigationStack, setNavigationStack] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Debug: afficher les catégories reçues
    useEffect(() => {
        if (isOpen) {
            console.log('📦 Categories received:', categories);
            console.log('📦 Categories length:', categories?.length);
        }
    }, [isOpen, categories]);

    // Construit l'arbre des catégories à partir des données plates
    const buildCategoryTree = (categories) => {
        if (!Array.isArray(categories) || categories.length === 0) {
            console.warn('⚠️ No categories or invalid format:', categories);
            return [];
        }

        // Si les catégories ont déjà une structure avec children (API retourne déjà l'arbre)
        // On retourne directement les catégories racines
        const hasChildrenProperty = categories.some(cat => 'children' in cat);
        if (hasChildrenProperty) {
            console.log('✅ Categories already have tree structure');
            return categories;
        }

        // Sinon, construire l'arbre manuellement
        console.log('🔨 Building tree manually');
        const activeCategories = categories.filter(cat => cat.status !== false);
        const categoryMap = {};
        const rootCategories = [];

        // Créer un map de toutes les catégories
        activeCategories.forEach(cat => {
            categoryMap[cat.id] = {
                ...cat,
                children: []
            };
        });

        // Construire l'arbre
        activeCategories.forEach(cat => {
            if (cat.parent_id && categoryMap[cat.parent_id]) {
                categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
            } else {
                rootCategories.push(categoryMap[cat.id]);
            }
        });

        console.log('🌳 Root categories:', rootCategories);
        return rootCategories;
    };

    const categoryTree = buildCategoryTree(categories);

    // Gestion du body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Initialiser au niveau racine
            setCurrentLevel({
                title: 'Menu',
                items: categoryTree
            });
            setNavigationStack([]);
        } else {
            document.body.style.overflow = '';
            setCurrentLevel(null);
            setNavigationStack([]);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, categoryTree]);

    // Navigation vers un sous-niveau
    const navigateToCategory = (category) => {
        if (!category.children || category.children.length === 0) {
            // C'est une catégorie finale, on navigue vers la page
            window.location.href = route('frontend.shop.category', category.id);
            return;
        }

        setIsAnimating(true);
        
        // Ajouter le niveau actuel à la stack
        setNavigationStack([...navigationStack, currentLevel]);
        
        // Naviguer vers le nouveau niveau
        setTimeout(() => {
            setCurrentLevel({
                title: category.name,
                items: category.children,
                categoryId: category.id
            });
            setIsAnimating(false);
        }, 150);
    };

    // Retour au niveau précédent
    const navigateBack = () => {
        if (navigationStack.length === 0) return;

        setIsAnimating(true);
        
        const previousLevel = navigationStack[navigationStack.length - 1];
        const newStack = navigationStack.slice(0, -1);
        
        setTimeout(() => {
            setCurrentLevel(previousLevel);
            setNavigationStack(newStack);
            setIsAnimating(false);
        }, 150);
    };

    // Obtenir l'image de la catégorie
    const getCategoryImage = (category) => {
        // L'API retourne déjà l'image complète avec asset()
        if (category.image) {
            return category.image;
        }
        return '/images/category-placeholder.jpg';
    };

    // Gestion du swipe pour fermer
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        
        // Swipe vers la gauche = fermer le menu
        if (isLeftSwipe) {
            onClose();
        }
        
        setTouchStart(null);
        setTouchEnd(null);
    };

    if (!isOpen) return null;

    const isRootLevel = navigationStack.length === 0;

    return (
        <div 
            className="fixed inset-0 z-[9997] md:hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Overlay plein écran */}
            <div 
                className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header fixe */}
                <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-10 flex items-center justify-between px-4">
                    {/* Bouton retour (visible uniquement si pas au niveau racine) */}
                    <button
                        onClick={navigateBack}
                        className={`p-2 -ml-2 transition-opacity ${
                            isRootLevel ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                        aria-label="Retour"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
                    </button>

                    {/* Logo centré */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        {appSettings?.logo ? (
                            <img 
                                src={appSettings.logo} 
                                alt={appName}
                                className="h-8 w-auto"
                            />
                        ) : (
                            <span className="text-xl font-bold text-gray-900">
                                {appName}
                            </span>
                        )}
                    </div>

                    {/* Bouton fermeture */}
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2"
                        aria-label="Fermer le menu"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-900" />
                    </button>
                </div>

                {/* Zone de contenu scrollable */}
                <div className="pt-16 pb-24 h-full overflow-y-auto">
                    <div 
                        className={`transition-opacity duration-150 ${
                            isAnimating ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                        {currentLevel && (
                            <div className="px-4 py-6">
                                {/* Titre du niveau (si pas racine) */}
                                {!isRootLevel && currentLevel.title && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {currentLevel.title}
                                        </h2>
                                        {currentLevel.categoryId && (
                                            <Link
                                                href={route('frontend.shop.category', currentLevel.categoryId)}
                                                className="inline-block mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                                            >
                                                Voir tous les produits
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* Liste des catégories/sous-catégories */}
                                <div className="space-y-2">
                                    {currentLevel.items && currentLevel.items.length > 0 ? (
                                        currentLevel.items.map((item) => {
                                            const hasChildren = item.children && item.children.length > 0;
                                            
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => navigateToCategory(item)}
                                                    className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                                                >
                                                    {/* Image de la catégorie */}
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={getCategoryImage(item)}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                            loading="lazy"
                                                        />
                                                    </div>

                                                    {/* Nom de la catégorie */}
                                                    <div className="flex-1 text-left">
                                                        <h3 className="text-base font-semibold text-gray-900">
                                                            {item.name}
                                                        </h3>
                                                        {item.children && item.children.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {item.children.length} sous-catégorie{item.children.length > 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Flèche si a des enfants */}
                                                    {hasChildren && (
                                                        <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">Aucune catégorie disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMenuOverlay;
