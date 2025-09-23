import React, { useEffect, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal, Box, IconButton } from "@mui/material";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import clsx from "clsx";

export default function CustomerModal({ open, onClose, mode = "create", customer = null }) {
  const defaultData = {
    first_name: "",
    last_name: "",
    email: "",
    phone_one: "",
    phone_two: "",
    present_address: "",
    permanent_address: "",
    password: "",
    password_confirmation: "",
    status: 1,
    image: null,
    remove_image: false,
  };

  const { data, setData, post, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && customer) {
        setData({
          first_name: customer.first_name || "",
          last_name: customer.last_name || "",
          email: customer.email || "",
          phone_one: customer.phone_one || "",
          phone_two: customer.phone_two || "",
          present_address: customer.present_address || "",
          permanent_address: customer.permanent_address || "",
          password: "",
          password_confirmation: "",
          status: customer.status || 1,
          image: null,
          remove_image: false,
        });
        setImagePreview(customer.image_url || null);
      } else {
        reset();
        setImagePreview(null);
      }
    }
  }, [open, mode, customer, setData, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("image", file);
      setData("remove_image", false);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setData("image", null);
    setData("remove_image", true);
    setImagePreview(null);
    
    // Reset le champ file input
    const fileInput = document.getElementById("customer-image");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    
    // Ajouter tous les champs texte
    Object.keys(data).forEach(key => {
      if (key !== 'image' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Ajouter l'image si présente
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    // Pour la mise à jour, on utilise une technique pour simuler PUT
    if (mode === "edit" && customer?.id) {
      formData.append("_method", "PUT");
      router.post(route("admin.customers.update", customer.id), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
        forceFormData: true,
      });
    } else {
      router.post(route("admin.customers.store"), formData, {
        onSuccess: () => {
          reset();
          onClose();
        },
        forceFormData: true,
      });
    }
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
                {mode === "create" ? "Add New Customer" : "Edit Customer"}
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
                    <strong>{field.replace('_', ' ')}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Colonne gauche - Informations personnelles */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  
                  {/* Photo de profil */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={imagePreview || '/assets/front/imgs/default-user.png'}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="customer-image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#f7f3ee] file:text-[#8c6c3c] hover:file:bg-[#e6d9c2]"
                        />
                        {(imagePreview && mode === "edit") && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove current image
                          </button>
                        )}
                      </div>
                    </div>
                    {errors.image && (
                      <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                    )}
                  </div>

                  {/* Prénom */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.first_name}
                      onChange={(e) => setData("first_name", e.target.value)}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.first_name ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter first name"
                      required
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  {/* Nom */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.last_name}
                      onChange={(e) => setData("last_name", e.target.value)}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.last_name ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter last name"
                      required
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.email ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter email address"
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.status}
                      onChange={(e) => setData("status", parseInt(e.target.value))}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.status ? "border-red-500" : "border-gray-300"
                      )}
                      required
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite - Contact et sécurité */}
              <div className="space-y-6">
                
                {/* Informations de contact */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  
                  {/* Téléphone principal */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Phone
                    </label>
                    <input
                      type="tel"
                      value={data.phone_one}
                      onChange={(e) => setData("phone_one", e.target.value)}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.phone_one ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter primary phone number"
                    />
                    {errors.phone_one && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_one}</p>
                    )}
                  </div>

                  {/* Téléphone secondaire */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone
                    </label>
                    <input
                      type="tel"
                      value={data.phone_two}
                      onChange={(e) => setData("phone_two", e.target.value)}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.phone_two ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter secondary phone number"
                    />
                    {errors.phone_two && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_two}</p>
                    )}
                  </div>

                  {/* Adresse actuelle */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Present Address
                    </label>
                    <textarea
                      value={data.present_address}
                      onChange={(e) => setData("present_address", e.target.value)}
                      rows={3}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.present_address ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter present address"
                    />
                    {errors.present_address && (
                      <p className="mt-1 text-sm text-red-600">{errors.present_address}</p>
                    )}
                  </div>

                  {/* Adresse permanente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permanent Address
                    </label>
                    <textarea
                      value={data.permanent_address}
                      onChange={(e) => setData("permanent_address", e.target.value)}
                      rows={3}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                        errors.permanent_address ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter permanent address"
                    />
                    {errors.permanent_address && (
                      <p className="mt-1 text-sm text-red-600">{errors.permanent_address}</p>
                    )}
                  </div>
                </div>

                {/* Sécurité */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Security
                    {mode === "edit" && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        (Leave blank to keep current password)
                      </span>
                    )}
                  </h3>
                  
                  {/* Mot de passe */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {mode === "create" && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        className={clsx(
                          "w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                          errors.password ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Enter password"
                        required={mode === "create"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password {mode === "create" && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        value={data.password_confirmation}
                        onChange={(e) => setData("password_confirmation", e.target.value)}
                        className={clsx(
                          "w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition",
                          errors.password_confirmation ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="Confirm password"
                        required={mode === "create" || data.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswordConfirm ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-6 border-t mt-6">
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
                  ? "Create Customer"
                  : "Update Customer"}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}