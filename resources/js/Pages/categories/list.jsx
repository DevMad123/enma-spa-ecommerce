import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import CategoryModal from "./CategoryModal"; // You will need to create this component.

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function CategoriesHeader({ filters, onFilterChange, onAddCategory }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Categories</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search categories..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <select
          value={filters.perPage}
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
          onClick={onAddCategory}
          className="px-4 py-2 rounded-full bg-[#a68e55] text-white font-semibold shadow hover:bg-[#8c6c3c] transition"
        >
          + Add Category
        </button>
      </div>
    </header>
  );
}

function CategoriesListTable({ categories, sort, direction, onSort, onEdit }) {
  const headers = [
    { label: "SI", key: "id", sortable: false },
    { label: "Name", key: "name", sortable: true },
    { label: "Photo", key: "image", sortable: false },
    { label: "Note", key: "note", sortable: false },
    { label: "Popular", key: "is_popular", sortable: true },
    { label: "Status", key: "status", sortable: true },
    { label: "Action", key: "action", sortable: false },
  ];

  const getSortIcon = (key) => {
    if (sort !== key) return <span className="text-gray-300">⇅</span>;
    return direction === "asc" ? (
      <span className="text-[#a68e55]">▲</span>
    ) : (
      <span className="text-[#a68e55]">▼</span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600 bg-[#f7f3ee]">
            {headers.map((h) => (
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
          {categories.data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center text-gray-400">
                No categories found.
              </td>
            </tr>
          ) : (
            categories.data.map((category, i) => (
              <tr key={category.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-2 px-3">{categories.from + i}</td>
                <td className="py-2 px-3 font-medium text-gray-800">{category.name}</td>
                <td className="py-2 px-3">
                  <img
                    src={`http://127.0.0.1:8000/${category.image}`}
                    alt={category.name}
                    className="w-14 h-14 object-cover rounded shadow border"
                  />
                </td>
                <td className="py-2 px-3">{category.note}</td>
                <td className="py-2 px-3">
                  {category.is_popular === 1 ? (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700 font-semibold">Yes</span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 font-semibold">No</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {category.status === 1 ? (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-green-100 text-green-700 font-semibold">Active</span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs rounded bg-red-100 text-red-700 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-[#8c6c3c]"
                      title="View"
                      onClick={() => onEdit(category)}
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Edit"
                      onClick={() => onEdit(category)}
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                      onClick={() => window.confirm("Are you sure you want to delete this category?")}
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
          Showing {categories.from} to {categories.to} of {categories.total} categories
        </span>
        <div className="flex gap-1">
          {categories.links.map((link, idx) => (
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

export default function CategoriesList() {
  const { categoryList, filters } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleFilterChange = (newFilters) => {
    router.get(route("admin.categories.list"), { ...filters, ...newFilters }, { preserveState: true, replace: true });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (filters.sort === key && filters.direction === "asc") direction = "desc";
    handleFilterChange({ sort: key, direction });
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setModalOpen(true);
  };

  const { success } = usePage().props;

  return (
    <>
      {success && <div className="alert alert-success">{success}</div>}
      <CategoriesHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddCategory={handleAddCategory}
      />
      <main className="pb-4">
        <CategoriesListTable
          categories={categoryList}
          sort={filters.sort}
          direction={filters.direction}
          onSort={handleSort}
          onEdit={handleEditCategory}
        />
      </main>
      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        category={selectedCategory}
      />
    </>
  );
}

CategoriesList.layout = (page) => <AdminLayout children={page} title="Category List" />;