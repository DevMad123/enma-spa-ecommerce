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
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function CreateProduct() {
    const { categories = [], suppliers = [], brands = [], colors = [], sizes = [], subcategories: initialSubcategories = [], localeConfig } = usePage().props;
    
    // État pour gérer l'initialisation de la locale
    const [isLocaleInitialized, setIsLocaleInitialized] = useState(false);
    const [subcategories, setSubcategories] = useState(initialSubcategories);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [productType, setProductType] = useState('simple');
    const [variants, setVariants] = useState([]);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
    const [showVariantSection, setShowVariantSection] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'simple',
        name: '',
        category_id: '',
        subcategory_id: '',
        supplier_id: '',
        brand_id: '',
        code: '',
        unit_type: '',
        description: '',
        purchase_cost: 0,
        sale_price: 0,
        wholesale_price: 0,
        wholesale_minimum_qty: 1,
        available_quantity: 0,
        discount_type: 0,
        discount: 0,
        is_trending: false,
        is_popular: false,
        main_image: null,
        product_images: [],
        variants: [],
        attributes: []
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
            // Utiliser la nouvelle route dans le contrôleur ProductController
            const url = route("admin.products.subcategories.byCategory", data.category_id);
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error(`Expected JSON, got ${contentType}`);
                    }
                    
                    return res.json();
                })
                .then((subs) => {
                    setSubcategories(subs || []);
                })
                .catch(error => {
                    // Fallback: essayer de récupérer toutes les sous-catégories depuis les props initiales
                    const filteredSubs = initialSubcategories.filter(sub => 
                        sub.category_id === parseInt(data.category_id)
                    );
                    setSubcategories(filteredSubs);
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
        
        if (newType === 'simple') {
            setVariants([]);
            setShowVariantSection(false);
            setData('variants', []);
        } else {
            setShowVariantSection(true);
        }
    };

    // Ajouter une variante
    const addVariant = () => {
        const newVariant = {
            color_id: '',
            size_id: '',
            sku: `${data.code || 'PROD'}-${variants.length + 1}`,
            purchase_cost: data.purchase_cost || 0,
            sale_price: data.sale_price || 0,
            wholesale_price: data.wholesale_price || 0,
            available_quantity: 0,
        };
        const updatedVariants = [...variants, newVariant];
        setVariants(updatedVariants);
        setData('variants', updatedVariants);
    };

    // Supprimer une variante
    const removeVariant = (index) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        setVariants(updatedVariants);
        setData('variants', updatedVariants);
    };

    // Mettre à jour une variante
    const updateVariant = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
        setData('variants', updatedVariants);
    };

    // Générer des attributs pour produit simple
    useEffect(() => {
        if (productType === 'simple') {
            const attributes = [];
            selectedColors.forEach(colorId => {
                selectedSizes.forEach(sizeId => {
                    attributes.push({
                        color_id: colorId,
                        size_id: sizeId,
                        stock: 0,
                        price: null,
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
            const reader = new FileReader();
            reader.onload = (e) => setMainImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Gérer les images supplémentaires
    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const currentImages = data.product_images || [];
        setData('product_images', [...currentImages, ...files]);
        
        // Créer les previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAdditionalImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Supprimer une image supplémentaire
    const removeAdditionalImage = (index) => {
        const updatedImages = data.product_images.filter((_, i) => i !== index);
        const updatedPreviews = additionalImagePreviews.filter((_, i) => i !== index);
        setData('product_images', updatedImages);
        setAdditionalImagePreviews(updatedPreviews);
    };

    // Supprimer l'image principale
    const removeMainImage = () => {
        setData('main_image', null);
        setMainImagePreview(null);
    };

    // Soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.name.trim()) {
            alert('Veuillez saisir le nom du produit');
            return;
        }

        if (!data.category_id) {
            alert('Veuillez sélectionner une catégorie');
            return;
        }

        // Préparer les données FormData
        const formData = new FormData();

        // Champs de base
        const simpleFields = [
            'type', 'name', 'category_id', 'subcategory_id', 'supplier_id', 'brand_id',
            'code', 'unit_type', 'description', 'purchase_cost', 'sale_price',
            'wholesale_price', 'wholesale_minimum_qty', 'available_quantity',
            'discount_type', 'discount'
        ];

        simpleFields.forEach(field => {
            const value = data[field];
            if (value !== undefined && value !== null) {
                if (typeof value === 'boolean') {
                    formData.append(field, value ? '1' : '0');
                } else {
                    formData.append(field, value);
                }
            }
        });

        // Booléens
        formData.append('is_trending', data.is_trending ? '1' : '0');
        formData.append('is_popular', data.is_popular ? '1' : '0');

        // Image principale
        if (data.main_image) {
            formData.append('main_image', data.main_image);
        }

        // Images supplémentaires
        if (data.product_images && data.product_images.length > 0) {
            data.product_images.forEach(image => {
                formData.append('product_images[]', image);
            });
        }

        // Variantes pour produit variable
        if (productType === 'variable' && variants.length > 0) {
            formData.append('variants', JSON.stringify(variants));
        }

        // Attributs pour produit simple
        if (productType === 'simple' && data.attributes.length > 0) {
            formData.append('attributes', JSON.stringify(data.attributes));
        }

        // Envoyer via Inertia
        router.post(route('admin.products.store'), formData, {
            onStart: () => {
                console.log('🚀 Début de la requête POST');
            },
            onSuccess: (data) => {
                console.log('✅ Succès:', data);
                // Redirection automatique vers la liste des produits
            },
            onError: (errors) => {
                console.error('❌ Erreurs:', errors);
            },
            onFinish: () => {
                console.log('🏁 Fin de la requête');
            }
        });
    };

    // Ne pas rendre tant que la locale n'est pas initialisée
    if (!isLocaleInitialized && localeConfig) {
        return <div>Chargement...</div>;
    }

    return (
        <AdminLayout>
            <Head title="Nouveau Produit" />

            <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        onClick={() => router.visit(route('admin.products.index'))}
                        className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-1" />
                        Retour aux produits
                    </button>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau produit</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Remplissez les informations du produit pour l'ajouter au catalogue.
                </p>
            </div>

            {/* Affichage des erreurs */}
            {errors && Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-red-800 font-medium mb-2">Erreurs de validation :</h4>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                        {Object.entries(errors).map(([field, messages]) => {
                            const fieldMessages = Array.isArray(messages) ? messages : [messages];
                            return fieldMessages.map((message, index) => (
                                <li key={`${field}-${index}`}>{message}</li>
                            ));
                        })}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Colonne principale - Informations du produit */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Informations de base */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <CubeIcon className="h-5 w-5 mr-2" />
                                Informations de base
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Type de produit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de produit
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="simple"
                                                checked={productType === 'simple'}
                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                className="mr-2"
                                            />
                                            Produit simple
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
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
                            </div>
                        </div>

                        {/* Prix et stock */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <TagIcon className="h-5 w-5 mr-2" />
                                Prix et stock
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Coût d'achat ({getCurrentCurrencySymbol()})
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
                                        Prix de vente ({getCurrentCurrencySymbol()}) *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.sale_price}
                                        onChange={(e) => setData('sale_price', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                        required
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

                            {/* Remise */}
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-md font-medium text-gray-900 mb-3">Remise</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type de remise
                                        </label>
                                        <select
                                            value={data.discount_type}
                                            onChange={(e) => setData('discount_type', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={0}>Aucune remise</option>
                                            <option value={1}>Pourcentage (%)</option>
                                            <option value={2}>Montant fixe</option>
                                        </select>
                                    </div>

                                    {data.discount_type > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valeur de la remise
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Couleurs et tailles */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <SwatchIcon className="h-5 w-5 mr-2" />
                                Couleurs et tailles
                            </h3>
                            
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
                                        <CubeIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>Aucune variante ajoutée</p>
                                        <p className="text-sm">Cliquez sur "Ajouter une variante" pour commencer</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-md font-medium text-gray-900">
                                                        Variante {index + 1}
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Couleur
                                                        </label>
                                                        <select
                                                            value={variant.color_id}
                                                            onChange={(e) => updateVariant(index, 'color_id', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Sélectionner une couleur</option>
                                                            {colors?.map((color) => (
                                                                <option key={color.id} value={color.id}>
                                                                    {color.color_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Taille
                                                        </label>
                                                        <select
                                                            value={variant.size_id}
                                                            onChange={(e) => updateVariant(index, 'size_id', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Sélectionner une taille</option>
                                                            {sizes?.map((size) => (
                                                                <option key={size.id} value={size.id}>
                                                                    {size.size_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            SKU
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="SKU de la variante"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Prix d'achat ({getCurrentCurrencySymbol()})
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={variant.purchase_cost}
                                                            onChange={(e) => updateVariant(index, 'purchase_cost', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                            value={variant.sale_price}
                                                            onChange={(e) => updateVariant(index, 'sale_price', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Stock disponible
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={variant.available_quantity}
                                                            onChange={(e) => updateVariant(index, 'available_quantity', parseInt(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {/* Images */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <PhotoIcon className="h-5 w-5 mr-2" />
                                Images du produit
                            </h3>

                            {/* Image principale */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image principale
                                </label>
                                {mainImagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={mainImagePreview}
                                            alt="Aperçu image principale"
                                            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeMainImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-2">
                                            <label className="cursor-pointer">
                                                <span className="text-blue-600 hover:text-blue-500">
                                                    Télécharger une image
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleMainImageChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, JPEG jusqu'à 10MB
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Images supplémentaires */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Images supplémentaires
                                </label>
                                <div className="space-y-4">
                                    {additionalImagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {additionalImagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Aperçu ${index + 1}`}
                                                        className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAdditionalImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <XMarkIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <label className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-500">
                                                Ajouter des images supplémentaires
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleAdditionalImagesChange}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Sélectionnez plusieurs images
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne latérale - Catégories et options */}
                    <div className="space-y-6">
                        
                        {/* Classification */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Classification</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie *
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories?.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {subcategories.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sous-catégorie
                                        </label>
                                        <select
                                            value={data.subcategory_id}
                                            onChange={(e) => setData('subcategory_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Sélectionner une sous-catégorie</option>
                                            {subcategories.map((subcategory) => (
                                                <option key={subcategory.id} value={subcategory.id}>
                                                    {subcategory.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

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
                                                {supplier.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Options avancées */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Options avancées</h3>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_trending}
                                        onChange={(e) => setData('is_trending', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Produit tendance</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_popular}
                                        onChange={(e) => setData('is_popular', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Produit populaire</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            Créer le produit
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.visit(route('admin.products.index'))}
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