import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ShippingList from '@/Components/Shipping/ShippingList';
import ShippingModal from '@/Components/Shipping/ShippingModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Index({ auth, shippings, filters }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingShipping, setEditingShipping] = useState(null);

    const handleCreateClick = () => {
        setEditingShipping(null);
        setShowCreateModal(true);
    };

    const handleEditClick = (shipping) => {
        setEditingShipping(shipping);
        setShowCreateModal(true);
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
        setEditingShipping(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gestion des Livraisons
                    </h2>
                </div>
            }
        >
            <Head title="Méthodes de Livraison" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <ShippingList 
                            shippings={shippings}
                            filters={filters}
                            onCreateClick={handleCreateClick}
                            onEditClick={handleEditClick}
                        />
                    </div>
                </div>
            </div>

            <ShippingModal
                isOpen={showCreateModal}
                onClose={handleModalClose}
                shipping={editingShipping}
                isEdit={!!editingShipping}
            />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </AuthenticatedLayout>
    );
}