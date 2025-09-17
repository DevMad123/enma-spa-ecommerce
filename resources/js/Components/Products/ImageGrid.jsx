import React from "react";
import { HiOutlineX } from "react-icons/hi";
import ImageThumbnail from "./ImageThumbnail";

export default function ImageGrid({ data, setData, errors }) {
  // Ajout d'images
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setData("product_images", [...(data.product_images || []), ...files]);
  };

  // Définir une image comme principale
  const handleSetMain = (idx) => {
    const newMain = data.product_images[idx];
    setData("main_image", newMain);
  };

  // Supprimer
  const handleRemove = (idx) => {
    const newImgs = data.product_images.filter((_, i) => i !== idx);
    setData("product_images", newImgs);
    if (data.main_image && data.main_image === data.product_images[idx]) {
      setData("main_image", null);
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
          type="file"
          accept="image/*"
          onChange={e => {
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
              onClick={() => setData("main_image", null)}
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
              isMain={file === data.main_image}
              onSetMain={() => handleSetMain(idx)}
              onRemove={() => handleRemove(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}