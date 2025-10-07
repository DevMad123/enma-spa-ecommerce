import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ShowCustomer({ customer }) {
    return (
        <AdminLayout>
            <Head title="Détails du client" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {customer.first_name} {customer.last_name}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Détails du client
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.customers.index')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Retour
                        </Link>
                        <Link
                            href={route('admin.customers.edit', customer.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Modifier
                        </Link>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Informations du client
                        </h3>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {customer.first_name} {customer.last_name}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {customer.email}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Téléphone principal</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {customer.phone_one}
                                </dd>
                            </div>
                            {customer.phone_two && (
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Téléphone secondaire</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {customer.phone_two}
                                    </dd>
                                </div>
                            )}
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Adresse actuelle</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {customer.present_address}
                                </dd>
                            </div>
                            {customer.permanent_address && (
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Adresse permanente</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {customer.permanent_address}
                                    </dd>
                                </div>
                            )}
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <span className={
                                        (customer.status === 1 || customer.status === true || customer.status === '1') 
                                            ? 'bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' 
                                            : 'bg-red-100 text-red-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                                    }>
                                        {(customer.status === 1 || customer.status === true || customer.status === '1') ? 'Actif' : 'Inactif'}
                                    </span>
                                </dd>
                            </div>
                            {customer.image && (
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Photo</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <img 
                                            src={"/storage/" + customer.image} 
                                            alt="Photo du client"
                                            className="h-20 w-20 object-cover rounded-full"
                                        />
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}