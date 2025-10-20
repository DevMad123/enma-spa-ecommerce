import React, { useEffect, useMemo, useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function CustomizationPage({ customization = null, products = [] }) {
  const { flash } = usePage().props;
  const [bannerPreview, setBannerPreview] = useState(customization?.hero_background_image || null);
  const [logoPreview, setLogoPreview] = useState(customization?.logo_image || null);
  const initialSlides = (customization?.slides || []).reduce((acc, s) => {
    acc[s.order - 1] = {
      order: s.order,
      enabled: !!s.enabled,
      product_id: s.product_id || '',
      tagline: s.tagline || '',
      background_image: null,
      preview: s.background_image || null,
    };
    return acc;
  }, [{ order: 1, enabled: false, product_id: '', tagline: '', background_image: null, preview: null }, { order: 2, enabled: false, product_id: '', tagline: '', background_image: null, preview: null }, { order: 3, enabled: false, product_id: '', tagline: '', background_image: null, preview: null }]);
  const [slidePreviews, setSlidePreviews] = useState(initialSlides.map(s => s.preview));
  const [message, setMessage] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, setData, processing , errors, post, transform } = useForm({
    hero_enabled: customization?.hero_enabled ?? false,
    hero_product_id: customization?.hero_product_id ?? '',
    hero_title: customization?.hero_title ?? '',
    hero_subtitle: customization?.hero_subtitle ?? '',
    hero_background_image: null,
    featured_section_enabled: customization?.featured_section_enabled ?? true,
    newsletter_enabled: customization?.newsletter_enabled ?? true,
    theme_color: customization?.theme_color ?? '',
    logo_image: null,
    slides: initialSlides.map(({ order, enabled, product_id, tagline }) => ({ order, enabled, product_id, tagline, background_image: null })),
  });

  useEffect(() => {
    if (flash?.success) {
      setMessage(flash.success);
      setTimeout(() => setMessage(''), 3000);
    }
  }, [flash]);

  // Debounce product search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(productSearch.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [productSearch]);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    return products.filter(p => (p.name || '').toLowerCase().includes(debouncedSearch));
  }, [products, debouncedSearch]);

  const toAbsolute = (p) => {
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    return `${window.location.origin}/${String(p).replace(/^\/+/, '')}`;
  };

  // Resynchroniser l'aperçu après retour/refresh
  useEffect(() => {
    setBannerPreview(customization?.hero_background_image ? toAbsolute(customization.hero_background_image) : null);
    setLogoPreview(customization?.logo_image ? toAbsolute(customization.logo_image) : null);
    const nextPreviews = (customization?.slides || []).reduce((acc, s) => {
      acc[s.order - 1] = s.background_image ? toAbsolute(s.background_image) : null;
      return acc;
    }, [null, null, null]);
    setSlidePreviews(prev => prev.map((p, idx) => nextPreviews[idx] ?? p));
  }, [customization]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Omettre les fichiers non sélectionnés pour éviter de nullifier les images existantes
    transform((form) => {
      const f = { ...form };
      if (!f.hero_background_image) delete f.hero_background_image;
      if (!f.logo_image) delete f.logo_image;
      if (Array.isArray(f.slides)) {
        f.slides = f.slides.map((s, idx) => {
          const copy = { ...s };
          if (!copy.background_image) delete copy.background_image;
          return copy;
        });
      }
      return f;
    });
    post(route('admin.customizations.update'), {
      forceFormData: true,
      onSuccess: () => { try { localStorage.removeItem('front_customizations_cache_v2'); } catch(_) {} },
    });
  };

  const onFileChange = (field, file) => {
    setData(field, file);
    if (file) {
      const url = URL.createObjectURL(file);
      if (field === 'hero_background_image') setBannerPreview(url);
      if (field === 'logo_image') setLogoPreview(url);
    }
  };

  const onSlideChange = (idx, key, value) => {
    const next = [...data.slides];
    next[idx] = { ...next[idx], [key]: value };
    setData('slides', next);
  };

  const onSlideImage = (idx, file) => {
    onSlideChange(idx, 'background_image', file);
    if (file) {
      const url = URL.createObjectURL(file);
      const nextPrev = [...slidePreviews];
      nextPrev[idx] = url;
      setSlidePreviews(nextPrev);
    }
  };

  return (
    <AdminLayout>
      <Head title="Personnalisation du site" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Personnalisation du site</h1>
          <p className="text-gray-600">Gérez l'apparence du front depuis le back-office</p>
          {message && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Hero Slides (max 3) */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Slides Hero (max 3)</h2>
              <p className="text-sm text-gray-500">Définissez jusqu'à 3 slides avec produit, image et accroche.</p>
            </div>
            <div className="p-6 space-y-6">
              {[0,1,2].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Slide {i+1}</h3>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!data.slides[i]?.enabled} onChange={(e) => onSlideChange(i, 'enabled', e.target.checked)} className="h-4 w-4" />
                      Activé
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                      <select value={data.slides[i]?.product_id || ''} onChange={(e) => onSlideChange(i, 'product_id', e.target.value || '')} className="w-full border rounded-lg px-3 py-2">
                        <option value="">— Aucun —</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accroche</label>
                      <input type="text" value={data.slides[i]?.tagline || ''} onChange={(e) => onSlideChange(i, 'tagline', e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Texte d'accroche..." />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image de fond</label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center px-4 py-2 bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200 whitespace-nowrap">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => onSlideImage(i, e.target.files[0])} />
                        <span>Choisir une image</span>
                      </label>
                      <div className="relative h-20 w-[360px] max-w-full overflow-hidden rounded-lg border bg-gray-50">
                        {slidePreviews[i] ? (
                          <img src={toAbsolute(slidePreviews[i])} alt={`Slide ${i+1}`} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">Aucun aperçu</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Hero section */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Section Hero</h2>
              <p className="text-sm text-gray-500">Contrôlez la grande bannière d'accueil</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center">
                <input
                  id="hero_enabled"
                  type="checkbox"
                  checked={!!data.hero_enabled}
                  onChange={(e) => setData('hero_enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="hero_enabled" className="ml-2 text-sm text-gray-700">Activer la section hero</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Produit à mettre en avant</label>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="mb-2 block w-full px-3 py-2 border rounded-lg border-gray-300"
                  />
                  <select
                    value={data.hero_product_id || ''}
                    onChange={(e) => setData('hero_product_id', e.target.value || null)}
                    className={`block w-full px-3 py-2 border rounded-lg ${errors.hero_product_id ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">— Aucun —</option>
                    {filteredProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.hero_product_id && <p className="text-sm text-red-600 mt-1">{errors.hero_product_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <input
                    type="text"
                    value={data.hero_title}
                    onChange={(e) => setData('hero_title', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg ${errors.hero_title ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Titre principal"
                  />
                  {errors.hero_title && <p className="text-sm text-red-600 mt-1">{errors.hero_title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                  <input
                    type="text"
                    value={data.hero_subtitle}
                    onChange={(e) => setData('hero_subtitle', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg ${errors.hero_subtitle ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Accroche"
                  />
                  {errors.hero_subtitle && <p className="text-sm text-red-600 mt-1">{errors.hero_subtitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image de fond (bannière)</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center px-4 py-2 bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200 whitespace-nowrap">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange('hero_background_image', e.target.files[0])} />
                      <span>Choisir une image</span>
                    </label>
                    <div className="relative h-24 w-[420px] max-w-full overflow-hidden rounded-lg border bg-gray-50">
                      {bannerPreview ? (
                        <img src={toAbsolute(bannerPreview)} alt="Hero preview" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">Aucun aperçu</div>
                      )}
                    </div>
                  </div>
                  {errors.hero_background_image && <p className="text-sm text-red-600 mt-1">{errors.hero_background_image}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Sections</h2>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center">
                <input type="checkbox" checked={!!data.featured_section_enabled} onChange={(e) => setData('featured_section_enabled', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Activer la section produits vedettes</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={!!data.newsletter_enabled} onChange={(e) => setData('newsletter_enabled', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Afficher la section newsletter</span>
              </label>
            </div>
          </div>

          {/* Thème & Logo */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Thème & Identité</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale (hex)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.theme_color || '#ffffff'}
                    onChange={(e) => setData('theme_color', e.target.value)}
                    className="h-10 w-14 border rounded"
                    aria-label="Sélecteur de couleur"
                  />
                  <input
                    type="text"
                    value={data.theme_color}
                    onChange={(e) => setData('theme_color', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg ${errors.theme_color ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="#111111"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format attendu: #RGB ou #RRGGBB</p>
                {errors.theme_color && <p className="text-sm text-red-600 mt-1">{errors.theme_color}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center px-4 py-2 bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200 whitespace-nowrap">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange('logo_image', e.target.files[0])} />
                    <span>Choisir un logo</span>
                  </label>
                  <div className="relative h-16 w-40 max-w-full overflow-hidden rounded-lg border bg-white">
                    {logoPreview ? (
                      <img src={toAbsolute(logoPreview)} alt="Logo preview" className="h-full w-full object-contain" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">Aucun aperçu</div>
                    )}
                  </div>
                </div>
                {errors.logo_image && <p className="text-sm text-red-600 mt-1">{errors.logo_image}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {processing ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <Link href={route('admin.settings.index')} className="text-sm text-gray-600 hover:text-gray-900 underline">← Revenir aux Paramètres</Link>
        </div>
      </div>
    </AdminLayout>
  );
}



