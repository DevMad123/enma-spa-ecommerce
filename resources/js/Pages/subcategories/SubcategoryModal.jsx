import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Modal, Box, IconButton, Tooltip } from "@mui/material";
import { useForm, usePage } from "@inertiajs/react";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";

export default function SubcategoryModal({ open, onClose, mode = "create", subcategory = null }) {
  const defaultData = {
    name: "",
    category_id: "",
    note: "",
    status: true,
    main_image: null,
  };

  const { data, setData, post, put, processing, reset } = useForm(defaultData);
  const { errors, categories = [] } = usePage().props;

  // Synchroniser les données quand mode ou subcategory changent
  useEffect(() => {
    if (mode === "edit" && subcategory) {
      setData({
        name: subcategory.name || "",
        category_id: subcategory.category_id || "",
        note: subcategory.note || "",
        status: subcategory.status === 1,
        main_image: subcategory.image || null, // Garder l'image existante comme string
      });
    } else {
      setData(defaultData);
    }
  }, [mode, subcategory]);

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Mode:", mode, "Subcategory ID:", subcategory?.id);
    console.log("Data main_image:", data.main_image);
    console.log("Is main_image a File?", data.main_image instanceof File);

    const hasMainFile = data.main_image instanceof File;

    if (mode === "edit" && subcategory?.id) {
      // EDITION : route update AVEC id
      if (hasMainFile) {
        // Avec fichier : utiliser FormData
        const fd = new FormData();
        fd.append("name", data.name);
        fd.append("category_id", data.category_id);
        fd.append("note", data.note || "");
        fd.append("status", data.status ? "1" : "0");

        // Image principale - Envoyer seulement si c'est un nouveau fichier
        if (hasMainFile) {
          fd.append("image", data.main_image);
        }

        // Method override pour PUT
        fd.append("_method", "PUT");

        // Envoi via Inertia POST (ne PAS fixer Content-Type manuellement)
        router.post(route("admin.subcategories.update", subcategory.id), fd, {
          onSuccess: () => {
            console.log("Subcategory updated successfully");
            handleClose();
          },
          onError: (err) => {
            console.log("Update errors:", err);
          },
        });
      } else {
        // Pas de fichiers, simple PUT
        const dataToSend = { ...data };

        // Ne pas envoyer l'image principale si ce n'est pas un nouveau fichier
        if (!(data.main_image instanceof File)) {
          delete dataToSend.main_image;
        }

        router.put(route("admin.subcategories.update", subcategory.id), dataToSend, {
          onSuccess: () => {
            console.log("Subcategory updated successfully");
            handleClose();
          },
          onError: (err) => {
            console.log("Update errors:", err);
          },
        });
      }
    } else {
      // CREATION : route store SANS id
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("category_id", data.category_id);
      fd.append("note", data.note || "");
      fd.append("status", data.status ? "1" : "0");

      // Image principale
      if (hasMainFile) {
        fd.append("image", data.main_image);
      }

      // Envoi via Inertia POST
      router.post(route("admin.subcategories.store"), fd, {
        onSuccess: () => {
          console.log("Subcategory created successfully");
          handleClose();
        },
        onError: (err) => {
          console.log("Creation errors:", err);
        },
      });
    }
  };

  // Handler pour fermer le modal
  const handleClose = () => {
    reset();
    onClose();
  };

  // Handler pour l'upload d'image
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("main_image", file);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-[#f7f3ee]">
            <div className="flex items-center gap-3">
              {mode === "create" ? (
                <HiOutlinePlus className="text-[#8c6c3c] text-xl" />
              ) : (
                <HiOutlinePencil className="text-[#8c6c3c] text-xl" />
              )}
              <h2 className="text-xl font-semibold text-[#8c6c3c]">
                {mode === "create" ? "Add New Subcategory" : "Edit Subcategory"}
              </h2>
            </div>
            <IconButton onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <HiOutlineX size={24} />
            </IconButton>
          </div>

          {/* Affichage des erreurs globales */}
          {errors && Object.keys(errors).length > 0 && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <h4 className="font-semibold mb-2">Please correct the following errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, messages]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom de la sous-catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                  errors.name ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Enter subcategory name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Catégorie parente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                value={data.category_id}
                onChange={(e) => setData("category_id", e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                  errors.category_id ? "border-red-500" : "border-gray-300"
                )}
                required
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={data.note}
                onChange={(e) => setData("note", e.target.value)}
                rows={4}
                className={clsx(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition resize-none",
                  errors.note ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Enter a note for this subcategory (optional)"
              />
              {errors.note && (
                <p className="mt-1 text-sm text-red-600">{errors.note}</p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Image
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  onChange={handleMainImageChange}
                  accept="image/*"
                  className={clsx(
                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                    errors.image ? "border-red-500" : "border-gray-300"
                  )}
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}

                {/* Aperçu de l'image */}
                {data.main_image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image preview:</p>
                    {typeof data.main_image === "string" ? (
                      <img
                        src={`http://127.0.0.1:8000/${data.main_image}`}
                        alt="Current Subcategory"
                        className="w-40 h-40 object-cover rounded-md shadow"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(data.main_image)}
                        alt="New Subcategory"
                        className="w-40 h-40 object-cover rounded-md shadow"
                      />
                    )}
                  </div>
                )}

                {/* Aperçu de l'image actuelle en mode édition (fallback) */}
                {mode === "edit" && subcategory?.image && !data.main_image && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Current image:</span>
                    <img
                      src={`http://127.0.0.1:8000/${subcategory.image}`}
                      alt={subcategory.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={data.status}
                  onChange={(e) => setData("status", e.target.checked)}
                  className="w-5 h-5 text-[#a68e55] border-gray-300 rounded focus:ring-[#a68e55]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Status
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Uncheck to deactivate this subcategory
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className={clsx(
                  "flex-1 px-6 py-3 rounded-lg font-medium transition",
                  processing
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#a68e55] hover:bg-[#8c6c3c] text-white"
                )}
              >
                {processing
                  ? "Processing..."
                  : mode === "create"
                  ? "Create Subcategory"
                  : "Update Subcategory"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}
