# 📰 ARCHITECTURE BLOG SNEAKERS - DOCUMENTATION COMPLÈTE

## 🎯 Vue d'ensemble

Système de blog intégré au site e-commerce ENMA SPA, inspiré du design 43einhalb.
Architecture scalable, SEO-optimisée et prête pour CMS futur.

---

## 📦 Structure des fichiers créés

### **Backend (Laravel)**

```
database/migrations/
├── 2026_01_27_000001_create_blog_categories_table.php
└── 2026_01_27_000002_create_blog_posts_table.php

app/Models/
├── BlogCategory.php
└── BlogPost.php

app/Http/Controllers/Frontend/
└── BlogController.php

database/seeders/
└── BlogSeeder.php
```

### **Frontend (React)**

```
resources/js/Components/Blog/
├── BlogCard.jsx              → Card article style 43einhalb
├── BlogHero.jsx              → Hero section article mis en avant
├── BlogCategories.jsx        → Navigation horizontale catégories
├── RelatedArticles.jsx       → Articles similaires
└── BlogPreviewSection.jsx    → Section blog homepage

resources/js/Pages/Frontend/Blog/
├── Index.jsx                 → Listing des articles
├── Show.jsx                  → Article complet
└── Category.jsx              → Articles par catégorie
```

---

## 🗄️ Structure de base de données

### **Table `blog_categories`**
```sql
- id (bigint)
- name (string)
- slug (string, unique)
- description (text, nullable)
- image (string, nullable)
- order (integer, default: 0)
- is_active (boolean, default: true)
- timestamps
```

### **Table `blog_posts`**
```sql
- id (bigint)
- title (string)
- slug (string, unique, indexed)
- excerpt (text)
- content (longText)
- cover_image (string)
- category_id (foreignId, nullable)
- author_id (foreignId)
- tags (json, nullable)
- views (integer, default: 0)
- read_time (integer, default: 5)
- published_at (timestamp, nullable, indexed)
- is_featured (boolean, default: false, indexed)
- seo_meta (json, nullable)
- timestamps
- soft_deletes
```

---

## 🔗 Routes disponibles

```php
GET /blog                           → Liste des articles
GET /blog/category/{slug}           → Articles d'une catégorie
GET /blog/{slug}                    → Article unique
```

**Noms de routes :**
- `blog.index`
- `blog.category`
- `blog.show`

---

## 🎨 Composants React - Guide d'utilisation

### **1. BlogCard**
Card article avec hover effects premium.

```jsx
import BlogCard from '@/Components/Blog/BlogCard';

<BlogCard 
    post={{
        id: 1,
        title: "Titre de l'article",
        slug: "titre-article",
        excerpt: "Résumé court...",
        cover_image: "/path/to/image.jpg",
        category: { name: "Culture", slug: "culture" },
        read_time: 5,
        views: 1200,
        published_at: "15 Jan 2026"
    }}
    featured={false}
/>
```

### **2. BlogHero**
Hero section pour article mis en avant (homepage ou listing).

```jsx
import BlogHero from '@/Components/Blog/BlogHero';

<BlogHero 
    post={featuredPost}
/>
```

### **3. BlogPreviewSection**
Section blog sur la homepage (3 derniers articles).

```jsx
import BlogPreviewSection from '@/Components/Blog/BlogPreviewSection';

<BlogPreviewSection 
    posts={blogPosts}
/>
```

### **4. BlogCategories**
Navigation horizontale des catégories (sticky).

```jsx
import BlogCategories from '@/Components/Blog/BlogCategories';

<BlogCategories 
    categories={categories}
    activeCategory={currentCategory}
/>
```

### **5. RelatedArticles**
Articles similaires (même catégorie).

```jsx
import RelatedArticles from '@/Components/Blog/RelatedArticles';

<RelatedArticles 
    posts={relatedPosts}
/>
```

---

## 🚀 Installation & Configuration

### **1. Lancer les migrations**

```bash
php artisan migrate
```

### **2. Créer des données de test**

```bash
php artisan db:seed --class=BlogSeeder
```

Cela créera :
- 4 catégories (Culture, Guides, Drops, Streetwear)
- 4 articles d'exemple avec contenu complet
- 1 utilisateur admin (si inexistant)

### **3. Compiler les assets**

```bash
npm run dev
# ou pour production
npm run build
```

### **4. Configuration du storage**

```bash
php artisan storage:link
```

---

## 📝 Créer un article (via Tinker ou back-office futur)

```php
use App\Models\BlogPost;
use App\Models\BlogCategory;

// Créer une catégorie
$category = BlogCategory::create([
    'name' => 'Sneaker Tech',
    'slug' => 'sneaker-tech',
    'description' => 'Technologies et innovations',
    'is_active' => true,
]);

// Créer un article
$post = BlogPost::create([
    'title' => 'Les nouvelles technologies dans les sneakers 2026',
    'excerpt' => 'Découvrez les innovations qui révolutionnent...',
    'content' => '<h2>Introduction</h2><p>Contenu HTML complet...</p>',
    'cover_image' => 'blog/tech-2026.jpg',
    'category_id' => $category->id,
    'author_id' => 1,
    'tags' => ['technologie', 'innovation', '2026'],
    'published_at' => now(),
    'is_featured' => true,
    'seo_meta' => [
        'title' => 'Technologies Sneakers 2026',
        'description' => 'Les dernières innovations',
        'keywords' => 'sneakers, tech, 2026',
    ],
]);
```

---

## 🎯 Fonctionnalités avancées

### **Scopes disponibles (Modèle BlogPost)**

```php
// Articles publiés uniquement
BlogPost::published()->get();

// Articles mis en avant
BlogPost::featured()->get();

// Articles récents (limite 3)
BlogPost::recent(3)->get();

// Articles d'une catégorie
BlogPost::inCategory('sneaker-culture')->get();
```

### **Accesseurs (Propriétés calculées)**

```php
$post->cover_image_url          // URL complète de l'image
$post->read_time_formatted      // "5 min"
$post->published_at_formatted   // "15 Jan 2026"
$post->seo_title               // Title SEO (fallback sur title)
$post->seo_description         // Description SEO (fallback sur excerpt)
```

### **Méthodes utiles**

```php
// Incrémenter les vues
$post->incrementViews();

// Le slug et read_time sont générés automatiquement
// via les événements boot() du modèle
```

---

## 🎨 Design System

### **Couleurs**
- Noir : `#000000` (titres, accents)
- Blanc : `#FFFFFF` (backgrounds)
- Gris texte : `#6B7280`
- Gris clair : `#F9FAFB` (backgrounds alternés)

### **Typographie**
- Font globale : **Barlow** (déjà configurée)
- Titres : `font-barlow font-bold uppercase`
- Corps : `font-barlow text-gray-600`

### **Spacing**
- Sections : `py-20`
- Gaps grids : `gap-8`
- Padding cards : `p-6` (normal) / `p-8` (featured)

---

## 📱 Responsive

Tous les composants sont **mobile-first** :
- Grid : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Hero : hauteurs adaptatives `h-[60vh] md:h-[70vh]`
- Navigation catégories : scroll horizontal sur mobile

---

## 🔍 SEO

### **Meta tags (Page Show.jsx)**
- Title personnalisé par article
- Description (excerpt)
- Open Graph (OG) tags
- Article schema (published_at, category, tags)

### **Sitemap (À créer)**
```php
// routes/web.php
Route::get('/sitemap.xml', [SitemapController::class, 'blog']);
```

### **URLs SEO-friendly**
- `/blog` → Listing
- `/blog/sneaker-culture` → Catégorie
- `/blog/comment-nettoyer-sneakers` → Article

---

## 🔐 Permissions futures (Admin)

Prévoir les permissions suivantes :
- `blog.view` → Voir les articles (tous)
- `blog.create` → Créer un article
- `blog.edit` → Modifier un article
- `blog.delete` → Supprimer un article
- `blog.publish` → Publier un article

---

## 🚧 Évolutions futures suggérées

### **Phase 2 - Admin CRUD**
- [ ] Interface admin pour gérer articles
- [ ] Upload d'images avec preview
- [ ] Éditeur WYSIWYG (TinyMCE ou Tiptap)
- [ ] Gestion des catégories
- [ ] Programmation de publications

### **Phase 3 - Features avancées**
- [ ] Système de commentaires
- [ ] Likes/favoris articles
- [ ] Partage social natif
- [ ] Newsletter automatique (nouveaux articles)
- [ ] Recherche full-text (Algolia/Meilisearch)

### **Phase 4 - Analytics**
- [ ] Tracking des vues par article
- [ ] Articles les plus lus
- [ ] Temps de lecture moyen
- [ ] Taux de rebond par article

---

## 📊 Intégration avec l'existant

### **Homepage**
Section blog ajoutée automatiquement après les catégories :
```jsx
{blogPosts && blogPosts.length > 0 && (
    <BlogPreviewSection posts={blogPosts} />
)}
```

### **Header**
Lien "Blog" ajouté dans le menu principal (desktop + mobile).

### **Footer**
À ajouter si souhaité :
```jsx
<Link href={route('blog.index')}>Blog</Link>
```

---

## 🎬 Démonstration

1. **Accédez au blog** : `http://localhost:8000/blog`
2. **Testez la recherche** : Barre de recherche en haut
3. **Filtrez par catégorie** : Cliquez sur une catégorie
4. **Consultez un article** : Cliquez sur une card
5. **Articles liés** : En bas de chaque article

---

## 🆘 Troubleshooting

### **Erreur "Table blog_posts doesn't exist"**
```bash
php artisan migrate
```

### **Images ne s'affichent pas**
```bash
php artisan storage:link
```

### **Route "blog.index" not found**
Vider le cache des routes :
```bash
php artisan route:clear
php artisan optimize:clear
```

### **Erreur React "Cannot read route"**
Vérifier que Ziggy est bien configuré :
```bash
npm run build
```

---

## 📞 Support

Pour toute question ou amélioration, consultez :
- `app/Models/BlogPost.php` → Logique métier
- `app/Http/Controllers/Frontend/BlogController.php` → Endpoints
- `resources/js/Pages/Frontend/Blog/Index.jsx` → UI principale

---

**Architecture créée le** : 27 janvier 2026  
**Stack** : Laravel 11 + React 18 + Inertia.js + Tailwind CSS  
**Inspiré de** : 43einhalb.com (design uniquement, pas de contenu)

✅ **Architecture 100% opérationnelle et prête pour CMS futur**
