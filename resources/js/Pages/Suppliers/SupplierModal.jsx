import React, { useEffect, useRef } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal, Box, IconButton } from "@mui/material";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";

export default function SupplierModal({ open, onClose, mode = "create", supplier = null }) {
  const defaultData = {
    supplier_name: "",
    image: null,
    supplier_phone_one: "",
    supplier_phone_two: "",
    company_name: "",
    company_address: "",
    supplier_address: "",
    company_email: "",
    company_phone: "",
    supplier_email: "",
    previous_due: 0,
    status: true,
  };

  const { data, setData, post, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;
  const imageInputRef = useRef();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && supplier) {
        setData({
          supplier_name: supplier.supplier_name || "",
          image: supplier.image || null,
          supplier_phone_one: supplier.supplier_phone_one || "",
          supplier_phone_two: supplier.supplier_phone_two || "",
          company_name: supplier.company_name || "",
          company_address: supplier.company_address || "",
          supplier_address: supplier.supplier_address || "",
          company_email: supplier.company_email || "",
          company_phone: supplier.company_phone || "",
          supplier_email: supplier.supplier_email || "",
          previous_due: supplier.previous_due || 0,
          status: supplier.status === true || supplier.status === 1,
        });
      } else {
        reset();
      }
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [open, mode, supplier, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("supplier_name", data.supplier_name);
    formData.append("supplier_phone_one", data.supplier_phone_one);
    formData.append("supplier_phone_two", data.supplier_phone_two || "");
    formData.append("company_name", data.company_name || "");
    formData.append("company_address", data.company_address || "");
    formData.append("supplier_address", data.supplier_address || "");
    formData.append("company_email", data.company_email || "");
    formData.append("company_phone", data.company_phone || "");
    formData.append("supplier_email", data.supplier_email || "");
    formData.append("previous_due", data.previous_due || 0);
    formData.append("status", data.status);

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (mode === "edit" && supplier?.id) {
      formData.append("_method", "PUT");
      router.post(route("admin.suppliers.updateSuppliers", supplier.id), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      router.post(route("admin.suppliers.storeSuppliers"), formData, {
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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-[#f7f3ee]">
            <div className="flex items-center gap-3">
              {mode === "create" ? (
                <HiOutlinePlus className="text-[#8c6c3c] text-xl" />
              ) : (
                <HiOutlinePencil className="text-[#8c6c3c] text-xl" />
              )}
              <h2 className="text-xl font-semibold text-[#8c6c3c]">
                {mode === "create" ? "Add Supplier" : "Edit Supplier"}
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
            {/* Section: Informations du Fournisseur */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom du fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.supplier_name}
                    onChange={(e) => setData("supplier_name", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.supplier_name ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter supplier name"
                    required
                  />
                  {errors.supplier_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.supplier_name}</p>
                  )}
                </div>

                {/* Téléphone principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={data.supplier_phone_one}
                    onChange={(e) => setData("supplier_phone_one", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.supplier_phone_one ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter primary phone number"
                    required
                  />
                  {errors.supplier_phone_one && (
                    <p className="mt-1 text-sm text-red-600">{errors.supplier_phone_one}</p>
                  )}
                </div>

                {/* Téléphone secondaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    value={data.supplier_phone_two}
                    onChange={(e) => setData("supplier_phone_two", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.supplier_phone_two ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter secondary phone number"
                  />
                  {errors.supplier_phone_two && (
                    <p className="mt-1 text-sm text-red-600">{errors.supplier_phone_two}</p>
                  )}
                </div>

                {/* Email du fournisseur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Email
                  </label>
                  <input
                    type="email"
                    value={data.supplier_email}
                    onChange={(e) => setData("supplier_email", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.supplier_email ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter supplier email"
                  />
                  {errors.supplier_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.supplier_email}</p>
                  )}
                </div>
              </div>

              {/* Adresse du fournisseur */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Address
                </label>
                <textarea
                  value={data.supplier_address}
                  onChange={(e) => setData("supplier_address", e.target.value)}
                  rows={3}
                  className={clsx(
                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition resize-none",
                    errors.supplier_address ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="Enter supplier address"
                />
                {errors.supplier_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.supplier_address}</p>
                )}
              </div>
            </div>

            {/* Section: Informations de l'Entreprise */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom de l'entreprise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={data.company_name}
                    onChange={(e) => setData("company_name", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.company_name ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter company name"
                  />
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                  )}
                </div>

                {/* Téléphone de l'entreprise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    value={data.company_phone}
                    onChange={(e) => setData("company_phone", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.company_phone ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter company phone number"
                  />
                  {errors.company_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_phone}</p>
                  )}
                </div>

                {/* Email de l'entreprise */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email
                  </label>
                  <input
                    type="email"
                    value={data.company_email}
                    onChange={(e) => setData("company_email", e.target.value)}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                      errors.company_email ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter company email"
                  />
                  {errors.company_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>
                  )}
                </div>
              </div>

              {/* Adresse de l'entreprise */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <textarea
                  value={data.company_address}
                  onChange={(e) => setData("company_address", e.target.value)}
                  rows={3}
                  className={clsx(
                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition resize-none",
                    errors.company_address ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="Enter company address"
                />
                {errors.company_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_address}</p>
                )}
              </div>
            </div>

            {/* Section: Informations Financières & Image */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial & Media Information</h3>
              
              {/* Dû précédent */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Due Amount
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={data.previous_due}
                  onChange={(e) => setData("previous_due", e.target.value)}
                  className={clsx(
                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                    errors.previous_due ? "border-red-500" : "border-gray-300"
                  )}
                  placeholder="Enter previous due amount"
                />
                {errors.previous_due && (
                  <p className="mt-1 text-sm text-red-600">{errors.previous_due}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Image
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
                          alt="Current Supplier"
                          className="w-32 h-32 object-cover rounded-md shadow"
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(data.image)}
                          alt="New Supplier"
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
                  {mode === "edit" && supplier?.image && !data.image && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600">Current image:</span>
                      <img
                        src={`/${supplier.image.replace(/^\/+/, "")}`}
                        alt={supplier.supplier_name}
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
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
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
                Uncheck to deactivate this supplier
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
                  ? "Create Supplier"
                  : "Update Supplier"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}
