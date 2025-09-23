import React, { useEffect } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal, Box, IconButton } from "@mui/material";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";

export default function SizeModal({ open, onClose, mode = "create", size = null }) {
  const defaultData = {
    size: "",
  };

  const { data, setData, post, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && size) {
        setData({
          size: size.size || "",
        });
      } else {
        reset();
      }
    }
  }, [open, mode, size, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("size", data.size);

    if (mode === "edit" && size?.id) {
      formData.append("_method", "PUT");
      router.post(route("admin.sizes.updateSizes", size.id), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      router.post(route("admin.sizes.storeSizes"), formData, {
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
                {mode === "create" ? "Add Size" : "Edit Size"}
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
            {/* Taille */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.size}
                onChange={(e) => setData("size", e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                  errors.size ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Enter size (e.g., XS, S, M, L, XL, 36, 38, 40)"
                required
              />
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Enter clothing size (XS, S, M, L, XL) or shoe size (36, 37, 38, etc.)
              </p>
            </div>

            {/* Exemples de tailles */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Size Examples:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Clothing:</p>
                  <p>XS, S, M, L, XL, XXL</p>
                </div>
                <div>
                  <p className="font-medium">Shoes:</p>
                  <p>36, 37, 38, 39, 40, 41</p>
                </div>
                <div>
                  <p className="font-medium">Numbers:</p>
                  <p>28, 30, 32, 34, 36</p>
                </div>
                <div>
                  <p className="font-medium">Kids:</p>
                  <p>2T, 3T, 4T, 5T, 6T</p>
                </div>
              </div>
            </div>

            {/* Aperçu de la taille */}
            {data.size && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size Preview
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-[#f7f3ee] border border-[#a68e55] px-4 py-2 rounded-lg">
                    <span className="font-semibold text-[#8c6c3c]">{data.size}</span>
                  </div>
                  <span className="text-sm text-gray-600">This is how the size will appear</span>
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
                  ? "Create Size"
                  : "Update Size"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}
