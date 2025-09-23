import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineFilter
} from "react-icons/hi";
import AdminLayout from "@/Layouts/AdminLayout";
import CustomerModal from "./CustomerModal";

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

function CustomersHeader({ filters, onFilterChange, onAddCustomer, onExport }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Customer Management</h1>
        <p className="text-gray-600 mt-1">Manage your e-commerce customers</p>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        {/* Recherche */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent text-sm"
          />
        </div>

        {/* Filtre par statut */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#a68e55] focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>

        {/* Nombre par page */}
        <select
          value={filters.perPage || 15}
          onChange={(e) => onFilterChange({ perPage: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#a68e55] focus:border-transparent"
        >
          {PER_PAGE_OPTIONS.map(option => (
            <option key={option} value={option}>{option} per page</option>
          ))}
        </select>

        {/* Export */}
        <button
          onClick={onExport}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
          title="Export to CSV"
        >
          <HiOutlineDownload className="text-lg" />
          Export
        </button>

        {/* Ajouter */}
        <button
          onClick={onAddCustomer}
          className="bg-[#a68e55] hover:bg-[#8c6c3c] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
        >
          <HiOutlinePlus className="text-lg" />
          Add Customer
        </button>
      </div>
    </header>
  );
}

function CustomersTable({ customers, onView, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Customer</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Contact</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Orders</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Total Spent</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Last Order</th>
              <th className="text-center py-4 px-6 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <HiOutlineSearch className="text-2xl text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">No customers found</p>
                    <p className="text-sm">Start by adding your first customer</p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.data.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={customer.image_url}
                          alt={customer.full_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/front/imgs/default-user.png';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.full_name}</p>
                        <p className="text-sm text-gray-600">ID: #{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-gray-900">{customer.email}</p>
                      {customer.phone_one && (
                        <p className="text-sm text-gray-600">{customer.phone_one}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900 font-medium">{customer.total_orders || 0}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(customer.total_amount)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">
                      {formatDate(customer.last_order_date)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(customer)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="View customer details"
                      >
                        <HiOutlineEye className="text-lg" />
                      </button>
                      <button
                        onClick={() => onEdit(customer)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                        title="Edit customer"
                      >
                        <HiOutlinePencil className="text-lg" />
                      </button>
                      <button
                        onClick={() => onDelete(customer)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Delete customer"
                      >
                        <HiOutlineTrash className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {customers.data.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {customers.from} to {customers.to} of {customers.total} customers
            </div>
            <div className="flex items-center gap-2">
              {customers.links.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => link.url && router.get(link.url)}
                  disabled={!link.url}
                  className={`px-3 py-1 rounded text-sm ${
                    link.active
                      ? 'bg-[#a68e55] text-white'
                      : link.url
                      ? 'bg-white text-gray-700 hover:bg-gray-100 border'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomersList() {
  const { customerList, filters, flash = {} } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Gestion des filtres
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Nettoyer les filtres vides
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === '' || updatedFilters[key] === null) {
        delete updatedFilters[key];
      }
    });

    router.get(route("admin.customers.index"), updatedFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleAddCustomer = () => {
    setModalMode("create");
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleViewCustomer = (customer) => {
    router.get(route("admin.customers.show", customer.id));
  };

  const handleEditCustomer = (customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      router.delete(route("admin.customers.destroy", customerToDelete.id), {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setCustomerToDelete(null);
        },
      });
    }
  };

  const handleExport = () => {
    const exportUrl = route("admin.customers.export");
    const params = new URLSearchParams(filters).toString();
    window.open(`${exportUrl}?${params}`, '_blank');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Messages flash */}
        {flash?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {flash.success}
          </div>
        )}
        
        {flash?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {flash.error}
          </div>
        )}

        {/* Header */}
        <CustomersHeader
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddCustomer={handleAddCustomer}
          onExport={handleExport}
        />

        {/* Table */}
        <CustomersTable
          customers={customerList}
          onView={handleViewCustomer}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />

        {/* Modal Customer */}
        <CustomerModal
          open={modalOpen}
          onClose={handleCloseModal}
          mode={modalMode}
          customer={selectedCustomer}
        />

        {/* Modal de confirmation de suppression */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete customer "{customerToDelete?.full_name}"? 
                {customerToDelete?.total_orders > 0 && (
                  <span className="block mt-2 text-amber-600">
                    This customer has {customerToDelete.total_orders} order(s). The customer will be deactivated instead of permanently deleted.
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}