import React, { useEffect } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal, Box, IconButton } from "@mui/material";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";

export default function ColorModal({ open, onClose, mode = "create", color = null }) {
  const defaultData = {
    name: "",
    color_code: "",
  };

  const { data, setData, post, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && color) {
        setData({
          name: color.name || "",
          color_code: color.color_code || "",
        });
      } else {
        reset();
      }
    }
  }, [open, mode, color, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("color_code", data.color_code || "");

    if (mode === "edit" && color?.id) {
      formData.append("_method", "PUT");
      router.post(route("admin.colors.updateColors", color.id), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      router.post(route("admin.colors.storeColors"), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
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
                {mode === "create" ? "Add Color" : "Edit Color"}
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom de la couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                  errors.name ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Enter color name (e.g., Red, Blue, Green)"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Code couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Code (Hex)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={data.color_code || "#000000"}
                  onChange={(e) => setData("color_code", e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={data.color_code}
                  onChange={(e) => setData("color_code", e.target.value)}
                  className={clsx(
                    "flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                    errors.color_code ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="#FF0000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              {errors.color_code && (
                <p className="mt-1 text-sm text-red-600">{errors.color_code}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Enter a valid hex color code (e.g., #FF0000 for red)
              </p>
            </div>

            {/* Aperçu de la couleur */}
            {data.color_code && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Preview
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-20 h-12 border border-gray-300 rounded shadow-inner"
                    style={{ backgroundColor: data.color_code }}
                  ></div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{data.name || "Color Name"}</div>
                    <div className="text-xs text-gray-400">{data.color_code}</div>
                  </div>
                </div>
              </div>
            )}

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
                  ? "Create Color"
                  : "Update Color"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}
