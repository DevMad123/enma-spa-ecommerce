import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initLocale, formatCurrency, formatDate, getCurrentCurrency, getCurrentCurrencySymbol, getLocaleConfig } from '@/Utils/LocaleUtils';
import { 
    PlusIcon, 
    XMarkIcon, 
    MagnifyingGlassIcon,
    CubeIcon,
    TagIcon,
    PhotoIcon,
    SwatchIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

export default function EditProduct({ product, categories, subcategories: initialSubcategories, brands, suppliers, colors, sizes }) {
    const { localeConfig } = usePage().props;
    if (import.meta.env.DEV) console.log('🔄 Composant EditProduct chargé');
    
    // État pour gérer l'initialisation de la locale
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    
    // Parser les attributs s'ils sont en format JSON string
    const parseAttributes = (attributes) => {
        if (!attributes) return [];
        if (typeof attributes === 'string') {
            try {
                return JSON.parse(attributes);
            } catch (e) {
                console.error('Erreur parsing attributs:', e);
                return [];
            }
        }
        return Array.isArray(attributes) ? attributes : [];
    };

    const parsedAttributes = parseAttributes(product.attributes);
    
    const [subcategories, setSubcategories] = useState(initialSubcategories || []);
    const [selectedColors, setSelectedColors] = useState([...new Set(parsedAttributes.map(attr => attr.color_id).filter(Boolean))] || []);
    const [selectedSizes, setSelectedSizes] = useState([...new Set(parsedAttributes.map(attr => attr.size_id).filter(Boolean))] || []);
    
    const [productType, setProductType] = useState(product.type || 'simple');
    const [variants, setVariants] = useState(product.variants || []);
    const [mainImagePreview, setMainImagePreview] = useState(
        product.image?.startsWith('http') ? product.image : `/${product.image}`
    );
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState(
        product.images?.map(img => img.image?.startsWith('http') ? img.image : `/${img.image}`) || []
    );
    // Tracker les images existantes (pour les différencier des nouvelles)
    const [existingImages, setExistingImages] = useState(
        product.images?.map(img => img.image) || []
    );
    const [showVariantSection, setShowVariantSection] = useState(product.type === 'variable');

    const { data, setData, post, processing, errors, reset } = useForm({
        type: product.type || 'simple',
        name: product.name || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        supplier_id: product.supplier_id || '',
        brand_id: product.brand_id || '',
        code: product.code || '',
        unit_type: product.unit_type || '',
        description: product.description || '',
        purchase_cost: product.current_purchase_cost || 0,
        sale_price: product.current_sale_price || 0,
        wholesale_price: product.wholesale_price || 0,
        wholesale_minimum_qty: product.wholesale_minimum_qty || 1,
        available_quantity: product.available_quantity || 0,
        discount_type: product.discount_type || 0,
        discount: product.discount || 0,
        is_trending: product.is_trending || false,
        is_popular: product.is_popular || false,
        status: product.status || 1,
        main_image: null,
        product_images: [],
        variants: product.variants || [],
        attributes: parsedAttributes,
        _method: 'PUT'
    });

    // Initialiser la configuration de locale DE SUITE et forcer un re-render
    useEffect(() => {
        if (localeConfig && Object.keys(localeConfig).length > 0) {
            initLocale(localeConfig);
            setIsLocaleInitialized(true); // Force un re-render
        }
    }, [localeConfig]);

    // Charger sous-catégories quand category change
    useEffect(() => {
        if (data.category_id) {
            fetch(route("admin.products.subcategories.byCategory", data.category_id), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            })
                .then((res) => {
                    // Vérifier que la réponse est bien du JSON
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error('La réponse n\'est pas du JSON valide');
                    }
                    return res.json();
                })
                .then((subs) => setSubcategories(subs || []))
                .catch(error => {
                    console.error('Erreur lors du chargement des sous-catégories:', error);
                    setSubcategories([]);
                });
        } else {
            setSubcategories([]);
            setData("subcategory_id", "");
        }
    }, [data.category_id]);

    // Gérer le changement de type de produit
    const handleTypeChange = (newType) => {
        setProductType(newType);
        setData('type', newType);
        setShowVariantSection(newType === 'variable');
        
        if (newType === 'simple') {
            setVariants([]);
            setData('variants', []);
        }
    };

    // Ajouter une variante
    const addVariant = () => {
        const newVariant = {
            id: Date.now(),
            sku: `${data.code}-VAR${variants.length + 1}`,
            color_id: '',
            size_id: '',
            purchase_cost: data.purchase_cost,
            sale_price: data.sale_price,
            available_quantity: 0,
            status: 1
        };
        setVariants([...variants, newVariant]);
    };

    // Supprimer une variante
    const removeVariant = (index) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        setVariants(updatedVariants);
    };

    // Mettre à jour une variante
    const updateVariant = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
    };

    // Générer des attributs pour produit simple
    useEffect(() => {
        if (productType === 'simple') {
            const attributes = [];
            selectedColors.forEach(colorId => {
                selectedSizes.forEach(sizeId => {
                    attributes.push({
                        color_id: colorId,
                        size_id: sizeId
                    });
                });
            });
            setData('attributes', attributes);
        }
    }, [selectedColors, selectedSizes, productType]);

    // Gérer les couleurs sélectionnées
    const handleColorChange = (colorId, checked) => {
        if (checked) {
            setSelectedColors([...selectedColors, colorId]);
        } else {
            setSelectedColors(selectedColors.filter(id => id !== colorId));
        }
    };

    // Gérer les tailles sélectionnées
    const handleSizeChange = (sizeId, checked) => {
        if (checked) {
            setSelectedSizes([...selectedSizes, sizeId]);
        } else {
            setSelectedSizes(selectedSizes.filter(id => id !== sizeId));
        }
    };

    // Gérer l'image principale
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('main_image', file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    // Gérer les images supplémentaires
    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData('product_images', files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            // Conserver les images existantes et ajouter les nouvelles
            const existingPreviews = existingImages.map(img => img.startsWith('http') ? img : `/${img}`);
            setAdditionalImagePreviews([...existingPreviews, ...newPreviews]);
        }
    };

    // Supprimer une image supplémentaire
    const removeAdditionalImage = (index) => {
        const updatedPreviews = additionalImagePreviews.filter((_, i) => i !== index);
        setAdditionalImagePreviews(updatedPreviews);
        
        // Si c'est une image existante, la retirer de la liste des images existantes
        if (index < existingImages.length) {
            const updatedExistingImages = existingImages.filter((_, i) => i !== index);
            setExistingImages(updatedExistingImages);
        }
    };

    // Supprimer l'image principale
    const removeMainImage = () => {
        setMainImagePreview(null);
        setData('main_image', null);
    };

    // Soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.name.trim()) {
            alert('Le nom du produit est requis');
            return;
        }

        // Préparer FormData pour l'upload de fichiers
        const formData = new FormData();
        
        // Ajouter tous les champs du formulaire
        Object.keys(data).forEach(key => {
            if (key === 'attributes' || key === 'variants') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'main_image' && data[key]) {
                formData.append(key, data[key]);
            } else if (key === 'product_images' && data[key].length > 0) {
                data[key].forEach((file, index) => {
                    formData.append(`product_images[${index}]`, file);
                });
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        // Ajouter les images existantes qui doivent être conservées
        existingImages.forEach((imagePath, index) => {
            formData.append(`existing_images[${index}]`, imagePath);
        });

        // Ajouter les variantes si produit variable
        if (productType === 'variable') {
            variants.forEach((variant, index) => {
                Object.keys(variant).forEach(key => {
                    formData.append(`variants[${index}][${key}]`, variant[key]);
                });
            });
        }

        // Envoyer via Inertia
        router.post(route('admin.products.update', product.id), formData, {
            onStart: () => {
                if (import.meta.env.DEV) console.log('🚀 Début de la requête PUT');
            },
            onSuccess: (data) => {
                if (import.meta.env.DEV) console.log('✅ Succès:', data);
                // Redirection automatique vers la vue du produit
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                if (import.meta.env.DEV) console.log('🏁 Requête terminée');
            }
        });
    };

    // Ne pas rendre tant que la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    return (
        <AdminLayout>
            <Head title={`Modifier - ${product.name}`} />

            <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        onClick={() => router.visit(route('admin.products.show', product.id))}
                        className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1" />
                        Retour au produit
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Informations de base */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <CubeIcon className="h-5 w-5 mr-2" />
                                Informations de base
                            </h2>
                            
                            <div className="space-y-4">
                                {/* Type de produit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de produit
                                    </label>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="simple"
                                                checked={productType === 'simple'}
                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                className="mr-2"
                                            />
                                            Produit simple
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="variable"
                                                checked={productType === 'variable'}
                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                className="mr-2"
                                            />
                                            Produit variable
                                        </label>
                                    </div>
                                </div>

                                {/* Nom du produit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du produit *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Entrez le nom du produit"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Code produit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Code produit (SKU)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ex: PROD-001"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                        placeholder="Description du produit"
                                    />
                                </div>

                                {/* Statut */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={1}>Actif</option>
                                        <option value={0}>Inactif</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Catégorisation */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <TagIcon className="h-5 w-5 mr-2" />
                                Catégorisation
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories?.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sous-catégorie
                                    </label>
                                    <select
                                        value={data.subcategory_id}
                                        onChange={(e) => setData('subcategory_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!data.category_id}
                                    >
                                        <option value="">Sélectionner une sous-catégorie</option>
                                        {subcategories?.map((subcategory) => (
                                            <option key={subcategory.id} value={subcategory.id}>
                                                {subcategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Marque
                                    </label>
                                    <select
                                        value={data.brand_id}
                                        onChange={(e) => setData('brand_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Sélectionner une marque</option>
                                        {brands?.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fournisseur
                                    </label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Sélectionner un fournisseur</option>
                                        {suppliers?.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.supplier_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Prix et stock */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <BanknotesIcon className="h-5 w-5 mr-2" />
                                Prix et stock
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix d'achat ({getCurrentCurrencySymbol()})
                                    </label>
                                    <input
                                        type="number"
                                        value={data.purchase_cost}
                                        onChange={(e) => setData('purchase_cost', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix de vente ({getCurrentCurrencySymbol()})
                                    </label>
                                    <input
                                        type="number"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix de gros ({getCurrentCurrencySymbol()})
                                    </label>
                                    <input
                                        type="number"
                                        value={data.wholesale_price}
                                        onChange={(e) => setData('wholesale_price', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantité minimale (gros)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.wholesale_minimum_qty}
                                        onChange={(e) => setData('wholesale_minimum_qty', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1"
                                        min="1"
                                    />
                                </div>

                                {productType === 'simple' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantité disponible
                                        </label>
                                        <input
                                            type="number"
                                            value={data.available_quantity}
                                            onChange={(e) => setData('available_quantity', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unité de mesure
                                    </label>
                                    <input
                                        type="text"
                                        value={data.unit_type}
                                        onChange={(e) => setData('unit_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="pièce, kg, litre..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Attributs (couleurs et tailles) - Produit simple uniquement */}
                        {productType === 'simple' && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <SwatchIcon className="h-5 w-5 mr-2" />
                                    Attributs
                                </h2>

                                {/* Couleurs */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleurs disponibles
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {colors?.map((color) => (
                                            <label key={color.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedColors.includes(color.id)}
                                                    onChange={(e) => handleColorChange(color.id, e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{color.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Tailles */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tailles disponibles
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {sizes?.map((size) => (
                                            <label key={size.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSizes.includes(size.id)}
                                                    onChange={(e) => handleSizeChange(size.id, e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{size.size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Variantes - Produit variable uniquement */}
                        {productType === 'variable' && showVariantSection && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <CubeIcon className="h-5 w-5 mr-2" />
                                        Variantes du produit
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addVariant}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Ajouter une variante
                                    </button>
                                </div>

                                {variants.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <CubeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p>Aucune variante définie</p>
                                        <p className="text-sm">Cliquez sur "Ajouter une variante" pour commencer</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {variants.map((variant, index) => (
                                            <div key={variant.id || index} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-medium text-gray-900">Variante {index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            SKU
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="SKU de la variante"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Couleur
                                                        </label>
                                                        <select
                                                            value={variant.color_id}
                                                            onChange={(e) => updateVariant(index, 'color_id', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="">Sélectionner</option>
                                                            {colors?.map((color) => (
                                                                <option key={color.id} value={color.id}>
                                                                    {color.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Taille
                                                        </label>
                                                        <select
                                                            value={variant.size_id}
                                                            onChange={(e) => updateVariant(index, 'size_id', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="">Sélectionner</option>
                                                            {sizes?.map((size) => (
                                                                <option key={size.id} value={size.id}>
                                                                    {size.size}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Prix d'achat ({getCurrentCurrencySymbol()})
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={variant.purchase_cost}
                                                            onChange={(e) => updateVariant(index, 'purchase_cost', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Prix de vente ({getCurrentCurrencySymbol()})
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={variant.sale_price}
                                                            onChange={(e) => updateVariant(index, 'sale_price', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Stock
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={variant.available_quantity}
                                                            onChange={(e) => updateVariant(index, 'available_quantity', parseInt(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Colonne droite */}
                    <div className="space-y-6">
                        
                        {/* Images */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <PhotoIcon className="h-5 w-5 mr-2" />
                                Images
                            </h2>

                            {/* Image principale */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image principale
                                </label>
                                
                                {mainImagePreview ? (
                                    <div className="relative">
                                        <img 
                                            src={mainImagePreview} 
                                            alt="Aperçu principal"
                                            className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeMainImage}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-sm text-gray-500 mb-2">Aucune image sélectionnée</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.avif"
                                    onChange={handleMainImageChange}
                                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            {/* Images supplémentaires */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Images supplémentaires
                                </label>
                                
                                {additionalImagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {additionalImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img 
                                                    src={preview} 
                                                    alt={`Aperçu ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeAdditionalImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                                >
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.avif"
                                    multiple
                                    onChange={handleAdditionalImagesChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Vous pouvez sélectionner plusieurs images
                                </p>
                            </div>
                        </div>

                        {/* Options avancées */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Options avancées</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        id="is_trending"
                                        type="checkbox"
                                        checked={data.is_trending}
                                        onChange={(e) => setData('is_trending', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_trending" className="ml-2 block text-sm text-gray-900">
                                        Produit tendance
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        id="is_popular"
                                        type="checkbox"
                                        checked={data.is_popular}
                                        onChange={(e) => setData('is_popular', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-900">
                                        Produit populaire
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de remise
                                    </label>
                                    <select
                                        value={data.discount_type}
                                        onChange={(e) => setData('discount_type', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={0}>Montant fixe ({getCurrentCurrencySymbol()})</option>
                                        <option value={1}>Pourcentage (%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Montant de la remise
                                    </label>
                                    <input
                                        type="number"
                                        value={data.discount}
                                        onChange={(e) => setData('discount', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Modification...' : 'Modifier le produit'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.visit(route('admin.products.show', product.id))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

