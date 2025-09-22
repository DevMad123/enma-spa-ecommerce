import React, { useState, useEffect } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import SubcategoryModal from "./SubcategoryModal";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function SubcategoriesHeader({ filters, onFilterChange, onAddSubcategory }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Subcategories</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search subcategories..."
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
          value={filters.category_id}
          onChange={(e) => onFilterChange({ category_id: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {filters.categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
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
          onClick={onAddSubcategory}
          className="px-4 py-2 rounded-full bg-[#a68e55] text-white font-semibold shadow hover:bg-[#8c6c3c] transition"
        >
          + Add Subcategory
        </button>
      </div>
    </header>
  );
}

function SubcategoriesListTable({ subcategories, sort, direction, onSort, onEdit, onDelete }) {
  const headers = [
    { label: "SI", key: "id", sortable: false },
    { label: "Name", key: "name", sortable: true },
    { label: "Category", key: "category", sortable: true },
    { label: "Photo", key: "image", sortable: false },
    { label: "Note", key: "note", sortable: false },
    { label: "Status", key: "status", sortable: true },
    { label: "Action", key: "action", sortable: false },
  ];

  const getSortIcon = (key) => {
    if (sort !== key) return "↕️";
    return direction === "asc" ? "↑" : "↓";
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
          {subcategories.data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center text-gray-400">
                No subcategories found.
              </td>
            </tr>
          ) : (
            subcategories.data.map((subcategory, i) => (
              <tr key={subcategory.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-2 px-3">{subcategories.from + i}</td>
                <td className="py-2 px-3 font-medium text-gray-800">{subcategory.name}</td>
                <td className="py-2 px-3">
                  <span className="inline-block px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
                    {subcategory.category ? subcategory.category.name : 'N/A'}
                  </span>
                </td>
                <td className="py-2 px-3">
                  {subcategory.image ? (
                    <img
                      src={`http://127.0.0.1:8000/${subcategory.image}`}
                      alt={subcategory.name}
                      className="w-14 h-14 object-cover rounded shadow border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded shadow border flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </td>
                <td className="py-2 px-3">{subcategory.note || '-'}</td>
                <td className="py-2 px-3">
                  {subcategory.status === 1 ? (
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
                      onClick={() => onEdit(subcategory)}
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Edit"
                      onClick={() => onEdit(subcategory)}
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                      onClick={() => onDelete(subcategory)}
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
          Showing {subcategories.from} to {subcategories.to} of {subcategories.total} subcategories
        </span>
        <div className="flex gap-1">
          {subcategories.links.map((link, idx) => (
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

export default function SubcategoriesList() {
  const { subcategoryList, filters, flash = {} } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Affichage des messages flash
  useEffect(() => {
    if (flash.success) {
      console.log("Flash success:", flash.success);
      // Fermer automatiquement le modal après succès
      if (modalOpen) {
        setModalOpen(false);
        setSelectedSubcategory(null);
        setModalMode("create");
      }
    }
    if (flash.error) {
      console.log("Flash error:", flash.error);
    }
  }, [flash]);

  // Gestionnaire pour les filtres
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    const params = new URLSearchParams();
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.append(key, value);
      }
    });

    router.get(route("admin.subcategories.list"), Object.fromEntries(params), {
      preserveState: true,
      replace: true,
    });
  };

  // Gestionnaire pour le tri
  const handleSort = (key) => {
    const newDirection = filters.sort === key && filters.direction === "asc" ? "desc" : "asc";
    handleFilterChange({ sort: key, direction: newDirection });
  };

  // Gestionnaire pour ouvrir le modal d'ajout
  const handleAddSubcategory = () => {
    setModalMode("create");
    setSelectedSubcategory(null);
    setModalOpen(true);
  };

  // Gestionnaire pour éditer
  const handleEdit = (subcategory) => {
    setModalMode("edit");
    setSelectedSubcategory(subcategory);
    setModalOpen(true);
  };

  // Gestionnaire pour fermer le modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSubcategory(null);
    setModalMode("create");
  };

  // Gestionnaire pour supprimer une sous-catégorie
  const handleDelete = (subcategory) => {
    if (window.confirm(`Are you sure you want to delete the subcategory "${subcategory.name}"? This action cannot be undone.`)) {
      router.delete(route("admin.subcategories.delete", subcategory.id), {
        preserveScroll: true,
        onSuccess: () => {
          console.log("Subcategory deleted successfully");
        },
        onError: (errors) => {
          console.log("Delete errors:", errors);
        },
      });
    }
  };

  return (
    <>
      <SubcategoriesHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddSubcategory={handleAddSubcategory}
      />

      {/* Affichage des messages flash */}
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
        <SubcategoriesListTable
          subcategories={subcategoryList}
          sort={filters.sort}
          direction={filters.direction}
          onSort={handleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <SubcategoryModal
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        subcategory={selectedSubcategory}
      />
    </>
  );
}

SubcategoriesList.layout = (page) => <AdminLayout children={page} title="Subcategory List" />;