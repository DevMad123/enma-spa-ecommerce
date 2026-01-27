# ✅ CHECKLIST DE VÉRIFICATION - Blog Sneakers

## 🎯 Installation de base

- [ ] Migrations exécutées (`php artisan migrate`)
- [ ] Seeder exécuté (`php artisan db:seed --class=BlogSeeder`)
- [ ] Storage linké (`php artisan storage:link`)
- [ ] Autoload mis à jour (`composer dump-autoload`)
- [ ] Cache nettoyé (`php artisan optimize:clear`)
- [ ] Assets compilés (`npm run build` ou `npm run dev`)

---

## 🔍 Tests fonctionnels

### Routes
- [ ] `/blog` → Affiche le listing des articles
- [ ] `/blog/sneaker-culture` → Affiche la catégorie
- [ ] `/blog/{slug}` → Affiche un article complet
- [ ] Erreur 404 sur slug invalide

### Homepage
- [ ] Section blog visible après les catégories
- [ ] 3 articles affichés
- [ ] Bouton "Voir tous les articles" fonctionnel
- [ ] Si aucun article : section masquée

### Header
- [ ] Lien "Blog" dans le menu desktop
- [ ] Lien "Blog" dans le menu mobile
- [ ] Navigation correcte vers `/blog`

### Page Index (/blog)
- [ ] Hero avec article featured (si existe)
- [ ] Navigation catégories sticky
- [ ] Barre de recherche fonctionnelle
- [ ] Tags populaires cliquables
- [ ] Grid responsive (3 cols desktop, 1 col mobile)
- [ ] Pagination si > 12 articles
- [ ] Compteur total articles correct

### Page Show (/blog/{slug})
- [ ] Image hero pleine largeur
- [ ] Breadcrumb fonctionnel
- [ ] Meta informations (date, read time, vues)
- [ ] Badge catégorie cliquable
- [ ] Contenu HTML formaté correctement
- [ ] Tags cliquables
- [ ] Bouton partage fonctionnel
- [ ] Articles liés affichés (3 max)
- [ ] Compteur de vues incrémenté

### Page Category
- [ ] Hero catégorie avec description
- [ ] Navigation catégories avec active state
- [ ] Articles filtrés par catégorie
- [ ] Pagination fonctionnelle

---

## 🎨 Design & UI

### Général
- [ ] Font Barlow partout
- [ ] Couleurs : Noir/Blanc/Gris uniquement
- [ ] Espaces généreux (py-20 sections)
- [ ] Design responsive sur mobile
- [ ] Pas d'éléments cassés sur mobile

### BlogCard
- [ ] Image sans arrondi (rounded-none)
- [ ] Hover scale + opacity sur image
- [ ] Badge catégorie en position absolute
- [ ] Titre en bold uppercase
- [ ] Excerpt limité à 3 lignes
- [ ] Meta border-top gris clair
- [ ] Shadow augmente au hover

### BlogHero
- [ ] Image pleine largeur (70vh)
- [ ] Overlay gradient noir
- [ ] Contenu positionné en bas
- [ ] Titre très grand (text-6xl)
- [ ] CTA blanc sur fond noir

### Navigation catégories
- [ ] Sticky au scroll
- [ ] Scroll horizontal sur mobile
- [ ] Scrollbar masquée
- [ ] Active state noir
- [ ] Compteur articles entre ()

### BlogPreviewSection (Homepage)
- [ ] Titre "Sneaker Culture" avec icône
- [ ] Border-bottom noire
- [ ] 3 cards en grid
- [ ] CTA desktop en haut à droite
- [ ] CTA mobile en bas centré

---

## 🔍 SEO

- [ ] Meta title personnalisé par page
- [ ] Meta description présente
- [ ] Open Graph tags (title, image, type)
- [ ] Article schema (published_at, author)
- [ ] Tags meta keywords
- [ ] URL canonique
- [ ] Images avec alt text

---

## 📱 Responsive

- [ ] Mobile (< 768px) : 1 colonne
- [ ] Tablet (768-1024px) : 2 colonnes
- [ ] Desktop (> 1024px) : 3 colonnes
- [ ] Navigation catégories scroll horizontal mobile
- [ ] Menu mobile avec lien Blog
- [ ] Hero height adaptative
- [ ] Text sizes responsive

---

## ⚡ Performance

- [ ] Images en lazy loading
- [ ] Pas de console errors
- [ ] Temps de chargement < 3s
- [ ] Smooth scroll
- [ ] Transitions fluides (0.5-0.7s)
- [ ] Pas de layout shift

---

## 🔐 Sécurité & Permissions

- [ ] Articles non publiés invisibles (sauf admin)
- [ ] Soft delete fonctionnel
- [ ] CSRF protection sur formulaires
- [ ] XSS protection (content escaped)
- [ ] Validation des inputs

---

## 📊 Data & Backend

### Modèles
- [ ] BlogPost : scopes (published, featured, recent)
- [ ] BlogPost : accesseurs (cover_image_url, seo_title)
- [ ] BlogPost : auto slug generation
- [ ] BlogPost : auto read_time calculation
- [ ] BlogCategory : scope active
- [ ] Relations fonctionnelles (category, author)

### Controller
- [ ] Pagination 12 articles/page
- [ ] Recherche fonctionne
- [ ] Filtrage par catégorie OK
- [ ] Filtrage par tag OK
- [ ] Compteur de vues incrémenté
- [ ] Articles liés (même catégorie)

### Seeder
- [ ] 4 catégories créées
- [ ] 4 articles créés
- [ ] Tags présents
- [ ] Read time calculé
- [ ] Published_at défini
- [ ] Featured article présent

---

## 🧪 Tests à effectuer manuellement

### Test 1 : Navigation complète
1. Accéder à la homepage
2. Cliquer sur un article de la section blog
3. Lire l'article complet
4. Cliquer sur un article lié
5. Revenir au listing via breadcrumb

### Test 2 : Recherche
1. Aller sur `/blog`
2. Chercher "sneaker"
3. Vérifier les résultats
4. Réinitialiser les filtres

### Test 3 : Catégories
1. Cliquer sur une catégorie
2. Vérifier le filtrage
3. Vérifier active state
4. Tester pagination si > 12 articles

### Test 4 : Responsive
1. Ouvrir DevTools
2. Tester Mobile (375px)
3. Tester Tablet (768px)
4. Tester Desktop (1920px)
5. Vérifier menu mobile

### Test 5 : Partage
1. Ouvrir un article
2. Cliquer sur bouton partage
3. Vérifier Web Share API ou copie URL

---

## 🚀 Prêt pour production

- [ ] Toutes les sections ci-dessus validées
- [ ] Aucune console error
- [ ] Performance OK (Lighthouse > 90)
- [ ] SEO OK (Lighthouse > 90)
- [ ] Accessibilité OK (Lighthouse > 90)
- [ ] Design pixel perfect
- [ ] Mobile parfait
- [ ] Documentation complète

---

## 📝 Notes

**Date de vérification :** _______________

**Vérificateur :** _______________

**Blockers identifiés :**
- 
- 
- 

**Améliorations futures :**
- 
- 
- 

---

**Checklist Blog Sneakers v1.0**  
ENMA SPA - Janvier 2026
