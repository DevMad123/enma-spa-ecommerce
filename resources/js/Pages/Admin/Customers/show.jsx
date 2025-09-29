import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

export default function CustomerShow() {
  const { customer, stats, orders, filters, flash = {} } = usePage().props;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    router.get(route('admin.customers.index'));
  };

  const handleEdit = () => {
    router.get(route('admin.customers.index'), {}, {
      onSuccess: () => {
        // Ouvrir le modal d'édition après redirection
        window.dispatchEvent(new CustomEvent('openEditCustomerModal', {
          detail: { customer }
        }));
      }
    });
  };

  const handleDelete = () => {
    router.delete(route('admin.customers.destroy', customer.id), {
      onSuccess: () => {
        router.get(route('admin.customers.index'));
      }
    });
    setDeleteModalOpen(false);
  };

  const handleOrderFilter = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === '' || updatedFilters[key] === null) {
        delete updatedFilters[key];
      }
    });

    router.get(route('admin.customers.show', customer.id), updatedFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <HiOutlineArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
              <p className="text-gray-600">Manage customer information and order history</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <HiOutlinePencil className="text-lg" />
              Edit
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <HiOutlineTrash className="text-lg" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche - Informations client */}
          <div className="lg:col-span-1">
            
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden mx-auto mb-4">
                  <img
                    src={customer.image_url}
                    alt={customer.full_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/front/imgs/default-user.png';
                    }}
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {customer.full_name}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.status === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.status === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <HiOutlineMail className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{customer.email}</p>
                  </div>
                </div>

                {customer.phone_one && (
                  <div className="flex items-center gap-3">
                    <HiOutlinePhone className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Primary Phone</p>
                      <p className="text-gray-900">{customer.phone_one}</p>
                    </div>
                  </div>
                )}

                {customer.phone_two && (
                  <div className="flex items-center gap-3">
                    <HiOutlinePhone className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Secondary Phone</p>
                      <p className="text-gray-900">{customer.phone_two}</p>
                    </div>
                  </div>
                )}

                {customer.present_address && (
                  <div className="flex items-start gap-3">
                    <HiOutlineLocationMarker className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Present Address</p>
                      <p className="text-gray-900">{customer.present_address}</p>
                    </div>
                  </div>
                )}

                {customer.permanent_address && customer.permanent_address !== customer.present_address && (
                  <div className="flex items-start gap-3">
                    <HiOutlineLocationMarker className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Permanent Address</p>
                      <p className="text-gray-900">{customer.permanent_address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <HiOutlineCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="text-gray-900">{formatDate(customer.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <HiOutlineShoppingCart className="text-blue-600 text-2xl mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{stats.total_orders}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <HiOutlineCurrencyDollar className="text-green-600 text-2xl mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats.total_amount)}</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                
                <div className="col-span-2 text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.average_order_value)}</p>
                  <p className="text-sm text-gray-600">Average Order Value</p>
                </div>
              </div>

              {stats.last_order_date && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Last Order</p>
                  <p className="text-gray-900">{formatDate(stats.last_order_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Historique des commandes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              
              {/* Header des commandes */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm">
                    <HiOutlineDownload className="text-lg" />
                    Export
                  </button>
                </div>
                
                {/* Filtres */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by invoice number..."
                      value={filters.order_search || ""}
                      onChange={(e) => handleOrderFilter({ order_search: e.target.value })}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent text-sm w-full"
                    />
                  </div>
                  
                  <select
                    value={filters.order_status || ""}
                    onChange={(e) => handleOrderFilter({ order_status: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#a68e55] focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Table des commandes */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Invoice</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Items</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Total</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.data.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">
                          <HiOutlineShoppingCart className="text-4xl text-gray-300 mx-auto mb-3" />
                          <p className="text-lg font-medium">No orders found</p>
                          <p className="text-sm">This customer hasn't placed any orders yet</p>
                        </td>
                      </tr>
                    ) : (
                      orders.data.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-6">
                            <span className="font-medium text-gray-900">#{order.invoice_no}</span>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-gray-600">
                              {formatDate(order.created_at)}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-gray-900">
                              {order.sell_details?.length || 0} items
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(order.grand_total)}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <button
                              onClick={() => router.get(route('admin.orders.show', order.id))}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title="View order details"
                            >
                              <HiOutlineEye className="text-lg" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination des commandes */}
              {orders.data.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {orders.from} to {orders.to} of {orders.total} orders
                    </div>
                    <div className="flex items-center gap-2">
                      {orders.links.map((link, idx) => (
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
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete customer "{customer.full_name}"? 
                {stats.total_orders > 0 && (
                  <span className="block mt-2 text-amber-600">
                    This customer has {stats.total_orders} order(s). The customer will be deactivated instead of permanently deleted.
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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