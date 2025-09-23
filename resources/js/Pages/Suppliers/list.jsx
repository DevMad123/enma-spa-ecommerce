import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import AdminLayout from "@/Layouts/AdminLayout";
import SupplierModal from "./SupplierModal";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function SuppliersHeader({ filters, onFilterChange, onAddSupplier }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Suppliers</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <select
          value={filters.perPage || 10}
          onChange={(e) => onFilterChange({ perPage: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          {PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt} / page
            </option>
          ))}
        </select>
        <button
          onClick={onAddSupplier}
          className="px-4 py-2 rounded-full bg-[#a68e55] text-white font-semibold shadow hover:bg-[#8c6c3c] transition"
        >
          <HiOutlinePlus className="inline mr-1" /> Add Supplier
        </button>
      </div>
    </header>
  );
}

function SuppliersListTable({ suppliers, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600 bg-[#f7f3ee]">
            <th className="py-2 px-3">SI</th>
            <th className="py-2 px-3">Image</th>
            <th className="py-2 px-3">Supplier Name</th>
            <th className="py-2 px-3">Company</th>
            <th className="py-2 px-3">Phone</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Previous Due</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.data.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-6 text-center text-gray-400">
                No suppliers found.
              </td>
            </tr>
          ) : (
            suppliers.data.map((supplier, i) => (
              <tr key={supplier.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-2 px-3">{suppliers.from + i}</td>
                <td className="py-2 px-3">
                  {supplier.image ? (
                    <img
                      src={`/${supplier.image.replace(/^\/+/, "")}`}
                      alt={supplier.supplier_name}
                      className="w-14 h-14 object-cover rounded shadow border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded shadow border flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </td>
                <td className="py-2 px-3 font-medium text-gray-800">{supplier.supplier_name}</td>
                <td className="py-2 px-3 text-gray-600">
                  {supplier.company_name || <span className="text-gray-400">N/A</span>}
                </td>
                <td className="py-2 px-3 text-gray-600">
                  <div className="space-y-1">
                    <div>{supplier.supplier_phone_one}</div>
                    {supplier.supplier_phone_two && (
                      <div className="text-xs text-gray-400">{supplier.supplier_phone_two}</div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">
                  <div className="space-y-1">
                    {supplier.supplier_email && (
                      <div className="text-xs">{supplier.supplier_email}</div>
                    )}
                    {supplier.company_email && (
                      <div className="text-xs text-gray-400">{supplier.company_email}</div>
                    )}
                    {!supplier.supplier_email && !supplier.company_email && (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">
                  {supplier.previous_due ? (
                    <span className="text-red-600 font-medium">
                      ${parseFloat(supplier.previous_due).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">$0.00</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {supplier.status === 1 || supplier.status === true ? (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Edit"
                      onClick={() => onEdit(supplier)}
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                      onClick={() => onDelete(supplier)}
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-500">
          Showing {suppliers.from} to {suppliers.to} of {suppliers.total} suppliers
        </span>
        <div className="flex gap-1">
          {suppliers.links.map((link, idx) => (
            <button
              key={idx}
              disabled={!link.url}
              className={`px-3 py-1 rounded ${
                link.active ? "bg-[#a68e55] text-white" : "bg-gray-100 text-gray-700"
              } text-xs`}
              dangerouslySetInnerHTML={{ __html: link.label }}
              onClick={() => link.url && router.get(link.url)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SuppliersList() {
  const { supplierList, filters, flash = {} } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    if (flash.success && modalOpen) {
      setModalOpen(false);
      setSelectedSupplier(null);
      setModalMode("create");
    }
  }, [flash]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    router.get(route("admin.suppliers.list"), updatedFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const handleAddSupplier = () => {
    setModalMode("create");
    setSelectedSupplier(null);
    setModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setModalMode("edit");
    setSelectedSupplier(supplier);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSupplier(null);
    setModalMode("create");
  };

  const handleDelete = (supplier) => {
    if (
      window.confirm(
        `Are you sure you want to delete the supplier "${supplier.supplier_name}"? This action cannot be undone.`
      )
    ) {
      router.delete(route("admin.suppliers.deleteSuppliers", supplier.id));
    }
  };

  return (
    <>
      <SuppliersHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddSupplier={handleAddSupplier}
      />

      {flash.success && (
        <div className="mx-6 mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {flash.success}
        </div>
      )}
      {flash.error && (
        <div className="mx-6 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {flash.error}
        </div>
      )}

      <div className="px-6">
        <SuppliersListTable
          suppliers={supplierList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <SupplierModal
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        supplier={selectedSupplier}
      />
    </>
  );
}

SuppliersList.layout = (page) => <AdminLayout children={page} title="Supplier List" />;
