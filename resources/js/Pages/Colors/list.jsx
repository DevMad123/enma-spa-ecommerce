import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import AdminLayout from "@/Layouts/AdminLayout";
import ColorModal from "./ColorModal";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function ColorsHeader({ filters, onFilterChange, onAddColor }) {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#8c6c3c] tracking-tight">Colors</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search colors..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        />
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
          onClick={onAddColor}
          className="px-4 py-2 rounded-full bg-[#a68e55] text-white font-semibold shadow hover:bg-[#8c6c3c] transition"
        >
          <HiOutlinePlus className="inline mr-1" /> Add Color
        </button>
      </div>
    </header>
  );
}

function ColorsListTable({ colors, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600 bg-[#f7f3ee]">
            <th className="py-2 px-3">SI</th>
            <th className="py-2 px-3">Color</th>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Color Code</th>
            <th className="py-2 px-3">Created</th>
            <th className="py-2 px-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {colors.data.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-400">
                No colors found.
              </td>
            </tr>
          ) : (
            colors.data.map((color, i) => (
              <tr key={color.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-2 px-3">{colors.from + i}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 border border-gray-300 rounded shadow-sm"
                      style={{
                        backgroundColor: color.color_code || "#e5e7eb",
                      }}
                      title={color.color_code || "No color code"}
                    ></div>
                  </div>
                </td>
                <td className="py-2 px-3 font-medium text-gray-800">{color.name}</td>
                <td className="py-2 px-3 text-gray-600">
                  {color.color_code ? (
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {color.color_code}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="py-2 px-3 text-gray-600">
                  {color.created_at ? new Date(color.created_at).toLocaleDateString() : "N/A"}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Edit"
                      onClick={() => onEdit(color)}
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-red-500"
                      title="Delete"
                      onClick={() => onDelete(color)}
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
          Showing {colors.from} to {colors.to} of {colors.total} colors
        </span>
        <div className="flex gap-1">
          {colors.links.map((link, idx) => (
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

export default function ColorsList() {
  const { colorList, filters, flash = {} } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (flash.success && modalOpen) {
      setModalOpen(false);
      setSelectedColor(null);
      setModalMode("create");
    }
  }, [flash]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    router.get(route("admin.colors.list"), updatedFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const handleAddColor = () => {
    setModalMode("create");
    setSelectedColor(null);
    setModalOpen(true);
  };

  const handleEdit = (color) => {
    setModalMode("edit");
    setSelectedColor(color);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedColor(null);
    setModalMode("create");
  };

  const handleDelete = (color) => {
    if (
      window.confirm(
        `Are you sure you want to delete the color "${color.name}"? This action cannot be undone.`
      )
    ) {
      router.delete(route("admin.colors.deleteColors", color.id));
    }
  };

  return (
    <>
      <ColorsHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddColor={handleAddColor}
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
        <ColorsListTable
          colors={colorList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ColorModal
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        color={selectedColor}
      />
    </>
  );
}

ColorsList.layout = (page) => <AdminLayout children={page} title="Color List" />;
