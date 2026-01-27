import React, { useState, useEffect } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    UserIcon,
    ShoppingBagIcon,
    HeartIcon,
    CogIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navigation = [
        {
            name: 'Profil',
            id: 'profile',
            icon: UserIcon,
            description: 'Informations personnelles'
        },
        {
            name: 'Mes commandes',
            id: 'orders',
            icon: ShoppingBagIcon,
            description: 'Historique des achats'
        },
        {
            name: 'Liste de souhaits',
            id: 'wishlist',
            icon: HeartIcon,
            description: 'Produits favoris'
        },
        {
            name: 'Paramètres',
            id: 'settings',
            icon: CogIcon,
            description: 'Préférences du compte'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <nav className="space-y-2">
                {navigation.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                            w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                            ${activeTab === item.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <item.icon className="h-5 w-5" />
                        <div>
                            <div className="font-medium">{item.name}</div>
                            <div className={`text-xs ${activeTab === item.id ? 'text-amber-100' : 'text-gray-500'}`}>
                                {item.description}
                            </div>
                        </div>
                    </button>
                ))}
            </nav>
        </div>
    );
};

const ProfileTab = ({ user, customer }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: customer?.phone || '',
        birth_date: customer?.birth_date || '',
        address: customer?.address || '',
        address_2: customer?.address_2 || '',
        city: customer?.city || '',
        postal_code: customer?.postal_code || '',
        country: customer?.country || 'Côte d\'Ivoire',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('frontend.profile.update'), {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`
                        px-4 py-2 rounded-lg font-medium transition-all duration-200
                        ${isEditing
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                        }
                    `}
                >
                    {isEditing ? 'Annuler' : 'Modifier'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={!isEditing}
                            className={`
                                w-full px-4 py-3 border rounded-lg transition-colors
                                ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                }
                            `}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={!isEditing}
                            className={`
                                w-full px-4 py-3 border rounded-lg transition-colors
                                ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                }
                            `}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={!isEditing}
                            className={`
                                w-full px-4 py-3 border rounded-lg transition-colors
                                ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                }
                            `}
                            placeholder="+33 1 23 45 67 89"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                        <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Date de naissance
                        </label>
                        <input
                            type="date"
                            id="birth_date"
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                            disabled={!isEditing}
                            className={`
                                w-full px-4 py-3 border rounded-lg transition-colors
                                ${isEditing
                                    ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                }
                            `}
                        />
                        {errors.birth_date && <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>}
                    </div>
                </div>

                {/* Adresse */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse
                            </label>
                            <input
                                type="text"
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                disabled={!isEditing}
                                className={`
                                    w-full px-4 py-3 border rounded-lg transition-colors
                                    ${isEditing
                                        ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                        : 'border-gray-200 bg-gray-50 text-gray-600'
                                    }
                                `}
                                placeholder="Numéro et nom de rue"
                            />
                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                        </div>

                        <div>
                            <label htmlFor="address_2" className="block text-sm font-medium text-gray-700 mb-2">
                                Complément d'adresse
                            </label>
                            <input
                                type="text"
                                id="address_2"
                                value={data.address_2}
                                onChange={(e) => setData('address_2', e.target.value)}
                                disabled={!isEditing}
                                className={`
                                    w-full px-4 py-3 border rounded-lg transition-colors
                                    ${isEditing
                                        ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                        : 'border-gray-200 bg-gray-50 text-gray-600'
                                    }
                                `}
                                placeholder="Appartement, étage, bâtiment..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    disabled={!isEditing}
                                    className={`
                                        w-full px-4 py-3 border rounded-lg transition-colors
                                        ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                            : 'border-gray-200 bg-gray-50 text-gray-600'
                                        }
                                    `}
                                />
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                            </div>

                            <div>
                                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Code postal
                                </label>
                                <input
                                    type="text"
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    disabled={!isEditing}
                                    className={`
                                        w-full px-4 py-3 border rounded-lg transition-colors
                                        ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                            : 'border-gray-200 bg-gray-50 text-gray-600'
                                        }
                                    `}
                                />
                                {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pays
                                </label>
                                <select
                                    id="country"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    disabled={!isEditing}
                                    className={`
                                        w-full px-4 py-3 border rounded-lg transition-colors
                                        ${isEditing
                                            ? 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                                            : 'border-gray-200 bg-gray-50 text-gray-600'
                                        }
                                    `}
                                >
                                    <option value="CI">Côte d'Ivoire</option>
                                    <option value="Belgique">Belgique</option>
                                    <option value="Suisse">Suisse</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span>Enregistrer</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                reset();
                            }}
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

const OrdersTab = ({ orders = [] }) => {
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'processing': 'text-blue-600 bg-blue-50 border-blue-200',
            'shipped': 'text-purple-600 bg-purple-50 border-purple-200',
            'delivered': 'text-green-600 bg-green-50 border-green-200',
            'cancelled': 'text-red-600 bg-red-50 border-red-200'
        };
        return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'En attente',
            'processing': 'En cours',
            'shipped': 'Expédiée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return labels[status] || status;
    };

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                    <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
                    <Link
                        href={route('frontend.shop.index')}
                        className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                    >
                        Découvrir la boutique
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Mes Commandes</h2>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Commande #{order.order_number}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR')} • {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`
                                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                                    ${getStatusColor(order.status)}
                                `}>
                                    {getStatusLabel(order.status)}
                                </div>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                    {order.total}€
                                </p>
                            </div>
                        </div>

                        {/* Articles de la commande */}
                        {order.items && order.items.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {order.items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <img
                                            src={item.product_image || '/images/placeholder.jpg'}
                                            alt={item.product_name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Quantité: {item.quantity} • {item.price}€
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 2 && (
                                    <p className="text-sm text-gray-500">
                                        +{order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''} article{order.items.length - 2 > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                <span>Livraison: </span>
                                <span className="font-medium">
                                    {order.shipping_method?.name || 'Standard'}
                                </span>
                            </div>

                            <div className="flex space-x-3">
                                <Link
                                    href={route('frontend.profile.order', order.id)}
                                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                                >
                                    Voir détails
                                </Link>

                                {order.status === 'delivered' && (
                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                        Laisser un avis
                                    </button>
                                )}

                                {['pending', 'processing'].includes(order.status) && (
                                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WishlistTab = ({ wishlistItems = [] }) => {
    if (wishlistItems.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                    <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Liste de souhaits vide</h3>
                    <p className="text-gray-600 mb-6">Ajoutez des produits à votre liste de souhaits pour les retrouver facilement.</p>
                    <Link
                        href={route('frontend.shop.index')}
                        className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                    >
                        Découvrir la boutique
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Ma Liste de Souhaits</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                            <img
                                src={item.product.image || '/images/placeholder.jpg'}
                                alt={item.product.name}
                                className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                <Link href={route('frontend.shop.show', item.product.id)} className="hover:text-amber-600">
                                    {item.product.name}
                                </Link>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">
                                    {item.product.current_sale_price}€
                                </span>
                                <div className="flex space-x-2">
                                    <button className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200">
                                        <ShoppingBagIcon className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                                        <HeartIcon className="h-4 w-4 fill-current" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsTab = ({ user }) => {
    const [notifications, setNotifications] = useState({
        email_marketing: true,
        email_orders: true,
        sms_marketing: false,
        sms_orders: true
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Paramètres du Compte</h2>

            <div className="space-y-8">
                {/* Notifications */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <span className="font-medium text-gray-900">Emails marketing</span>
                                <p className="text-sm text-gray-600">Recevez nos offres et nouveautés par email</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.email_marketing}
                                onChange={(e) => setNotifications(prev => ({...prev, email_marketing: e.target.checked}))}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <span className="font-medium text-gray-900">Emails de commande</span>
                                <p className="text-sm text-gray-600">Notifications importantes sur vos commandes</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.email_orders}
                                onChange={(e) => setNotifications(prev => ({...prev, email_orders: e.target.checked}))}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <span className="font-medium text-gray-900">SMS marketing</span>
                                <p className="text-sm text-gray-600">Offres exclusives par SMS</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.sms_marketing}
                                onChange={(e) => setNotifications(prev => ({...prev, sms_marketing: e.target.checked}))}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <span className="font-medium text-gray-900">SMS de commande</span>
                                <p className="text-sm text-gray-600">Suivi de livraison par SMS</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.sms_orders}
                                onChange={(e) => setNotifications(prev => ({...prev, sms_orders: e.target.checked}))}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Sécurité */}
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
                    <div className="space-y-4">
                        <Link
                            href={route('password.request')}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <span className="font-medium text-gray-900">Changer de mot de passe</span>
                                <p className="text-sm text-gray-600">Dernière modification: Il y a 3 mois</p>
                            </div>
                            <span className="text-amber-600 font-medium">Modifier</span>
                        </Link>
                    </div>
                </div>

                {/* Actions du compte */}
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions du compte</h3>
                    <div className="space-y-4">
                        <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
                            <div>
                                <span className="font-medium text-gray-900">Télécharger mes données</span>
                                <p className="text-sm text-gray-600">Exportez toutes vos données personnelles</p>
                            </div>
                            <span className="text-blue-600 font-medium">Télécharger</span>
                        </button>

                        <button className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-full text-left">
                            <div>
                                <span className="font-medium text-red-900">Supprimer mon compte</span>
                                <p className="text-sm text-red-600">Cette action est irréversible</p>
                            </div>
                            <span className="text-red-600 font-medium">Supprimer</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Profile({ orders = [], wishlistItems = [], customer = null }) {
    const { auth } = usePage().props;

    // Détecter l'onglet à partir de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);

    // Mettre à jour l'URL quand l'onglet change
    useEffect(() => {
        const url = new URL(window.location);
        if (activeTab === 'profile') {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', activeTab);
        }
        window.history.replaceState({}, '', url);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab user={auth.user} customer={customer} />;
            case 'orders':
                return <OrdersTab orders={orders} />;
            case 'wishlist':
                return <WishlistTab wishlistItems={wishlistItems} />;
            case 'settings':
                return <SettingsTab user={auth.user} />;
            default:
                return <ProfileTab user={auth.user} customer={customer} />;
        }
    };

    return (
        <FrontendLayout title="Mon Profil">
            <div className="EecDefaultWidth px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bonjour, {auth.user.name} !
                    </h1>
                    <p className="text-gray-600">
                        Gérez votre compte et suivez vos commandes
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mt-8 lg:mt-0 lg:col-span-3">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
