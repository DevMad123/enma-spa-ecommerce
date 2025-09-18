import React, { useState, useEffect } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import { useForm, usePage } from "@inertiajs/react";
import { HiOutlineX } from "react-icons/hi";
import clsx from "clsx";
import ImageGrid from "@/Components/Products/ImageGrid";
import SizeCheckboxes from "@/Components/Products/SizeCheckboxes";

export default function ProductModal({
  open,
  onClose,
  mode = "create",
  product = null,
  categories,
  suppliers,
  brands,
  colors,
  sizes,
}) {
  const defaultData = {
    type: "simple",
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
    purchase_cost: "",
    sale_price: "",
    wholesale_price: "",
    wholesale_minimum_qty: 1,
    available_quantity: 0,
    discount_type: "0",
    discount: 0,
    is_trending: false,
    is_popular: false,
    main_image: null,
    product_images: [],
    variants: [],
  };

  const { data, setData, post, put, processing, reset } = useForm(defaultData);
  const { errors } = usePage().props;
  const [subcategories, setSubcategories] = useState([]);

  // Synchroniser les données quand mode ou product changent
  useEffect(() => {
    if (mode === "edit" && product) {
      setData({
        type: product.type || "simple",
        name: product.name || "",
        category_id: product.category_id || "",
        subcategory_id: product.subcategory_id || "",
        supplier_id: product.supplier_id || "",
        brand_id: product.brand_id || "",
        color: product.color
          ? Array.isArray(product.color)
            ? product.color
            : String(product.color).split(",")
          : [],
        size: product.size
          ? Array.isArray(product.size)
            ? product.size
            : String(product.size).split(",")
          : [],
        code: product.code || "",
        unit_type: product.unit_type || "",
        description: product.description || "",
        purchase_cost: product.current_purchase_cost || "",
        sale_price: product.current_sale_price || "",
        wholesale_price: product.current_wholesale_price || "",
        wholesale_minimum_qty: product.wholesale_minimum_qty || 1,
        available_quantity: product.available_quantity || 0,
        discount_type: product.discount_type || "0",
        discount: product.discount || 0,
        is_trending: !!product.is_trending,
        is_popular: !!product.is_popular,
        main_image: product.image_path || null,
        product_images: product.images ? product.images.map(img => img.image) : [],
        variants: product.variants || [],
      });
    } else if (mode === "create") {
      reset();
    }
    console.log(product);
    console.log(data);
    // eslint-disable-next-line
  }, [mode, product]);

  // Charger sous-catégories quand category change
  useEffect(() => {
    if (data.category_id) {
      fetch(route("admin.subcategories.byCategory", data.category_id))
        .then((res) => res.json())
        .then((subs) => setSubcategories(subs));
    } else {
      setSubcategories([]);
      setData("subcategory_id", "");
    }
    // eslint-disable-next-line
  }, [data.category_id]);

  // Ajouter une variante
  const addVariant = () => {
    setData("variants", [
      ...data.variants,
      {
        color_id: "",
        size_id: "",
        sku: "",
        purchase_cost: "",
        sale_price: "",
        wholesale_price: "",
        available_quantity: "",
      },
    ]);
  };

  // Supprimer une variante
  const removeVariant = (index) => {
    const updatedVariants = data.variants.filter((_, i) => i !== index);
    setData("variants", updatedVariants);
  };

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "create") {
      post(route("admin.products.store"), {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else if (mode === "edit" && product) {
      put(route("admin.products.update", product.id), {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  if (!open) return null;
//   console.log(data.color);
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="product-modal-title">
      <Box
        className="bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "95%",
          maxWidth: "900px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2
            id="product-modal-title"
            className="text-2xl font-bold text-gray-800"
          >
            {mode === "edit" ? "Modifier le produit" : "Ajouter un produit"}
          </h2>
          <IconButton onClick={onClose} aria-label="Fermer le formulaire">
            <HiOutlineX className="w-6 h-6 text-gray-600" />
          </IconButton>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de produit
            </label>
            <select
              value={data.type}
              onChange={(e) => setData("type", e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              disabled={mode === "edit"}
            >
              <option value="simple">Simple</option>
              <option value="variable">Variable</option>
            </select>
          </div>

          {/* Variantes (si type = variable) */}
          {data.type === "variable" && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Variantes
              </h3>
              {data.variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 gap- items-center mb-4"
                >
                  <select
                    value={variant.color_id}
                    onChange={(e) =>
                      setData(
                        "variants",
                        data.variants.map((v, i) =>
                          i === index
                            ? { ...v, color_id: e.target.value }
                            : v
                        )
                      )
                    }
                    className="col-span-1 border rounded px-3 py-2"
                  >
                    <option value="">Couleur</option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={variant.size_id}
                    onChange={(e) =>
                      setData(
                        "variants",
                        data.variants.map((v, i) =>
                          i === index
                            ? { ...v, size_id: e.target.value }
                            : v
                        )
                      )
                    }
                    className="col-span-1 border rounded px-3 py-2"
                  >
                    <option value="">Taille</option>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.size}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) =>
                      setData(
                        "variants",
                        data.variants.map((v, i) =>
                          i === index ? { ...v, sku: e.target.value } : v
                        )
                      )
                    }
                    placeholder="SKU"
                    className="col-span-1 border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    value={variant.purchase_cost}
                    onChange={(e) =>
                      setData(
                        "variants",
                        data.variants.map((v, i) =>
                          i === index
                            ? { ...v, purchase_cost: e.target.value }
                            : v
                        )
                      )
                    }
                    placeholder="Prix achat"
                    className="col-span-1 border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    value={variant.sale_price}
                    onChange={(e) =>
                      setData(
                        "variants",
                        data.variants.map((v, i) =>
                          i === index
                            ? { ...v, sale_price: e.target.value }
                            : v
                        )
                      )
                    }
                    placeholder="Prix vente"
                    className="col-span-1 border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    value={variant.available_quantity}
                    onChange={(e) =>
                      setData(
                        "variants",
                        data.variants.map((v, i) =>
                          i === index
                            ? { ...v, available_quantity: e.target.value }
                            : v
                        )
                      )
                    }
                    placeholder="Quantité disponible"
                    className="col-span-1 border rounded px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="col-span-1 text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Ajouter une variante
              </button>
            </div>
          )}

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
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-brown-500"
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
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-brown-500"
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
                <option value="">Sélectionnez</option>
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

          {/* Couleurs */}
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
                    onChange={(e) => {
                      const val = String(c.id);
                      setData(
                        "color",
                        e.target.checked
                          ? [...data.color, val]
                          : data.color.filter((v) => v !== val)
                      );
                    }}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tailles */}
          <SizeCheckboxes sizes={sizes} data={data} setData={setData} />

          {/* Prix */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix achat
              </label>
              <input
                type="number"
                step="0.01"
                value={data.purchase_cost}
                onChange={(e) =>
                  setData("purchase_cost", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
                required={data.type === "simple"}
                disabled={data.type === "variable"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix vente
              </label>
              <input
                type="number"
                step="0.01"
                value={data.sale_price}
                onChange={(e) => setData("sale_price", e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={data.type === "variable"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix gros
              </label>
              <input
                type="number"
                step="0.01"
                value={data.wholesale_price}
                onChange={(e) =>
                  setData("wholesale_price", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
                disabled={data.type === "variable"}
              />
            </div>
          </div>

          {/* Quantité + Unité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantité
              </label>
              <input
                type="number"
                value={data.available_quantity}
                onChange={(e) => setData("available_quantity", e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={data.type === "variable"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unité
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
                Valeur
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

          {/* Gestion des images */}
          <ImageGrid data={data} setData={setData} errors={errors} />

          {/* Checkboxes populaires */}
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
                "px-6 py-2 text-white rounded shadow transition",
                processing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#8c6c3c] to-[#a68e55] hover:opacity-90"
              )}
            >
              {mode === "edit" ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}