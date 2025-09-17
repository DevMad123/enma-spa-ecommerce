import React, { useRef } from "react";
import { HiOutlineX } from "react-icons/hi";
import ImageThumbnail from "./ImageThumbnail";

export default function ImageGrid({ data, setData, errors }) {
  const mainImageInputRef = useRef(null); // Référence pour l'image principale
  const additionalImagesInputRef = useRef(null); // Référence pour les images additionnelles

  // Ajouter des images additionnelles
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setData("product_images", [...(data.product_images || []), ...files]);
    if (additionalImagesInputRef.current) {
      additionalImagesInputRef.current.value = ""; // Réinitialise le champ après ajout
    }
  };

  // Supprimer une image additionnelle
  const handleRemove = (idx) => {
    const newImgs = data.product_images.filter((_, i) => i !== idx);
    setData("product_images", newImgs);
  };

  // Supprimer l'image principale
  const handleRemoveMainImage = () => {
    setData("main_image", null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = ""; // Réinitialise le champ input
    }
  };

  return (
    <div>
      {/* Image principale */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image principale
        </label>
        <input
          ref={mainImageInputRef} // Référence pour réinitialiser
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) setData("main_image", file);
          }}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        {errors.main_image && (
          <p className="text-red-500 text-xs">{errors.main_image}</p>
        )}
        {data.main_image ? (
          <div className="w-full max-h-72 rounded overflow-hidden shadow relative">
            <img
              src={
                data.main_image instanceof File
                  ? URL.createObjectURL(data.main_image)
                  : data.main_image
              }
              alt="Image principale"
              className="object-contain w-full h-72 bg-gray-50"
            />
            <button
              type="button"
              onClick={handleRemoveMainImage}
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100"
              title="Supprimer"
            >
              <HiOutlineX className="w-5 h-5 text-red-600" />
            </button>
          </div>
        ) : (
          <div className="w-full h-40 flex items-center justify-center border-2 border-dashed rounded text-gray-400">
            Choisir une image principale
          </div>
        )}
      </div>

      {/* Images additionnelles */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Images additionnelles
        </label>
        <input
          ref={additionalImagesInputRef} // Référence pour réinitialiser
          type="file"
          multiple
          accept="image/*"
          onChange={handleAddImages}
          className="w-full border rounded px-3 py-2 mt-2"
        />
        {errors.product_images && (
          <p className="text-red-500 text-xs">{errors.product_images}</p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
          {data.product_images.map((file, idx) => (
            <ImageThumbnail
              key={idx}
              file={file}
              onRemove={() => handleRemove(idx)} // Supprime une image additionnelle
            />
          ))}
        </div>
      </div>
    </div>
  );
}
