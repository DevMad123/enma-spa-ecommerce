# 🎨 DESIGN SYSTEM - Blog Sneakers Style 43einhalb

## 🎯 Philosophie du design

Le blog s'inspire du design épuré et moderne de **43einhalb.com** avec :
- Typographie forte et audacieuse
- Espaces généreux (whitespace)
- Noir & blanc dominants
- Hover effects subtils mais percutants
- Images pleine largeur immersives

---

## 🎨 Palette de couleurs

### Couleurs principales
```css
Noir :           #000000  (titres, accents, badges)
Blanc :          #FFFFFF  (backgrounds, texte sur fond sombre)
Gris foncé :     #374151  (texte principal)
Gris moyen :     #6B7280  (texte secondaire)
Gris clair :     #F9FAFB  (backgrounds alternés)
Gris border :    #E5E7EB  (bordures)
```

### Utilisation
- **Titres** : Noir pur (#000000)
- **Texte corps** : Gris foncé (#374151)
- **Meta** : Gris moyen (#6B7280)
- **Backgrounds** : Blanc + Gris très clair en alternance
- **Hover** : Noir → Gris foncé

---

## 📝 Typographie

### Font principale : Barlow

```css
font-family: 'Barlow', sans-serif;
```

**Poids utilisés :**
- Regular (400) → Corps de texte
- Medium (500) → Navigation, meta
- Semibold (600) → Sous-titres
- Bold (700) → Titres, CTA
- Black (900) → Super titres (optionnel)

### Tailles

#### Desktop
```
H1 (Hero) :       text-6xl (60px) font-bold uppercase
H2 (Page) :       text-4xl (36px) font-bold uppercase
H3 (Section) :    text-3xl (30px) font-bold
H4 (Card) :       text-xl (20px) font-bold
Body :            text-lg (18px) font-normal
Small :           text-sm (14px)
Tiny :            text-xs (12px)
```

#### Mobile
```
H1 (Hero) :       text-4xl (36px)
H2 (Page) :       text-3xl (30px)
H3 (Section) :    text-2xl (24px)
H4 (Card) :       text-lg (18px)
Body :            text-base (16px)
```

### Styles typographiques

```jsx
// Titres de section (uppercase, bold)
className="font-barlow text-4xl font-bold text-black uppercase"

// Corps de texte (lisible, aéré)
className="font-barlow text-lg text-gray-700 leading-relaxed"

// Meta informations
className="font-barlow text-sm text-gray-600"

// CTA / Boutons
className="font-barlow font-bold text-sm uppercase tracking-wide"
```

---

## 📐 Spacing & Layout

### Container
```jsx
// Max width standard
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Article content (plus étroit)
className="max-w-4xl mx-auto px-4"
```

### Sections
```jsx
// Spacing vertical
className="py-20"        // Sections principales
className="py-16"        // Sections secondaires
className="py-12"        // Petites sections
```

### Grids
```jsx
// Grid articles (responsive)
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"

// Gap standard
gap-8  → 32px
gap-6  → 24px
gap-4  → 16px
```

---

## 🖼️ Images

### Ratios recommandés

```
Hero (featured) :     16:9 ou 21:9  (1920x1080 ou plus)
Cover article :       16:9          (1200x675)
Thumbnail :           4:3           (800x600)
```

### Styles d'images

```jsx
// Image de card (avec hover)
className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"

// Hero image (pleine largeur)
className="w-full h-[70vh] object-cover"

// Image dans contenu
className="w-full my-8 rounded-none shadow-lg"
```

### Hover effects
```css
transform: scale(1.05);
opacity: 0.9;
transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🎯 Composants clés

### BlogCard

**Structure :**
```
┌─────────────────────────────┐
│ Image (h-64)                │  ← Hover: scale + opacity
│ + Badge catégorie           │
├─────────────────────────────┤
│ Titre (bold, uppercase)     │
│ Excerpt (gray-600)          │
├─────────────────────────────┤
│ Meta (date, read_time)      │  ← Border top
└─────────────────────────────┘
```

**Sizing :**
- Image : `h-64` (256px)
- Padding : `p-6`
- Arrondi : `rounded-none` (rectangles purs)

### BlogHero

**Structure :**
```
┌─────────────────────────────┐
│                             │
│    Image pleine largeur     │  ← 70vh height
│    + Gradient overlay       │
│                             │
│  ┌────────────────────┐     │
│  │ Badge catégorie    │     │
│  │ Titre (très grand) │     │
│  │ Excerpt            │     │
│  │ Meta + CTA →       │     │
│  └────────────────────┘     │
└─────────────────────────────┘
```

### Navigation catégories

```
[Tous (24)] [Culture (8)] [Guides (12)] [Drops (5)]
     ↓ Active (bg-black text-white)
```

**Scroll horizontal sur mobile avec :**
```css
overflow-x: auto;
scrollbar-width: none;  /* Firefox */
-ms-overflow-style: none;  /* IE */
::-webkit-scrollbar { display: none; }  /* Chrome */
```

---

## 🎭 Animations & Transitions

### Hover effects

```jsx
// Card hover
className="hover:shadow-xl transition-all duration-500"

// Image hover
className="group-hover:scale-105 transition-transform duration-700"

// Text hover
className="hover:text-gray-700 transition-colors"

// Arrow hover
className="group-hover:translate-x-1 transition-transform"
```

### Loading states (futur)

```jsx
// Skeleton
className="animate-pulse bg-gray-200"

// Fade in
className="animate-fade-in"
```

---

## 📱 Responsive Breakpoints

```css
sm:  640px   → Mobile large
md:  768px   → Tablet
lg:  1024px  → Desktop
xl:  1280px  → Large desktop
2xl: 1536px  → XL desktop
```

### Adaptations clés

```jsx
// Grid responsive
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Text responsive
text-4xl md:text-5xl lg:text-6xl

// Padding responsive
px-4 sm:px-6 lg:px-8

// Height responsive
h-[60vh] md:h-[70vh]
```

---

## 🔍 States & Interactions

### Hover
```jsx
// Black → Gray
hover:bg-gray-800
hover:text-gray-700

// Underline → No underline
hover:no-underline

// Scale
hover:scale-105
```

### Focus (accessibilité)
```jsx
focus:outline-none 
focus:ring-2 
focus:ring-black 
focus:ring-offset-2
```

### Active (navigation)
```jsx
// Catégorie active
bg-black text-white
```

---

## 🧩 Patterns de design

### Section Header Pattern
```jsx
<div className="flex items-end justify-between border-b border-gray-900 pb-6">
    <div>
        <h2 className="font-barlow text-5xl font-bold uppercase">
            Titre Section
        </h2>
        <p className="text-gray-600 mt-2">
            Description
        </p>
    </div>
    <Link className="flex items-center gap-2 bg-black text-white px-8 py-4">
        CTA <Arrow />
    </Link>
</div>
```

### Meta Info Pattern
```jsx
<div className="flex items-center gap-4 text-sm text-gray-600">
    <Icon />
    <span>Valeur</span>
    <span>•</span>
    <Icon />
    <span>Valeur</span>
</div>
```

### Badge Pattern
```jsx
<div className="bg-black text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
    Label
</div>
```

---

## ✅ Checklist Design

- [ ] Typographie : Barlow uniquement
- [ ] Couleurs : Noir/Blanc/Gris
- [ ] Espaces : py-20 pour sections
- [ ] Images : Sans arrondi (rounded-none)
- [ ] Hover : Scale + Opacity sur images
- [ ] Uppercase : Titres et badges
- [ ] Transitions : Duration 500-700ms
- [ ] Focus : Ring-2 ring-black
- [ ] Grid : 3 colonnes desktop, 1 mobile
- [ ] Badges : Position absolute top-4 left-4

---

## 🎬 Exemples de code complets

### Card complète

```jsx
<Link 
    href={route('blog.show', post.slug)}
    className="group block bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
>
    {/* Image */}
    <div className="relative h-64 overflow-hidden bg-gray-900">
        <img 
            src={post.cover_image}
            className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
        />
        <div className="absolute top-4 left-4 bg-black text-white px-4 py-1.5 text-xs font-barlow font-bold uppercase">
            {post.category.name}
        </div>
    </div>

    {/* Content */}
    <div className="p-6">
        <h3 className="font-barlow text-xl font-bold text-black mb-3 line-clamp-2">
            {post.title}
        </h3>
        <p className="text-gray-600 font-barlow mb-4 line-clamp-3">
            {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
            <span>{post.published_at}</span>
            <span>{post.read_time} min</span>
        </div>
    </div>
</Link>
```

---

**Design System inspiré de 43einhalb.com**  
Créé pour ENMA SPA - Janvier 2026
