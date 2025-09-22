import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import BrandModal from "./BrandModal";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function BrandsHeader({ filters, onFilterChange, onAddBrand }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Brands</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search brands..."
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
          onClick={onAddBrand}
          className="px-4 py-2 rounded-full bg-[#a68e55] text-white font-semibold shadow hover:bg-[#8c6c3c] transition"
        >
          <HiOutlinePlus className="inline mr-1" /> Add Brand
        </button>
      </div>
    </header>
  );
}

function BrandsListTable({ brands, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600 bg-[#f7f3ee]">
            <th className="py-2 px-3">SI</th>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Image</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {brands.data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                No brands found.
              </td>
            </tr>
          ) : (
            brands.data.map((brand, i) => (
              <tr key={brand.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-2 px-3">{brands.from + i}</td>
                <td className="py-2 px-3 font-medium text-gray-800">{brand.name}</td>
                <td className="py-2 px-3">
                  {brand.image ? (
                    <img
                      src={`/${brand.image.replace(/^\/+/, "")}`}
                      alt={brand.name}
                      className="w-14 h-14 object-cover rounded shadow border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded shadow border flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </td>
                <td className="py-2 px-3">
                  {brand.status === 1 ? (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold">Active</span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Edit"
                      onClick={() => onEdit(brand)}
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                      onClick={() => onDelete(brand)}
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
          Showing {brands.from} to {brands.to} of {brands.total} brands
        </span>
        <div className="flex gap-1">
          {brands.links.map((link, idx) => (
            <button
              key={idx}
              disabled={!link.url}
              className={`px-3 py-1 rounded ${link.active ? "bg-[#a68e55] text-white" : "bg-gray-100 text-gray-700"} text-xs`}
              dangerouslySetInnerHTML={{ __html: link.label }}
              onClick={() => link.url && router.get(link.url)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrandsList() {
  const { brandList, filters, flash = {} } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    if (flash.success && modalOpen) {
      setModalOpen(false);
      setSelectedBrand(null);
      setModalMode("create");
    }
  }, [flash]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    router.get(route("admin.brands.list"), updatedFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const handleAddBrand = () => {
    setModalMode("create");
    setSelectedBrand(null);
    setModalOpen(true);
  };

  const handleEdit = (brand) => {
    setModalMode("edit");
    setSelectedBrand(brand);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBrand(null);
    setModalMode("create");
  };

  const handleDelete = (brand) => {
    if (window.confirm(`Are you sure you want to delete the brand "${brand.name}"? This action cannot be undone.`)) {
      router.delete(route("admin.brands.delete", brand.id), {
        preserveScroll: true,
      });
    }
  };

  return (
    <>
      <BrandsHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddBrand={handleAddBrand}
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
        <BrandsListTable
          brands={brandList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <BrandModal
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        brand={selectedBrand}
      />
    </>
  );
}

BrandsList.layout = (page) => <AdminLayout children={page} title="Brand List" />;
