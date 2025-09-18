import React, { useState, useEffect } from "react";
import { Modal, Box, IconButton, Tooltip } from "@mui/material";
import { useForm, usePage } from "@inertiajs/react";
import {
  HiOutlineX,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePencil,
} from "react-icons/hi";
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
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [attributes, setAttributes] = useState([]);

  // Synchroniser les données quand mode ou product changent
  useEffect(() => {
    if (mode === "edit" && product) {
      const attrColors = product.attributes
        ? product.attributes.map(a => String(a.color_id)).filter(Boolean)
        : [];
      const attrSizes = product.attributes
        ? product.attributes.map(a => String(a.size_id)).filter(Boolean)
        : [];

      setData({
        type: product.type || "simple",
        name: product.name || "",
        category_id: product.category_id || "",
        subcategory_id: product.subcategory_id || "",
        supplier_id: product.supplier_id || "",
        brand_id: product.brand_id || "",
        color: attrColors,
        size: attrSizes,
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

      // Optionnel : tu peux aussi garder les attributes entiers si tu veux reconstruire un tableau
      setAttributes(product.attributes || []);
    } else if (mode === "create") {
      reset();
      setAttributes([]);
    }
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

  // Synchroniser les couleurs/sizes sélectionnées en édition
  useEffect(() => {
    if (mode === "edit" && product && product.attributes) {
      setSelectedColors([
        ...new Set(product.attributes.map(attr => String(attr.color_id)).filter(Boolean))
      ]);
      setSelectedSizes([
        ...new Set(product.attributes.map(attr => String(attr.size_id)).filter(Boolean))
      ]);
      setAttributes(product.attributes.map(attr => ({
        color_id: String(attr.color_id),
        size_id: String(attr.size_id),
        stock: attr.stock,
        price: attr.price,
      })));
    } else if (mode === "create") {
      setSelectedColors([]);
      setSelectedSizes([]);
      setAttributes([]);
    }
  }, [mode, product]);

  // Générer les attributs à chaque changement de sélection
  useEffect(() => {
    const newAttributes = [];
    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        // Si déjà existant, garder stock/price sinon init
        const existing = attributes.find(
          a => a.color_id === color && a.size_id === size
        );
        newAttributes.push({
          color_id: color,
          size_id: size,
          stock: existing ? existing.stock : 0,
          price: existing ? existing.price : null,
        });
      });
    });
    setAttributes(newAttributes);
    // eslint-disable-next-line
  }, [selectedColors, selectedSizes]);

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "edit") {
      put(route("admin.products.update", product?.id), {
        data: {
          ...data,
          attributes,
        },
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }else{
      post(route("admin.products.store"), {
        data: {
          ...data,
          attributes,
        },
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  if (!open) return null;
  return (
  <Modal open={open} onClose={onClose} aria-labelledby="product-modal-title">
    <Box className="bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300 transform"
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
    <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
      <h2
      id="product-modal-title"
      className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"
      >
      {mode === "edit" ? (
        <>
        <HiOutlinePencil className="w-8 h-8 text-[#a68e55]" />
        Modifier le produit
        </>
      ) : (
        <>
        <HiOutlinePlus className="w-8 h-8 text-[#8c6c3c]" />
        Ajouter un produit
        </>
      )}
      </h2>
      <IconButton onClick={onClose} aria-label="Fermer le formulaire">
      <HiOutlineX className="w-7 h-7 text-gray-500 hover:text-gray-700 transition" />
      </IconButton>
    </div>

    {/* Formulaire */}
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Informations Générales */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations Générales</h3>
      <div className="space-y-6">
        {/* Type de produit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
                  Type de produit
                </label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                  required
                  disabled={mode === "edit"}
                >
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                </select>

                {mode === "edit" && (
                  <input type="hidden" name="type" value={data.type} />
                )}
              </div>
              {/* Nom + Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
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
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Détails du produit */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Détails et Stock</h3>
            <div className="space-y-6">
              {/* Catégorie + Sous-catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData("category_id", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
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
                  <label className="block text-sm font-medium text-gray-700">Sous-catégorie</label>
                  <select
                    value={data.subcategory_id}
                    onChange={(e) => setData("subcategory_id", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition disabled:bg-gray-200"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marque</label>
                  <select
                    value={data.brand_id}
                    onChange={(e) => setData("brand_id", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
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
                  <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                  <select
                    value={data.supplier_id}
                    onChange={(e) => setData("supplier_id", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
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
            </div>
          </div>

          {/* Section 3: Variantes (si type = variable) */}
          {data.type === "variable" ? (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Variantes
              </h3>
              <div className="space-y-4">
                {data.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-center p-4 border rounded-md bg-white shadow-sm"
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
                      )}
                      className="col-span-1 border border-gray-300 rounded-md px-3 py-2"
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
                      )}
                      className="col-span-1 border border-gray-300 rounded-md px-3 py-2"
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
                      )}
                      placeholder="SKU"
                      className="col-span-1 border border-gray-300 rounded-md px-3 py-2"
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
                      )}
                      placeholder="Prix achat"
                      className="col-span-1 border border-gray-300 rounded-md px-3 py-2"
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
                      )}
                      placeholder="Prix vente"
                      className="col-span-1 border border-gray-300 rounded-md px-3 py-2"
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
                      )}
                      placeholder="Quantité"
                      className="col-span-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <Tooltip title="Supprimer la variante" arrow>
                      <IconButton
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="col-span-1"
                      >
                        <HiOutlineTrash className="w-6 h-6 text-red-500 hover:text-red-700 transition" />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition shadow-sm"
              >
                <HiOutlinePlus className="w-5 h-5" />
                Ajouter une variante
              </button>
            </div>
          ) : (
          <>
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Prix et Stock</h3>
              {/* Prix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix achat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.purchase_cost}
                    onChange={(e) => setData("purchase_cost", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                    required={data.type === "simple"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix vente</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.sale_price}
                    onChange={(e) => setData("sale_price", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix gros</label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.wholesale_price}
                    onChange={(e) => setData("wholesale_price", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  />
                </div>
              </div>
              {/* Quantité + Unité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    type="number"
                    value={parseInt(data.available_quantity)}
                    onChange={(e) => setData("available_quantity", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unité</label>
                  <input
                    type="text"
                    value={data.unit_type}
                    onChange={(e) => setData("unit_type", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
            {/* Couleurs + Tailles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Couleurs</label>
                <div className="mt-1 flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <label key={c.id} className="flex items-center gap-1 cursor-pointer">
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
                        className="form-checkbox h-4 w-4 text-[#8c6c3c] rounded focus:ring-[#a68e55]"
                      />
                      <span className="text-gray-700">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <SizeCheckboxes sizes={sizes} data={data} setData={setData} />
            </div>
          </>
          )}

          {/* Section 4: Réduction et Attributs */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Réduction et Visibilité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de réduction</label>
                <select
                  value={data.discount_type}
                  onChange={(e) => setData("discount_type", e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                >
                  <option value="0">Montant fixe</option>
                  <option value="1">Pourcentage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valeur</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.discount}
                  onChange={(e) => setData("discount", e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-[#a68e55] focus:border-transparent transition"
                />
              </div>
            </div>
            {/* Checkboxes populaires */}
            <div className="mt-6 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_popular}
                  onChange={(e) => setData("is_popular", e.target.checked)}
                  className="form-checkbox h-4 w-4 text-[#8c6c3c] rounded focus:ring-[#a68e55]"
                />
                <span className="text-gray-700">Populaire</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_trending}
                  onChange={(e) => setData("is_trending", e.target.checked)}
                  className="form-checkbox h-4 w-4 text-[#8c6c3c] rounded focus:ring-[#a68e55]"
                />
                <span className="text-gray-700">Tendance</span>
              </label>
            </div>
          </div>

          {/* Gestion des images */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Images du produit</h3>
            <ImageGrid data={data} setData={setData} errors={errors} />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
