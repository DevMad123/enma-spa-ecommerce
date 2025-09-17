import React, { useState, useEffect } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import { useForm, usePage } from "@inertiajs/react";
import { HiOutlineX } from "react-icons/hi";
import clsx from "clsx";

// Palette
const COLORS = {
  gold: "#a68e55",
  brown: "#8c6c3c",
  black: "#040404",
  accent: "#23ad94",
  bg: "linear-gradient(180deg,#f7f3ee_0%,#e6d9c2_100%)",
};

// Ajoute cette fonction utilitaire pour retirer une image sélectionnée
function removeImageAtIndex(images, index) {
  const arr = [...images];
  arr.splice(index, 1);
  return arr;
}

export default function CreateModal({
  open,
  onClose,
  categories,
  suppliers,
  brands,
  colors,
  sizes,
}) {
  const { data, setData, post, processing, reset } = useForm({
    name: "",
    category_id: "",
    subcategory_id: "",
    supplier_id: "",
    brand_id: "",
    color: [],
    size: [],
    code: "",
    unit_type: "",
    description: "",
    current_purchase_cost: "",
    current_sale_price: "",
    previous_purchase_cost: "",
    previous_sale_price: "",
    current_wholesale_price: "",
    wholesale_minimum_qty: 1,
    previous_wholesale_price: "",
    available_quantity: 0,
    discount_type: "0",
    discount: 0,
    is_trending: false,
    is_popular: false,
    product_img: [],
    main_image: null,
    product_images: [],
  });

  const { errors } = usePage().props;
  const [success, setSuccess] = useState(null);

  const [subcategories, setSubcategories] = useState([]);

  // Quand la catégorie change, on charge les sous-catégories
  useEffect(() => {
    if (data.category_id) {
      fetch(route("admin.subcategories.byCategory", data.category_id))
        .then((res) => res.json())
        .then((subs) => setSubcategories(subs));
    } else {
      setSubcategories([]);
      setData("subcategory_id", "");
    }
  }, [data.category_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.products.store"), {
      onSuccess: (page) => {
        if (page.props.success) {
          setSuccess(page.props.success);
          reset();
          onClose();
          // Optionnel : tu peux déclencher une notification sur la page list.jsx ici
        }
      },
      onError: () => {
        // Le modal reste ouvert, les erreurs sont affichées automatiquement
      },
    });
  };

  const handleFileChange = (e) => {
    setData("product_img", Array.from(e.target.files));
  };

  // Nouvelle fonction pour retirer une image sélectionnée
  const handleRemoveImage = (idx) => {
    setData("product_img", removeImageAtIndex(data.product_img, idx));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="bg-white rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "95%",
          maxWidth: "850px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Ajouter un produit
          </h2>
          <IconButton onClick={onClose}>
            <HiOutlineX className="w-6 h-6 text-gray-600" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom du produit
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Nom du produit"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Code (SKU)
              </label>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData("code", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="AUTO ou manuel"
              />
            </div>
          </div>

          {/* Catégorie + Sous-catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sous-catégorie
              </label>
              <select
                value={data.subcategory_id}
                onChange={(e) => setData("subcategory_id", e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={!data.category_id}
              >
                <option value="">Sélectionnez</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand + Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marque
              </label>
              <select
                value={data.brand_id}
                onChange={(e) => setData("brand_id", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Sélectionnez</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fournisseur
              </label>
              <select
                value={data.supplier_id}
                onChange={(e) => setData("supplier_id", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Sélectionnez</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.supplier_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variantes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Couleurs
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <label key={c.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={c.id}
                      checked={data.color.includes(String(c.id))}
                      onChange={e => {
                        const val = String(c.id);
                        setData("color", e.target.checked
                          ? [...data.color, val]
                          : data.color.filter(v => v !== val)
                        );
                      }}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tailles
              </label>
              <select
                multiple
                value={data.size}
                onChange={(e) =>
                  setData(
                    "size",
                    [...e.target.selectedOptions].map((o) => o.value)
                  )
                }
                className="w-full border rounded px-3 py-2"
              >
                {sizes.map((s) => (
                  <option key={s.id} value={s.size}>
                    {s.size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix achat
              </label>
              <input
                type="number"
                step="0.01"
                value={data.current_purchase_cost}
                onChange={(e) =>
                  setData("current_purchase_cost", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix vente
              </label>
              <input
                type="number"
                step="0.01"
                value={data.current_sale_price}
                onChange={(e) =>
                  setData("current_sale_price", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix gros
              </label>
              <input
                type="number"
                step="0.01"
                value={data.current_wholesale_price}
                onChange={(e) =>
                  setData("current_wholesale_price", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Quantité + Unité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantité disponible
              </label>
              <input
                type="number"
                step="0.01"
                value={data.available_quantity}
                onChange={(e) =>
                  setData("available_quantity", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unité (kg, pcs, etc.)
              </label>
              <input
                type="text"
                value={data.unit_type}
                onChange={(e) => setData("unit_type", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Réduction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type de réduction
              </label>
              <select
                value={data.discount_type}
                onChange={(e) => setData("discount_type", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="0">Montant fixe</option>
                <option value="1">Pourcentage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Valeur de réduction
              </label>
              <input
                type="number"
                step="0.01"
                value={data.discount}
                onChange={(e) => setData("discount", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows="3"
            ></textarea>
          </div>

          {/* Image principale */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image principale
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setData("main_image", e.target.files[0])}
              className="w-full border rounded px-3 py-2"
            />
            {errors.main_image && (
              <p className="text-red-500 text-xs">{errors.main_image}</p>
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
              onChange={e => {
                if (e.target.files[0]) {
                  setData("product_images", [...(data.product_images || []), e.target.files[0]]);
                }
              }}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex flex-wrap gap-4 mt-4">
              {(data.product_images || []).map((file, idx) => {
                const url = file instanceof File ? URL.createObjectURL(file) : file;
                return (
                  <div key={idx} className="relative group w-24 h-24 rounded overflow-hidden border shadow">
                    <img src={url} alt={`Produit ${idx + 1}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setData("product_images", data.product_images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retirer cette image"
                    >
                      <HiOutlineX className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.is_popular}
                onChange={(e) => setData("is_popular", e.target.checked)}
              />
              <span>Populaire</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.is_trending}
                onChange={(e) => setData("is_trending", e.target.checked)}
              />
              <span>Tendance</span>
            </label>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
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
              className={clsx(
                "px-6 py-2 text-white rounded shadow",
                processing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#8c6c3c] to-[#a68e55] hover:opacity-90"
              )}
            >
              Ajouter
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
