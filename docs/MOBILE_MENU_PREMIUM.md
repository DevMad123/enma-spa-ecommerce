# MENU MOBILE PREMIUM - Documentation

## 🎯 Vue d'ensemble

Implémentation d'un **menu mobile premium** inspiré de wethenew.com, offrant une expérience utilisateur fluide et intuitive sur mobile (<768px).

## 📁 Composants créés

### 1. **MobileMenuOverlay.jsx**
Menu overlay plein écran avec navigation hiérarchique multi-niveaux.

**Emplacement :** `resources/js/Components/Frontend/MobileMenuOverlay.jsx`

**Caractéristiques :**
- ✅ Overlay plein écran (100vw x 100vh)
- ✅ Header fixe avec logo centré, bouton retour et fermeture
- ✅ Navigation par stack (historique des niveaux)
- ✅ Images pour toutes les catégories/sous-catégories
- ✅ Animations fluides (translateX)
- ✅ Swipe vers la gauche pour fermer
- ✅ Body scroll lock automatique
- ✅ Profondeur illimitée de catégories

**Props :**
```jsx
<MobileMenuOverlay
    isOpen={boolean}              // État d'ouverture
    onClose={function}            // Fonction de fermeture
    categories={array}            // Liste des catégories
    appName={string}              // Nom de l'application
    appSettings={object}          // Settings (logo, etc.)
/>
```

**Structure de données catégories :**
```javascript
{
    id: number,
    name: string,
    slug: string,
    parent_id: number | null,
    status: boolean,
    image_categorie: string,
    children: array // Construit automatiquement
}
```

---

### 2. **MobileBottomMenu.jsx**
Menu fixe en bas de l'écran avec 5 icônes.

**Emplacement :** `resources/js/Components/Frontend/MobileBottomMenu.jsx`

**Ordre exact des icônes :**
1. **Menu** (☰) - Ouvre le menu overlay
2. **Account** - Lien vers profil/connexion
3. **Search** 🔍 - CENTRAL, mis en avant (bouton floating)
4. **Wishlist** ❤️ - Avec badge compteur
5. **Cart** 🛒 - Avec badge compteur

**Caractéristiques :**
- ✅ Position fixed bottom
- ✅ Bouton Search central élevé et agrandi
- ✅ Badges dynamiques sur wishlist et cart
- ✅ Uniquement visible sur mobile (<768px)
- ✅ z-index élevé (9998)

**Props :**
```jsx
<MobileBottomMenu
    onMenuClick={function}        // Ouvre le menu overlay
    onSearchClick={function}      // Ouvre la recherche
    cartItemsCount={number}       // Compteur panier
    wishlistItemsCount={number}   // Compteur favoris
    auth={object}                 // Auth user
/>
```

---

### 3. **MobileSearchOverlay.jsx**
Overlay de recherche plein écran.

**Emplacement :** `resources/js/Components/Frontend/MobileSearchOverlay.jsx`

**Caractéristiques :**
- ✅ Overlay plein écran avec animation
- ✅ Auto-focus sur l'input
- ✅ Historique des recherches (localStorage)
- ✅ Suggestions populaires
- ✅ Gestion des recherches récentes
- ✅ Body scroll lock

**Props :**
```jsx
<MobileSearchOverlay
    isOpen={boolean}              // État d'ouverture
    onClose={function}            // Fonction de fermeture
/>
```

---

## 🔧 Intégration dans FrontendLayout

Le menu mobile a été intégré dans `FrontendLayout.jsx` :

```jsx
import MobileMenuOverlay from '@/Components/Frontend/MobileMenuOverlay';
import MobileBottomMenu from '@/Components/Frontend/MobileBottomMenu';
import MobileSearchOverlay from '@/Components/Frontend/MobileSearchOverlay';

// Dans le composant :
<MobileMenuOverlay
    isOpen={mobileMenuOpen}
    onClose={() => setMobileMenuOpen(false)}
    categories={categories}
    appName={appName}
    appSettings={appSettings}
/>

<MobileSearchOverlay
    isOpen={mobileSearchOpen}
    onClose={() => setMobileSearchOpen(false)}
/>

<MobileBottomMenu
    onMenuClick={() => setMobileMenuOpen(true)}
    onSearchClick={() => setMobileSearchOpen(true)}
    cartItemsCount={getTotalItems()}
    wishlistItemsCount={getWishlistTotalItems()}
    auth={auth}
/>
```

---

## 📱 Responsive

### Mobile (<768px)
- ✅ Bottom menu visible
- ✅ Header premium masqué
- ✅ Menu overlay actif
- ✅ Padding-bottom sur main (pb-20) pour éviter chevauchement

### Desktop & Tablette (≥768px)
- ✅ Header premium visible
- ✅ Bottom menu masqué
- ✅ Menu overlay désactivé
- ✅ MegaMenu classique actif

---

## 🎨 Animations & UX

### Animations implémentées
1. **Menu Overlay** : `translateX` depuis la gauche
2. **Search Overlay** : `translateY` depuis le haut + opacity
3. **Bottom Menu Search Button** : `scale` au hover
4. **Navigation entre niveaux** : Transition opacity (150ms)

### UX Features
- ✅ Swipe vers la gauche pour fermer le menu
- ✅ Body scroll lock quand overlay ouvert
- ✅ Auto-focus sur les inputs
- ✅ Historique de navigation (stack)
- ✅ Images optimisées avec lazy loading
- ✅ Badges compteurs animés

---

## 🔄 Flux de navigation

### Niveau racine
```
Menu
├─ Catégorie 1 (avec image) →
├─ Catégorie 2 (avec image) →
└─ Catégorie 3 (avec image) →
```

### Niveau 1 (sous-catégorie)
```
← Catégorie 1
├─ Sous-catégorie 1.1 (avec image) →
├─ Sous-catégorie 1.2 (avec image) →
└─ Sous-catégorie 1.3 (avec image)
```

### Navigation
- Clic sur catégorie avec enfants → Navigation vers niveau enfant
- Clic sur catégorie sans enfants → Redirection vers page catégorie
- Clic sur flèche retour → Pop du stack (niveau précédent)
- Clic sur ❌ → Fermeture complète

---

## 📦 Dépendances

### Packages NPM
- React
- @inertiajs/react
- @heroicons/react

### Hooks utilisés
- `useState` - Gestion des états
- `useEffect` - Lifecycle et side effects
- `useRef` - Références DOM

### Utils
- `route()` - Helper Inertia pour les routes

---

## 🎯 Points clés d'implémentation

### 1. Construction de l'arbre des catégories
```javascript
const buildCategoryTree = (categories) => {
    const activeCategories = categories.filter(cat => cat.status);
    const categoryMap = {};
    const rootCategories = [];

    // Créer un map
    activeCategories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, children: [] };
    });

    // Construire l'arbre
    activeCategories.forEach(cat => {
        if (cat.parent_id && categoryMap[cat.parent_id]) {
            categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
        } else {
            rootCategories.push(categoryMap[cat.id]);
        }
    });

    return rootCategories;
};
```

### 2. Gestion du stack de navigation
```javascript
const [navigationStack, setNavigationStack] = useState([]);
const [currentLevel, setCurrentLevel] = useState(null);

// Naviguer vers enfants
const navigateToCategory = (category) => {
    setNavigationStack([...navigationStack, currentLevel]);
    setCurrentLevel({
        title: category.name,
        items: category.children,
        categoryId: category.id
    });
};

// Retour niveau précédent
const navigateBack = () => {
    const previousLevel = navigationStack[navigationStack.length - 1];
    const newStack = navigationStack.slice(0, -1);
    setCurrentLevel(previousLevel);
    setNavigationStack(newStack);
};
```

### 3. Body scroll lock
```javascript
useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => {
        document.body.style.overflow = '';
    };
}, [isOpen]);
```

### 4. Swipe detection
```javascript
const [touchStart, setTouchStart] = useState(null);
const [touchEnd, setTouchEnd] = useState(null);

const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) onClose();
};
```

---

## 🚀 Fonctionnalités futures (optionnelles)

- [ ] Animation de transition entre niveaux (slide)
- [ ] Suggestions de recherche en temps réel
- [ ] Catégories favorites
- [ ] Mode sombre
- [ ] Filtres rapides dans le menu
- [ ] Animations plus complexes (Framer Motion)

---

## 🐛 Troubleshooting

### Le menu ne s'ouvre pas
- Vérifier que `mobileMenuOpen` est bien géré dans le state
- Vérifier les classes `md:hidden`

### Les images ne s'affichent pas
- Vérifier le chemin `/images/category-placeholder.jpg`
- Vérifier le champ `image_categorie` dans les données

### Le scroll est bloqué après fermeture
- Vérifier le cleanup dans `useEffect`
- S'assurer que `document.body.style.overflow = ''` est appelé

### Z-index conflicts
- Menu overlay : `z-[9999]`
- Bottom menu : `z-[9998]`
- Header : `z-50`

---

## ✅ Checklist de validation

- [x] Menu s'ouvre depuis le bottom menu
- [x] Navigation multi-niveaux fonctionne
- [x] Bouton retour visible uniquement si pas niveau racine
- [x] Images catégories affichées partout
- [x] Swipe to close fonctionne
- [x] Body scroll bloqué quand overlay ouvert
- [x] Bottom menu fixe en bas
- [x] Search button central mis en avant
- [x] Badges compteurs affichés
- [x] Responsive <768px uniquement
- [x] Animations fluides
- [x] Pas de scroll parasite

---

## 📝 Notes de développement

### Classes Tailwind importantes
```css
/* Menu Overlay */
fixed inset-0 z-[9999] md:hidden
transform transition-transform duration-300 ease-in-out

/* Bottom Menu */
md:hidden fixed bottom-0 left-0 right-0 z-[9998]

/* Search Button (central) */
-mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600

/* Header fixe dans overlay */
fixed top-0 left-0 right-0 h-16 bg-white border-b

/* Zone scrollable */
pt-16 pb-24 h-full overflow-y-auto
```

### Routes utilisées
- `frontend.shop.index` - Page boutique (avec search)
- `frontend.shop.category` - Page catégorie
- `frontend.wishlist.index` - Page favoris
- `cart.index` - Page panier
- `frontend.profile.index` - Page profil
- `login` / `register` - Auth

---

## 👨‍💻 Auteur

Implémentation réalisée selon les spécifications d'un menu mobile premium inspiré de wethenew.com.

**Date :** 2026-02-04

---

## 📄 Licence

Ce code fait partie du projet ENMA SPA E-commerce.
