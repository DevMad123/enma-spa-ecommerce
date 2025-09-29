import React, { useEffect, useRef } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal, Box, IconButton } from "@mui/material";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";

export default function BrandModal({ open, onClose, mode = "create", brand = null }) {
  const defaultData = {
    name: "",
    image: null,
    status: true,
  };

  const { data, setData, post, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;
  const imageInputRef = useRef();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && brand) {
        setData({
          name: brand.name || "",
          image: brand.image || null, // Garder l'image existante comme string
          status: brand.status === 1,
        });
      } else {
        reset();
      }
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [open, mode, brand, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("status", data.status ? "1" : "0");

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (mode === "edit" && brand?.id) {
      formData.append("_method", "PUT");
      router.post(route("admin.brands.updateBrands", brand.id), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      router.post(route("admin.brands.storeBrands"), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("image", file);
    }
  };

  const handleRemoveImage = () => {
    setData("image", null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-[#f7f3ee]">
            <div className="flex items-center gap-3">
              {mode === "create" ? (
                <HiOutlinePlus className="text-[#8c6c3c] text-xl" />
              ) : (
                <HiOutlinePencil className="text-[#8c6c3c] text-xl" />
              )}
              <h2 className="text-xl font-semibold text-[#8c6c3c]">
                {mode === "create" ? "Add Brand" : "Edit Brand"}
              </h2>
            </div>
            <IconButton onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6" encType="multipart/form-data">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                  errors.name ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Enter brand name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Image
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
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
                {data.image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image preview:</p>
                    {typeof data.image === "string" ? (
                      <img
                        src={`/${data.image.replace(/^\/+/, "")}`}
                        alt="Current Brand"
                        className="w-32 h-32 object-cover rounded-md shadow"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(data.image)}
                        alt="New Brand"
                        className="w-32 h-32 object-cover rounded-md shadow"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                {/* Aperçu de l'image actuelle en mode édition (fallback) */}
                {mode === "edit" && brand?.image && !data.image && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600">Current image:</span>
                    <img
                      src={`/${brand.image.replace(/^\/+/, "")}`}
                      alt={brand.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                    >
                      Remove Image
                    </button>
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
                Uncheck to deactivate this brand
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
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
                  ? "Create Brand"
                  : "Update Brand"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}
