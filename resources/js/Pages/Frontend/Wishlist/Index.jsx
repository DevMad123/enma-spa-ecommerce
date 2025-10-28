import React, { useState } from 'react';
import FrontendLayout, { useCart } from '@/Layouts/FrontendLayout';
import { useWishlist } from '@/Contexts/WishlistContext';
import { Link, router, Head } from '@inertiajs/react';
import { 
    HeartIcon,
    ShoppingCartIcon,
    TrashIcon,
    EyeIcon,
    StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { 
    StarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon
} from '@heroicons/react/24/outline';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import { useNotification, NotificationProvider } from '@/Components/Notifications/NotificationProvider';
import { PulseButton } from '@/Components/Animations/AnimationComponents';
import ProductCard from '@/Components/Frontend/ProductCard';

const WishlistProductCard = ({ item, onRemove }) => {
    const { addToCart } = useCart();
    const { removeFromWishlist } = useWishlist();
    const { showSuccess, showError } = useNotification();
    const [isRemoving, setIsRemoving] = useState(false);

    const handleAddToCart = () => {
        addToCart(item.product, 1);
        showSuccess(`${item.product.name} ajouté au panier`, "🛒 Produit ajouté");
    };

    const handleRemove = async () => {
        if (isRemoving) return;
        
        setIsRemoving(true);
        
        try {
            // Utiliser le contexte wishlist pour la suppression optimiste
            removeFromWishlist(item.product.id);
            showSuccess(`${item.product.name} retiré de votre wishlist`, "💔 Produit retiré");
            if (onRemove) onRemove(item.product.id);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showError("Une erreur inattendue s'est produite", "Erreur technique");
        } finally {
            setIsRemoving(false);
        }
    };

    const product = item.product;
    
    return (
        <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            {/* Badge de promotion */}
            {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount_percentage}%
                    </span>
                </div>
            )}

            {/* Actions rapides */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Link
                    href={route('frontend.shop.show', product.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                    title="Voir le produit"
                >
                    <EyeIcon className="h-4 w-4 text-gray-600" />
                </Link>
                <PulseButton
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all disabled:opacity-50"
                    title="Retirer de la wishlist"
                >
                    {isRemoving ? (
                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                    ) : (
                        <TrashIcon className="h-4 w-4 text-red-600" />
                    )}
                </PulseButton>
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
                {product.category && (
                    <p className="text-sm text-amber-600 font-medium mb-2">
                        {product.category.name}
                    </p>
                )}

                {/* Nom du produit */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link 
                        href={route('frontend.shop.show', product.id)} 
                        className="hover:text-amber-600 transition-colors"
                    >
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
                            <StarIconSolid
                                key={i}
                                className={`h-4 w-4 ${
                                    i < Math.floor(product.average_rating || 0) 
                                        ? 'text-yellow-400' 
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
                            {product.current_sale_price || product.price}€
                        </span>
                        {product.price !== product.current_sale_price && (
                            <span className="ml-2 text-lg text-gray-500 line-through">
                                {product.price}€
                            </span>
                        )}
                    </div>
                    {product.stock_quantity <= 0 && (
                        <span className="text-red-600 text-sm font-medium">
                            Rupture de stock
                        </span>
                    )}
                </div>

                {/* Date d'ajout à la wishlist */}
                <p className="text-xs text-gray-500 mb-4">
                    Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity <= 0}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <ShoppingCartIcon className="h-5 w-5" />
                        <span>
                            {product.stock_quantity <= 0 ? 'Indisponible' : 'Ajouter au panier'}
                        </span>
                    </button>
                    
                    <Link
                        href={route('frontend.shop.show', product.id)}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

function WishlistContent({ wishlistItems = [], wishlistCount = 0 }) {
    const { showSuccess, showError, showWarning } = useNotification();
    const { removeFromWishlist } = useWishlist();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'price'
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(wishlistItems);
    const [removingIds, setRemovingIds] = useState(new Set());

    // Filtrage et tri des produits
    React.useEffect(() => {
        let items = [...wishlistItems];

        // Recherche
        if (searchQuery.trim()) {
            items = items.filter(item => 
                item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Tri
        switch (sortBy) {
            case 'name':
                items.sort((a, b) => a.product.name.localeCompare(b.product.name));
                break;
            case 'price':
                items.sort((a, b) => (a.product.current_sale_price || a.product.price) - (b.product.current_sale_price || b.product.price));
                break;
            case 'recent':
            default:
                items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredItems(items);
    }, [wishlistItems, searchQuery, sortBy]);

    const handleRemoveItem = (productId) => {
        setFilteredItems(prev => prev.filter(item => item.product.id !== productId));
    };

    // Suppression optimiste depuis la wishlist (et synchro locale)
    const handleRemove = (productId) => {
        if (removingIds.has(productId)) return;
        const next = new Set(removingIds); next.add(productId); setRemovingIds(next);
        try {
            removeFromWishlist(productId); // Optimistic via contexte
            setFilteredItems(prev => prev.filter(item => item.product.id !== productId));
            showSuccess('Produit retiré de votre wishlist');
        } catch (e) {
            showError("Impossible de retirer le produit", "Erreur");
        } finally {
            setRemovingIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
        }
    };

    const clearWishlist = () => {
        if (filteredItems.length === 0) {
            showWarning("Votre wishlist est déjà vide", "Liste vide");
            return;
        }
        
        if (confirm(`Êtes-vous sûr de vouloir vider votre wishlist ? Cette action supprimera ${filteredItems.length} produit${filteredItems.length > 1 ? 's' : ''}.`)) {
            router.delete(route('frontend.wishlist.clear'), {
                onSuccess: () => {
                    showSuccess(`${filteredItems.length} produit${filteredItems.length > 1 ? 's' : ''} retiré${filteredItems.length > 1 ? 's' : ''} de votre wishlist`, "🗑️ Wishlist vidée");
                    setFilteredItems([]);
                },
                onError: (errors) => {
                    console.error('Erreur lors du vidage:', errors);
                    showError("Impossible de vider votre wishlist", "Erreur");
                }
            });
        }
    };

    return (
        <>
            <Head title="Ma Wishlist" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Ma Wishlist
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    {wishlistCount === 0 
                                        ? "Votre wishlist est vide" 
                                        : `${wishlistCount} produit${wishlistCount > 1 ? 's' : ''} dans votre wishlist`
                                    }
                                </p>
                            </div>
                            
                            {wishlistItems.length > 0 && (
                                <div className="flex items-center space-x-4">
                                    <PulseButton
                                        onClick={clearWishlist}
                                        className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Vider la wishlist
                                    </PulseButton>
                                </div>
                            )}
                        </div>

                        {/* Barre de recherche et filtres */}
                        {wishlistItems.length > 0 && (
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher dans ma wishlist..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div className="flex items-center space-x-3">
                                    {/* Tri */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="recent">Plus récents</option>
                                        <option value="name">Nom A-Z</option>
                                        <option value="price">Prix croissant</option>
                                    </select>

                                    {/* Mode d'affichage */}
                                    <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-3 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}
                                        >
                                            <Squares2X2Icon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-3 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}
                                        >
                                            <ListBulletIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contenu */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <HeartIcon className="mx-auto h-24 w-24 text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchQuery.trim() 
                                    ? 'Aucun produit trouvé' 
                                    : 'Votre wishlist est vide'
                                }
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {searchQuery.trim() 
                                    ? 'Essayez avec d\'autres mots-clés ou supprimez les filtres.'
                                    : 'Découvrez nos produits et ajoutez vos favoris à votre wishlist pour les retrouver facilement.'
                                }
                            </p>
                            <Link
                                href={route('frontend.shop.index')}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all"
                            >
                                <span>Découvrir nos produits</span>
                            </Link>
                        </div>
                    ) : (
                        <div className={`
                            ${viewMode === 'grid' 
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                                : 'space-y-4'
                            }
                        `}>
                            {filteredItems.map((item) => (
                                <div key={item.id} className="relative">
                                    <ProductCard product={item.product} />
                                    <PulseButton
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.product.id); }}
                                        disabled={removingIds.has(item.product.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 hover:bg-white transition disabled:opacity-50"
                                        title="Retirer de la wishlist"
                                    >
                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                    </PulseButton>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function Wishlist({ wishlistItems, ...props }) {
    return (
        <FrontendLayout 
            title="Ma Wishlist - ENMA SPA" 
            wishlistItems={wishlistItems}
        >
            <WishlistContent wishlistItems={wishlistItems} {...props} />
        </FrontendLayout>
    );
}
