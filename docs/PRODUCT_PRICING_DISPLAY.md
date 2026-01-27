# Affichage des Prix avec Réductions - Documentation

## Vue d'ensemble

Ce document explique comment les prix avec réductions sont calculés et affichés pour les produits simples et variables dans l'application e-commerce.

## Structure de la Base de Données

### Table `products`
- `current_sale_price` : Prix de vente actuel (prix de base)
- `discount_type` : Type de réduction (0 = montant fixe €, 1 = pourcentage %)
- `discount` : Valeur de la réduction (montant ou pourcentage)
- `calculated_final_price` : Prix final calculé après réduction (optionnel, calculé côté serveur)
- `has_discount` : Booléen indiquant si le produit a une réduction active

### Table `product_variants`
- `sale_price` : Prix de vente du variant (avant réduction)
- Les variants héritent du `discount_type` et `discount` du produit parent

## Logique de Calcul des Prix

### Formule de Réduction

```javascript
// Fonction pour appliquer la réduction
function calculateDiscountedPrice(variantPrice, product) {
  const price = parseFloat(variantPrice || 0);
  if (price <= 0) return 0;

  const hasDiscount = product.has_discount || (product.discount && parseFloat(product.discount) > 0);
  if (!hasDiscount) return price;

  const discountValue = parseFloat(product.discount || 0);
  const discountType = product.discount_type; // 0 = fixe, 1 = pourcentage

  if (discountType === 1) { // Pourcentage
    return price - (price * (discountValue / 100));
  } else { // Montant fixe
    return Math.max(0, price - discountValue);
  }
}
```

### Exemples de Calcul

#### Réduction par Pourcentage (discount_type = 1)
- Prix original : 50 000 FCFA
- Réduction : 20%
- Prix final : 50 000 - (50 000 × 0,20) = **40 000 FCFA**

#### Réduction par Montant Fixe (discount_type = 0)
- Prix original : 50 000 FCFA
- Réduction : 5 000 FCFA
- Prix final : 50 000 - 5 000 = **45 000 FCFA**

## Affichage Frontend

### Produits Simples (sans variants)

**Avec réduction :**
```jsx
<span className="text-lg text-gray-500 line-through">50 000 FCFA</span>
<span className="text-2xl font-bold text-red-600">40 000 FCFA</span>
```

**Sans réduction :**
```jsx
<span className="text-2xl font-semibold text-gray-900">50 000 FCFA</span>
```

### Produits Variables (avec variants)

#### Logique d'Affichage Dynamique

1. **Aucune sélection** : Affiche le prix minimum avec réduction parmi tous les variants
   ```
   Prix original min (barré) → Prix réduit min
   ```

2. **Couleur sélectionnée uniquement** : Affiche le prix minimum des variants de cette couleur
   ```
   Prix original min pour la couleur (barré) → Prix réduit min pour la couleur
   ```

3. **Taille sélectionnée uniquement** : Affiche le prix minimum des variants de cette taille
   ```
   Prix original min pour la taille (barré) → Prix réduit min pour la taille
   ```

4. **Couleur ET Taille sélectionnées** : Affiche le prix exact du variant sélectionné
   ```
   Prix original du variant (barré) → Prix réduit du variant
   ```

## Implémentation dans Show.jsx

### Fonctions Clés

#### 1. `calculateDiscountedPrice(variantPrice)`
Calcule le prix avec réduction pour un variant donné en appliquant le discount du produit parent.

#### 2. `minVariantPrice`
Calcule le prix minimum avec réduction parmi tous les variants.

#### 3. `minPriceForColor`
Calcule le prix minimum avec réduction pour une couleur sélectionnée.

#### 4. `minPriceForSize`
Calcule le prix minimum avec réduction pour une taille sélectionnée.

#### 5. `originalPriceForDisplay`
Calcule le prix original (avant réduction) à afficher barré selon la sélection actuelle.

#### 6. `effectivePrice`
Calcule le prix final à afficher selon la sélection actuelle (couleur/taille).

### Exemple de Code

```jsx
// Dans Show.jsx
const effectivePrice = useMemo(() => {
  if (isVariableProduct) {
    // Si un variant exact est sélectionné
    if (selectedVariant?.sale_price && selectedColor && selectedSize) {
      return calculateDiscountedPrice(selectedVariant.sale_price);
    }
    
    // Si seulement couleur sélectionnée
    if (selectedColor && minPriceForColor) {
      return minPriceForColor;
    }
    
    // Si seulement taille sélectionnée
    if (selectedSize && minPriceForSize) {
      return minPriceForSize;
    }
    
    // Aucune sélection : prix minimum global
    return minVariantPrice ?? calculateDiscountedPrice(product.current_sale_price) ?? 0;
  }
  
  // Produit simple
  return calculateDiscountedPrice(product.current_sale_price ?? product.price ?? 0);
}, [selectedVariant, selectedColor, selectedSize, /* ... */]);
```

## Style d'Affichage

### Prix avec Réduction
```css
/* Prix original (barré) */
.line-through {
  text-decoration: line-through;
  color: #6B7280; /* gray-500 */
}

/* Prix en solde (rouge) */
.text-red-600 {
  color: #DC2626;
  font-weight: bold;
}
```

### Badge de Réduction
```jsx
{discountPercent > 0 && (
  <span className="bg-black text-white text-md px-2 py-1">
    -{discountPercent}%
  </span>
)}
```

## Exemples d'Utilisation

### Scénario 1 : T-shirt Simple avec 20% de Réduction

**Données :**
- `current_sale_price` : 15 000 FCFA
- `discount_type` : 1 (pourcentage)
- `discount` : 20
- `has_discount` : true

**Affichage :**
```
[15 000 FCFA] → 12 000 FCFA
     ↑ barré       ↑ rouge
```

### Scénario 2 : Chaussures Variables avec Réduction de 5 000 FCFA

**Données produit :**
- `discount_type` : 0 (fixe)
- `discount` : 5 000
- `has_discount` : true

**Variants :**
- Variant 1 (Noir, 40) : `sale_price` = 50 000 → Prix final : 45 000
- Variant 2 (Noir, 42) : `sale_price` = 52 000 → Prix final : 47 000
- Variant 3 (Blanc, 40) : `sale_price` = 48 000 → Prix final : 43 000

**Affichage selon sélection :**

1. **Aucune sélection :**
   ```
   [48 000 FCFA] → 43 000 FCFA  (prix min global)
   ```

2. **Couleur Noir sélectionnée :**
   ```
   [50 000 FCFA] → 45 000 FCFA  (prix min pour Noir)
   ```

3. **Taille 40 sélectionnée :**
   ```
   [48 000 FCFA] → 43 000 FCFA  (prix min pour taille 40)
   ```

4. **Noir + 42 sélectionnés :**
   ```
   [52 000 FCFA] → 47 000 FCFA  (prix exact du variant)
   ```

## Cohérence avec ModernProductCard

L'affichage dans `Show.jsx` est maintenant cohérent avec `ModernProductCard.jsx` :
- Même ordre d'affichage : prix_original (barré) puis prix_en_solde (rouge)
- Même logique de calcul des réductions
- Même style visuel pour les prix avec réduction

## Notes Importantes

1. **Prix Variables Dynamiques** : Les prix se mettent à jour automatiquement lors de la sélection de couleur/taille
2. **Héritage des Réductions** : Les variants héritent toujours du discount du produit parent
3. **Validation** : Le prix avec réduction ne peut jamais être négatif (Math.max(0, ...))
4. **Performance** : Les calculs utilisent `useMemo` et `useCallback` pour optimiser les re-rendus

## Maintenance

Pour ajouter un nouveau type de réduction :
1. Ajouter la valeur dans `discount_type` (ex: 2 pour réduction par quantité)
2. Mettre à jour `calculateDiscountedPrice()` pour gérer le nouveau type
3. Tester avec des produits simples et variables
4. Mettre à jour cette documentation

## Tests Recommandés

- [ ] Produit simple avec réduction en pourcentage
- [ ] Produit simple avec réduction fixe
- [ ] Produit variable avec réduction : aucune sélection
- [ ] Produit variable avec réduction : couleur sélectionnée
- [ ] Produit variable avec réduction : taille sélectionnée
- [ ] Produit variable avec réduction : couleur + taille sélectionnées
- [ ] Produit sans réduction (simple et variable)
- [ ] Changement dynamique de sélection avec mise à jour du prix
