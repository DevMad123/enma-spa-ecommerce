import React from "react";
import { useForm } from "@inertiajs/react";
import { Modal, Box } from "@mui/material";
import { 
  HiOutlineX, 
  HiOutlinePlus, 
  HiOutlinePencil,
  HiOutlineExclamationCircle 
} from "react-icons/hi";
import clsx from "clsx";

/**
 * Composant modal réutilisable pour les formulaires
 * 
 * @param {boolean} open - État d'ouverture de la modal
 * @param {function} onClose - Fonction de fermeture
 * @param {string} title - Titre de la modal
 * @param {string} mode - Mode 'create' ou 'edit'
 * @param {array} fields - Configuration des champs du formulaire
 * @param {object} initialData - Données initiales pour le mode édition
 * @param {string} submitRoute - Route pour la soumission
 * @param {function} onSuccess - Callback de succès
 * @param {object} errors - Erreurs de validation
 * @param {boolean} processing - État de traitement
 * @param {string} size - Taille de la modal: 'sm', 'md', 'lg', 'xl'
 */
export default function ModalForm({
  open,
  onClose,
  title,
  mode = "create",
  fields = [],
  initialData = {},
  submitRoute,
  onSuccess,
  errors = {},
  processing = false,
  size = "md"
}) {
  const { data, setData, post, put, reset } = useForm(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const options = {
      onSuccess: () => {
        reset();
        onClose();
        if (onSuccess) onSuccess();
      },
    };

    if (mode === "edit") {
      put(submitRoute, options);
    } else {
      post(submitRoute, options);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Configuration des tailles
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  // Rendu des champs selon leur type
  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      required = false,
      placeholder,
      options = [],
      className = "",
      helpText,
      validation = {}
    } = field;

    const fieldError = errors[name];
    const fieldValue = data[name] || "";

    const baseInputClasses = clsx(
      "w-full px-4 py-3 border rounded-xl transition-all duration-200",
      "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      "placeholder-gray-400 text-gray-900",
      fieldError 
        ? "border-red-300 bg-red-50" 
        : "border-gray-300 bg-white hover:border-gray-400",
      className
    );

    switch (type) {
      case "textarea":
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              rows={4}
              value={fieldValue}
              onChange={(e) => setData(name, e.target.value)}
              className={baseInputClasses}
              placeholder={placeholder}
              required={required}
              {...validation}
            />
            {helpText && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-600 flex items-center">
                <HiOutlineExclamationCircle className="h-4 w-4 mr-1" />
                {fieldError}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={fieldValue}
              onChange={(e) => setData(name, e.target.value)}
              className={baseInputClasses}
              required={required}
              {...validation}
            >
              <option value="">{placeholder || `Sélectionner ${label.toLowerCase()}`}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {helpText && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-600 flex items-center">
                <HiOutlineExclamationCircle className="h-4 w-4 mr-1" />
                {fieldError}
              </p>
            )}
          </div>
        );

      case "color":
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={fieldValue || "#000000"}
                onChange={(e) => setData(name, e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={fieldValue}
                onChange={(e) => setData(name, e.target.value)}
                className={clsx(baseInputClasses, "flex-1")}
                placeholder={placeholder || "#000000"}
                pattern="^#[0-9A-Fa-f]{6}$"
                {...validation}
              />
            </div>
            {helpText && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-600 flex items-center">
                <HiOutlineExclamationCircle className="h-4 w-4 mr-1" />
                {fieldError}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => setData(name, e.target.files[0])}
              className={baseInputClasses}
              accept={validation.accept}
              required={required}
            />
            {helpText && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-600 flex items-center">
                <HiOutlineExclamationCircle className="h-4 w-4 mr-1" />
                {fieldError}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={type}
              value={fieldValue}
              onChange={(e) => setData(name, e.target.value)}
              className={baseInputClasses}
              placeholder={placeholder}
              required={required}
              {...validation}
            />
            {helpText && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-600 flex items-center">
                <HiOutlineExclamationCircle className="h-4 w-4 mr-1" />
                {fieldError}
              </p>
            )}
          </div>
        );
    }
  };

  if (!open) return null;

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <Box className={clsx(
        "bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden",
        sizeClasses[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              {mode === "create" ? (
                <HiOutlinePlus className="h-6 w-6 text-blue-600" />
              ) : (
                <HiOutlinePencil className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">
                {mode === "create" ? "Ajouter un nouvel élément" : "Modifier l'élément"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        {/* Affichage des erreurs globales */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <HiOutlineExclamationCircle className="h-5 w-5 text-red-500 mr-2" />
              <h4 className="font-semibold text-red-800">Veuillez corriger les erreurs suivantes :</h4>
            </div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-red-700">
              {Object.entries(errors).map(([field, messages]) => (
                <li key={field}>
                  <strong>{field} :</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {fields.map(renderField)}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            disabled={processing}
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={processing}
            className={clsx(
              "px-8 py-2.5 rounded-xl font-semibold transition-all duration-200",
              processing
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            )}
          >
            {processing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Traitement...
              </div>
            ) : (
              mode === "create" ? "Créer" : "Mettre à jour"
            )}
          </button>
        </div>
      </Box>
    </Modal>
  );
}