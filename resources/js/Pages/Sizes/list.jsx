import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamation,
} from "react-icons/hi";
import { Modal, Box, Typography, Button } from "@mui/material";
import SizeModal from "./SizeModal";

export default function List() {
  const { sizes, flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedSize, setSelectedSize] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState(null);

  // Filtrer les tailles
  const filteredSizes = sizes ? sizes.filter((size) =>
    size.size.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleCreate = () => {
    setModalMode("create");
    setSelectedSize(null);
    setSizeModalOpen(true);
  };

  const handleEdit = (size) => {
    setModalMode("edit");
    setSelectedSize(size);
    setSizeModalOpen(true);
  };

  const handleDeleteClick = (size) => {
    setSizeToDelete(size);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sizeToDelete) {
      router.delete(route("admin.sizes.deleteSizes", sizeToDelete.id), {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSizeToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSizeToDelete(null);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Size Management</h1>
            <p className="text-gray-600 mt-1">
              Manage product sizes for your e-commerce store
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-[#a68e55] hover:bg-[#8c6c3c] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <HiOutlinePlus className="text-lg" />
            Add Size
          </button>
        </div>

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

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search sizes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent"
            />
          </div>
        </div>

        {/* Tableau des tailles */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    ID
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Size
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Size Display
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    Created Date
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSizes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-100 p-3 rounded-full">
                          <HiOutlineSearch className="text-2xl text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">No sizes found</p>
                        <p className="text-sm">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Start by adding your first size"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSizes.map((size) => (
                    <tr key={size.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        #{size.id}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-medium">
                          {size.size}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center">
                          <span className="bg-[#f7f3ee] border border-[#a68e55] px-3 py-1 rounded-lg text-[#8c6c3c] font-semibold text-sm">
                            {size.size}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(size.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(size)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Edit size"
                          >
                            <HiOutlinePencil className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(size)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete size"
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

          {/* Footer avec statistiques */}
          {filteredSizes.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredSizes.length} of {sizes?.length || 0} size{(sizes?.length || 0) !== 1 ? 's' : ''}
                </span>
                <span>
                  Total: {sizes?.length || 0} size{(sizes?.length || 0) !== 1 ? 's' : ''} registered
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal pour créer/modifier une taille */}
        <SizeModal
          open={sizeModalOpen}
          onClose={() => setSizeModalOpen(false)}
          mode={modalMode}
          size={selectedSize}
        />

        {/* Modal de confirmation de suppression */}
        <Modal open={deleteModalOpen} onClose={handleDeleteCancel}>
          <Box className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <HiOutlineExclamation className="text-red-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Size
                    </h3>
                    <p className="text-gray-600 mt-1">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete the size{" "}
                    <span className="font-semibold">"{sizeToDelete?.size}"</span>?
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    This will permanently remove the size from your system.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteCancel}
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: "#d1d5db",
                      color: "#374151",
                      "&:hover": {
                        borderColor: "#9ca3af",
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#dc2626",
                      "&:hover": {
                        backgroundColor: "#b91c1c",
                      },
                    }}
                  >
                    Delete Size
                  </Button>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </AdminLayout>
  );
}
