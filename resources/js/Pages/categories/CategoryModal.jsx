import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Modal, Box, IconButton, Tooltip } from "@mui/material";
import { useForm, usePage } from "@inertiajs/react";
import { HiOutlineX, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import clsx from "clsx";

export default function CategoryModal({ open, onClose, mode = "create", category = null }) {
  const defaultData = {
    name: "",
    note: "",
    is_popular: false,
    status: true,
    main_image: null,
  };

  const { data, setData, post, put, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;

  // Synchroniser les données quand mode ou category changent
  useEffect(() => {
    if (mode === "edit" && category) {
      setData({
        name: category.name || "",
        note: category.note || "",
        is_popular: !!category.is_popular,
        status: !!category.status,
        main_image: category.image || null,
      });
    } else if (mode === "create") {
      reset();
    }
    // eslint-disable-next-line
  }, [mode, category]);

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Mode:", mode, "Category ID:", category?.id);
    console.log("Data main_image:", data.main_image);
    console.log("Is main_image a File?", data.main_image instanceof File);

    const hasMainFile = data.main_image instanceof File;

    if (mode === "edit" && category?.id) {
      // EDITION : route update AVEC id
      if (hasMainFile) {
        // Avec fichier : utiliser FormData
        const fd = new FormData();
        fd.append("name", data.name);
        fd.append("note", data.note || "");
        fd.append("is_popular", data.is_popular ? "1" : "0");
        fd.append("status", data.status ? "1" : "0");
        
        // Image principale - Envoyer seulement si c'est un nouveau fichier
        if (hasMainFile) {
          fd.append("image", data.main_image);
        }
        
        // Method override pour PUT
        fd.append("_method", "PUT");

        // Envoi via Inertia POST (ne PAS fixer Content-Type manuellement)
        router.post(route("admin.categories.update", category.id), fd, {
          onSuccess: () => { reset(); onClose(); },
          onError: (err) => { console.log("errors", err); },
        });
      } else {
        // Pas de fichiers, simple PUT
        const dataToSend = { ...data };
        
        // Ne pas envoyer l'image principale si ce n'est pas un nouveau fichier
        if (!(data.main_image instanceof File)) {
          delete dataToSend.main_image;
        }
        
        router.put(route("admin.categories.update", category.id), dataToSend, {
          onSuccess: () => { reset(); onClose(); },
          onError: (err) => { console.log("errors", err); },
        });
      }
    } else {
      // CREATION : route store SANS id
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("note", data.note || "");
      fd.append("is_popular", data.is_popular ? "1" : "0");
      fd.append("status", data.status ? "1" : "0");
      
      // Image principale
      if (hasMainFile) {
        fd.append("image", data.main_image);
      }

      // Envoi via Inertia POST
      router.post(route("admin.categories.store"), fd, {
        onSuccess: () => { reset(); onClose(); },
        onError: (err) => { console.log("errors", err); },
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
    <Modal open={open} onClose={handleClose} aria-labelledby="category-modal-title">
      <Box
        className="bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300 transform"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "95%",
          maxWidth: "700px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 id="category-modal-title" className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            {mode === "edit" ? (
              <>
                <HiOutlinePencil className="w-8 h-8 text-[#a68e55]" />
                Modifier la catégorie
              </>
            ) : (
              <>
                <HiOutlinePlus className="w-8 h-8 text-[#8c6c3c]" />
                Ajouter une catégorie
              </>
            )}
          </h2>
          <IconButton onClick={handleClose} aria-label="Fermer le formulaire">
            <HiOutlineX className="w-7 h-7 text-gray-500 hover:text-gray-700 transition" />
          </IconButton>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affichage des erreurs globales */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600">
                {Object.entries(errors).map(([key, error]) => (
                  <div key={key} className="mb-1">
                    <strong>{key}:</strong> {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Informations Générales */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations de la catégorie</h3>
            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la catégorie</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea
                  value={data.note}
                  onChange={(e) => setData("note", e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  rows="2"
                ></textarea>
              </div>

              {/* Checkbox Populaire */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.is_popular}
                  onChange={(e) => setData("is_popular", e.target.checked)}
                  className="form-checkbox h-4 w-4 text-[#8c6c3c] rounded focus:ring-[#a68e55]"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                  Catégorie populaire
                </label>
              </div>
            </div>
          </div>

          {/* Section: Image */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Image de la catégorie</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f3eadc] file:text-[#8c6c3c] hover:file:bg-[#e7d8c6] transition"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            
            {data.main_image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu de l'image:</p>
                {typeof data.main_image === "string" ? (
                  <img
                    src={`http://127.0.0.1:8000/${data.main_image}`}
                    alt="Current Category"
                    className="w-40 h-40 object-cover rounded-md shadow"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(data.main_image)}
                    alt="New Category"
                    className="w-40 h-40 object-cover rounded-md shadow"
                  />
                )}
              </div>
            )}
          </div>

          {/* Add Status Toggle before the buttons section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">État de la catégorie</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={data.status}
                onChange={(e) => setData("status", e.target.checked)}
                className="form-checkbox h-4 w-4 text-[#8c6c3c] rounded focus:ring-[#a68e55]"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Catégorie active
              </label>
            </div>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition shadow-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={processing}
              className={clsx(
                "px-8 py-2 text-white rounded-lg font-bold shadow-md transition-all duration-300",
                processing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#8c6c3c] to-[#a68e55] hover:opacity-90"
              )}
            >
              {processing ? (
                "Traitement..."
              ) : mode === "edit" ? (
                "Mettre à jour"
              ) : (
                "Créer"
              )}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}