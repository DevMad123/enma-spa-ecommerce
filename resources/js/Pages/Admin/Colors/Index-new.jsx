import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { 
    PlusIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    SwatchIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import ColorModal from "./ColorModal";

export default function Index({ colorList, filters, flash }) {
    const [showColorModal, setShowColorModal] = useState(false);
    const [editingColor, setEditingColor] = useState(null);

    const handleBulkAction = (action, selectedIds) => {
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins une couleur.');
            return;
        }

        if (action === 'delete') {
            if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} couleur(s) ?`)) {
                router.post(route('admin.colors.bulk-delete'), {
                    ids: selectedIds
                });
            }
        } else if (action === 'export') {
            window.location.href = route('admin.colors.export', { ids: selectedIds.join(',') });
        }
    };

    const handleDelete = (colorId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) {
            router.delete(route('admin.colors.deleteColors', colorId));
        }
    };

    const handleEdit = (color) => {
        setEditingColor(color);
        setShowColorModal(true);
    };

    // Configuration des colonnes
    const columns = [
        {
            key: 'color_preview',
            label: 'Couleur',
            render: (color) => (
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 border border-gray-300 rounded shadow-sm"
                        style={{
                            backgroundColor: color.color_code || "#e5e7eb",
                        }}
                        title={color.color_code || "No color code"}
                    ></div>
                </div>
            )
        },
        {
            key: 'name',
            label: 'Nom',
            render: (color) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{color.name}</div>
                </div>
            )
        },
        {
            key: 'color_code',
            label: 'Code couleur',
            render: (color) => (
                <div>
                    {color.color_code ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {color.color_code}
                        </span>
                    ) : (
                        <span className="text-gray-400">N/A</span>
                    )}
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Date de création',
            render: (color) => (
                <span className="text-sm text-gray-500">
                    {color.created_at ? new Date(color.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) : "N/A"}
                </span>
            )
        },
        {
            key: 'products_count',
            label: 'Produits',
            render: (color) => (
                <span className="text-sm text-gray-500">
                    {color.products_count || 0} produit{(color.products_count || 0) > 1 ? 's' : ''}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (color) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(color)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Modifier"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(color.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    // Configuration des actions groupées
    const bulkActions = [
        {
            label: 'Supprimer',
            value: 'delete',
            icon: TrashIcon,
            className: 'bg-red-600 text-white hover:bg-red-700'
        },
        {
            label: 'Exporter',
            value: 'export',
            icon: EyeIcon,
            className: 'bg-green-600 text-white hover:bg-green-700'
        }
    ];

    const searchableFields = ['name', 'color_code'];

    return (
        <AdminLayout>
            <Head title="Couleurs" />

            <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Couleurs</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez les couleurs de produits
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex-none">
                        <button
                            onClick={() => setShowColorModal(true)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouvelle couleur
                        </button>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">{flash.success}</div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{flash.error}</div>
                    </div>
                )}
            </div>

            {/* DataTable */}
            <DataTable
                data={Array.isArray(colorList) ? colorList : (colorList?.data || [])}
                columns={columns}
                bulkActions={bulkActions}
                searchableFields={searchableFields}
                onBulkAction={handleBulkAction}
                searchPlaceholder="Rechercher par nom ou code couleur..."
                pagination={colorList?.links ? {
                    from: colorList.from,
                    to: colorList.to,
                    total: colorList.total,
                    links: colorList.links
                } : null}
            />

            {/* Modal ColorModal */}
            {showColorModal && (
                <ColorModal
                    open={showColorModal}
                    onClose={() => {
                        setShowColorModal(false);
                        setEditingColor(null);
                    }}
                    mode={editingColor ? "edit" : "create"}
                    color={editingColor}
                />
            )}
        </AdminLayout>
    );
}