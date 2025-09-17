import React from "react";
import { HiOutlineX } from "react-icons/hi";

export default function ImageThumbnail({ file, isMain, onSetMain, onRemove }) {
  const url = file instanceof File ? URL.createObjectURL(file) : file;

  return (
    <div className="relative group w-24 h-24 rounded overflow-hidden border shadow">
      <img src={url} alt="Preview" className="object-cover w-full h-full" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Supprimer"
      >
        <HiOutlineX className="w-5 h-5 text-red-600" />
      </button>
      {!isMain && (
        <button
          type="button"
          onClick={onSetMain}
          className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
        >
          Définir
        </button>
      )}
      {isMain && (
        <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Principale
        </span>
      )}
    </div>
  );
}
