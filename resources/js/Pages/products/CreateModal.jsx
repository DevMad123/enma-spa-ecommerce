import React, { useState } from "react";
import { Modal, Box } from "@mui/material";
import { useForm } from "@inertiajs/react";

export default function CreateModal({ open, onClose, categories, suppliers, brands, colors, sizes }) {
  const { data, setData, post, processing, reset } = useForm({
    name: "",
    category_id: "",
    subcategory_id: "",
    supplier_id: "",
    brand_id: "",
    color: [],
    size: [],
    description: "",
    current_purchase_cost: "",
    current_sale_price: "",
    current_wholesale_price: "",
    wholesale_minimum_qty: "",
    discount_type: "0",
    discount: "",
    is_trending: false,
    is_popular: false,
    product_img: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.products.store"), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="bg-white rounded-lg shadow-lg p-6"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "600px",
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700">Ajouter un produit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Entrez le nom du produit"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              value={data.category_id}
              onChange={(e) => setData("category_id", e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fournisseur */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
            <select
              value={data.supplier_id}
              onChange={(e) => setData("supplier_id", e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Sélectionnez un fournisseur</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.supplier_name}
                </option>
              ))}
            </select>
          </div>

          {/* Couleurs */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Couleurs</label>
            <select
              multiple
              value={data.color}
              onChange={(e) => setData("color", [...e.target.selectedOptions].map((o) => o.value))}
              className="w-full border rounded px-3 py-2"
            >
              {colors.map((color) => (
                <option key={color.id} value={color.name}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix d'achat</label>
              <input
                type="number"
                value={data.current_purchase_cost}
                onChange={(e) => setData("current_purchase_cost", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix de vente</label>
              <input
                type="number"
                value={data.current_sale_price}
                onChange={(e) => setData("current_sale_price", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image du produit</label>
            <input
              type="file"
              multiple
              onChange={(e) => setData("product_img", e.target.files)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-[#2c4656] to-[#23ad94] text-white rounded hover:opacity-90"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
