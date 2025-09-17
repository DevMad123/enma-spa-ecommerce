import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { FaBarcode } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import CreateModal from "./CreateModal";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function ProductsHeader({ filters, onFilterChange, onAddProduct }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Products</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={e => onFilterChange({ search: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={e => onFilterChange({ status: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <select
          value={filters.perPage}
          onChange={e => onFilterChange({ perPage: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          {PER_PAGE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt} / page</option>
          ))}
        </select>
        <button
          onClick={onAddProduct}
          className="px-4 py-2 rounded-full bg-[#a68e55] text-white font-semibold shadow hover:bg-[#8c6c3c] transition"
        >
          + Add Product
        </button>
      </div>
    </header>
  );
}

function ProductsListTable({ products, sort, direction, onSort }) {
  const headers = [
    { label: "SI", key: "id", sortable: false },
    { label: "Name", key: "name", sortable: true },
    { label: "Code", key: "code", sortable: true },
    { label: "Photo", key: "image_path", sortable: false },
    { label: "Sell Price", key: "current_sale_price", sortable: true },
    { label: "Wholesale Price", key: "current_wholesale_price", sortable: true },
    { label: "Available", key: "available_quantity", sortable: true },
    { label: "Status", key: "status", sortable: true },
    { label: "Action", key: "action", sortable: false },
  ];

  const getSortIcon = (key) => {
    if (sort !== key) return <span className="text-gray-300">⇅</span>;
    return direction === "asc" ? <span className="text-[#a68e55]">▲</span> : <span className="text-[#a68e55]">▼</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600 bg-[#f7f3ee]">
            {headers.map(h => (
              <th
                key={h.key}
                className="py-2 px-3 cursor-pointer select-none"
                onClick={() => h.sortable && onSort(h.key)}
              >
                <span className="flex items-center gap-1">
                  {h.label}
                  {h.sortable && getSortIcon(h.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center text-gray-400">
                No products found.
              </td>
            </tr>
          ) : (
            products.data.map((product, i) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-2 px-3">{products.from + i}</td>
                <td className="py-2 px-3 font-medium text-gray-800">{product.name}</td>
                <td className="py-2 px-3">{product.code}</td>
                <td className="py-2 px-3">
                  <img
                    src={`http://127.0.0.1:8000/${product.image_path}`}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded shadow border"
                  />
                </td>
                <td className="py-2 px-3">{product.current_sale_price}</td>
                <td className="py-2 px-3">{product.current_wholesale_price}</td>
                <td className="py-2 px-3">{product.available_quantity}</td>
                <td className="py-2 px-3">
                  {product.status === 1 ? (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold">Active</span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={route("admin.products.edit", product.id)}
                      className="p-2 rounded hover:bg-gray-100 text-[#8c6c3c]"
                      title="View"
                    >
                      <FiEye size={18} />
                    </Link>
                    <Link
                      className="p-2 rounded hover:bg-gray-100 text-[#a68e55]"
                      title="Barcode"
                      onClick={() => window.alert("Barcode print modal (à implémenter)")}
                    >
                      <FaBarcode size={18} />
                    </Link>
                    <Link
                      href={route("admin.products.edit", product.id)}
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Edit"
                    >
                      <HiOutlinePencil size={18} />
                    </Link>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                      onClick={() => window.confirm("Are you sure you want to delete this item?")}
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
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-500">
          Showing {products.from} to {products.to} of {products.total} products
        </span>
        <div className="flex gap-1">
          {products.links.map((link, idx) => (
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

export default function ProductsList() {
  const { productList, filters, productCategory, supplierList, brand, color, size } = usePage().props;
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handleFilterChange = (newFilters) => {
    router.get(route("admin.products.list"), { ...filters, ...newFilters }, { preserveState: true, replace: true });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (filters.sort === key && filters.direction === "asc") direction = "desc";
    handleFilterChange({ sort: key, direction });
  };

  const { success } = usePage().props;

  return (
    <>
      {success && <div className="alert alert-success">{success}</div>}
      <ProductsHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddProduct={() => setCreateModalOpen(true)}
      />
      <main className="pb-4">
        <ProductsListTable
          products={productList}
          sort={filters.sort}
          direction={filters.direction}
          onSort={handleSort}
        />
      </main>
      <CreateModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        categories={productCategory}
        suppliers={supplierList}
        brands={brand}
        colors={color}
        sizes={size}
      />
    </>
  );
}

ProductsList.layout = (page) => <AdminLayout children={page} title="Product List" />;
