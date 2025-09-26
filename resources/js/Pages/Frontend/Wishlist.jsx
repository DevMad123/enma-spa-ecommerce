import React, { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    HeartIcon, 
    TrashIcon,
    ShoppingCartIcon,
    StarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useNotification, NotificationProvider } from '@/Components/Notifications/NotificationProvider';
import CartButton from '@/Components/Frontend/CartButton';
import WishlistButton from '@/Components/Frontend/WishlistButton';
import { HoverCard, PulseButton } from '@/Components/Animations/AnimationComponents';

const WishlistItem = ({ item, onRemove }) => {
    const { showSuccess, showError } = useNotification();
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await fetch(route('api.wishlist.destroy', item.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                }
            });
            
            showSuccess('Produit retiré de votre liste de souhaits');
            onRemove(item.id);
        } catch (error) {
            showError('Erreur lors de la suppression');
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <HoverCard className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
            <div className="relative">
                {/* Image du produit */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                    <img
                        src={item.product.main_image || '/images/product-placeholder.jpg'}
                        alt={item.product.name}
                        className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                {/* Bouton de suppression */}
                <PulseButton
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                    title="Retirer de la wishlist"
                >
                    {isRemoving ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <TrashIcon className="h-4 w-4" />
                    )}
                </PulseButton>

                {/* Badge de réduction */}
                {item.product.discount_percentage > 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -{item.product.discount_percentage}%
                        </span>
                    </div>
                )}
            </div>

            {/* Contenu */}
            <div className="p-4">
                {/* Nom et lien */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link 
                        href={route('frontend.products.show', item.product.slug)}
                        className="hover:text-amber-600 transition-colors duration-200"
                    >
                        {item.product.name}
                    </Link>
                </h3>

                {/* Évaluations */}
                <div className="flex items-center mb-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(item.product.average_rating || 4.5) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                        ({item.product.reviews_count || 0})
                    </span>
                </div>

                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-xl font-bold text-gray-900">
                            {item.product.current_sale_price}€
                        </span>
                        {item.product.price > item.product.current_sale_price && (
                            <span className="ml-2 text-base text-gray-500 line-through">
                                {item.product.price}€
                            </span>
                        )}
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-2">
                    <CartButton 
                        product={item.product} 
                        className="w-full"
                        variant="primary"
                    />
                    
                    <Link
                        href={route('frontend.products.show', item.product.slug)}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                    >
                        Voir les détails
                    </Link>
                </div>

                {/* Date d'ajout */}
                <p className="text-xs text-gray-500 mt-3 text-center">
                    Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </p>
            </div>
        </HoverCard>
    );
};

function WishlistContent({ wishlistItems = [] }) {
    const [items, setItems] = useState(wishlistItems);
    const { showSuccess, showInfo } = useNotification();

    const handleRemoveItem = (itemId) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleClearAll = async () => {
        if (!confirm('Êtes-vous sûr de vouloir vider votre liste de souhaits ?')) {
            return;
        }

        try {
            await fetch(route('api.wishlist.clear'), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                }
            });
            
            setItems([]);
            showSuccess('Liste de souhaits vidée');
        } catch (error) {
            showError('Erreur lors du vidage de la liste');
        }
    };

    if (items.length === 0) {
        return (
            <FrontendLayout>
                <Head title="Ma Liste de Souhaits - ENMA SPA" />
                
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* En-tête */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Ma Liste de Souhaits
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Gardez vos produits favoris à portée de main
                            </p>
                        </div>

                        {/* État vide */}
                        <div className="text-center py-12">
                            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <HeartIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Votre liste de souhaits est vide
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Découvrez nos produits et ajoutez vos favoris !
                            </p>
                            <Link
                                href={route('frontend.shop.index')}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                            >
                                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                Découvrir la boutique
                            </Link>
                        </div>
                    </div>
                </div>
            </FrontendLayout>
        );
    }

    return (
        <FrontendLayout>
            <Head title={`Ma Liste de Souhaits (${items.length}) - ENMA SPA`} />
            
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Ma Liste de Souhaits
                            </h1>
                            <p className="text-gray-600">
                                {items.length} produit{items.length > 1 ? 's' : ''} dans votre liste
                            </p>
                        </div>
                        
                        {items.length > 0 && (
                            <div className="mt-4 sm:mt-0">
                                <PulseButton
                                    onClick={handleClearAll}
                                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-200"
                                >
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Vider la liste
                                </PulseButton>
                            </div>
                        )}
                    </div>

                    {/* Grille des produits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <WishlistItem
                                key={item.id}
                                item={item}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    {/* Suggestions */}
                    <div className="mt-16 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Continuez vos achats
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Découvrez d'autres produits qui pourraient vous plaire
                        </p>
                        <Link
                            href={route('frontend.shop.index')}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                        >
                            <ShoppingCartIcon className="h-5 w-5 mr-2" />
                            Retour à la boutique
                        </Link>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}

export default function Wishlist(props) {
    return (
        <NotificationProvider>
            <WishlistContent {...props} />
        </NotificationProvider>
    );
}