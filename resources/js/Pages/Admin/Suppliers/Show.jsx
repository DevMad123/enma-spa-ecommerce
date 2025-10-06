import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    TrashIcon,
    BuildingOfficeIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    PhotoIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarDaysIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';

export default function ShowSupplier({ supplier, title }) {
    const handleEdit = () => {
        router.get(route('admin.suppliers.edit', supplier.id));
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            router.delete(route('admin.suppliers.destroy', supplier.id));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    };

    return (
        <AdminLayout>
            <Head title={title} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.suppliers.index')}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {supplier.supplier_name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {supplier.company_name && `${supplier.company_name} • `}
                                Fournisseur ID #{supplier.id}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleEdit}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Modifier
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Supprimer
                        </button>
                    </div>
                </div>

                {/* Statut */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Logo */}
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {supplier.image ? (
                                    <img
                                        src={`/${supplier.image}`}
                                        alt={supplier.supplier_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {supplier.supplier_name}
                                </h2>
                                {supplier.company_name && (
                                    <p className="text-gray-600">{supplier.company_name}</p>
                                )}
                                <div className="flex items-center mt-2">
                                    {supplier.status ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                                            Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <XCircleIcon className="w-4 h-4 mr-1" />
                                            Inactif
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-center mb-2">
                                    <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {supplier.products_count || 0}
                                </div>
                                <div className="text-sm text-blue-800">Produits</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center justify-center mb-2">
                                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(supplier.previous_due)}
                                </div>
                                <div className="text-sm text-green-800">Solde</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations du contact */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                                <UserIcon className="w-5 h-5 mr-2" />
                                Informations du contact
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nom du contact</label>
                                    <p className="text-gray-900 mt-1">{supplier.supplier_name}</p>
                                </div>

                                {supplier.supplier_email && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900 mt-1 flex items-center">
                                            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            <a href={`mailto:${supplier.supplier_email}`} className="text-blue-600 hover:text-blue-800">
                                                {supplier.supplier_email}
                                            </a>
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Téléphone principal</label>
                                    <p className="text-gray-900 mt-1 flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        <a href={`tel:${supplier.supplier_phone_one}`} className="text-blue-600 hover:text-blue-800">
                                            {supplier.supplier_phone_one}
                                        </a>
                                    </p>
                                </div>

                                {supplier.supplier_phone_two && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Téléphone secondaire</label>
                                        <p className="text-gray-900 mt-1 flex items-center">
                                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            <a href={`tel:${supplier.supplier_phone_two}`} className="text-blue-600 hover:text-blue-800">
                                                {supplier.supplier_phone_two}
                                            </a>
                                        </p>
                                    </div>
                                )}

                                {supplier.supplier_address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Adresse personnelle</label>
                                        <p className="text-gray-900 mt-1 flex items-start">
                                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                            {supplier.supplier_address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informations de l'entreprise */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                                Informations de l'entreprise
                            </h3>
                            
                            <div className="space-y-4">
                                {supplier.company_name && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nom de l'entreprise</label>
                                        <p className="text-gray-900 mt-1">{supplier.company_name}</p>
                                    </div>
                                )}

                                {supplier.company_email && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email de l'entreprise</label>
                                        <p className="text-gray-900 mt-1 flex items-center">
                                            <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            <a href={`mailto:${supplier.company_email}`} className="text-blue-600 hover:text-blue-800">
                                                {supplier.company_email}
                                            </a>
                                        </p>
                                    </div>
                                )}

                                {supplier.company_phone && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Téléphone de l'entreprise</label>
                                        <p className="text-gray-900 mt-1 flex items-center">
                                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            <a href={`tel:${supplier.company_phone}`} className="text-blue-600 hover:text-blue-800">
                                                {supplier.company_phone}
                                            </a>
                                        </p>
                                    </div>
                                )}

                                {supplier.company_address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Adresse de l'entreprise</label>
                                        <p className="text-gray-900 mt-1 flex items-start">
                                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                            {supplier.company_address}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Solde précédent</label>
                                    <p className="text-gray-900 mt-1 flex items-center">
                                        <CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        {formatCurrency(supplier.previous_due)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations système */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                            <CalendarDaysIcon className="w-5 h-5 mr-2" />
                            Informations système
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de création</label>
                                <p className="text-gray-900 mt-1">
                                    {supplier.created_at ? formatDate(supplier.created_at) : 'Non disponible'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                                <p className="text-gray-900 mt-1">
                                    {supplier.updated_at ? formatDate(supplier.updated_at) : 'Non disponible'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Produits associés */}
                {supplier.products && supplier.products.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                                <ShoppingBagIcon className="w-5 h-5 mr-2" />
                                Produits associés ({supplier.products_count})
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {supplier.products.slice(0, 6).map((product) => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {product.category?.name} • {product.brand?.name}
                                        </p>
                                        <p className="text-sm font-medium text-blue-600 mt-2">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            {supplier.products_count > 6 && (
                                <div className="mt-4 text-center">
                                    <Link
                                        href={route('admin.products.index', { supplier: supplier.id })}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Voir tous les produits ({supplier.products_count})
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}