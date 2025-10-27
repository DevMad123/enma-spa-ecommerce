# API Variants - Produits Variables

Ce document décrit la structure backend révisée pour les produits variables et les points d’API disponibles.

## Modèles et relations

- `Product` hasMany `ProductVariant`
- `ProductVariant` belongsTo `Product`, `ProductColor`, `ProductSize`
- `ProductColor` hasMany `ProductVariant`, belongsToMany `Product` via `product_variants`
- `ProductSize` hasMany `ProductVariant`, belongsToMany `Product` via `product_variants`

Champs clefs d’une variante:
- `product_id`, `color_id` (nullable), `size_id` (nullable)
- `sku`, `sale_price`, `available_quantity`
- Alias d’accès: `price` (alias de `sale_price`), `stock` (alias de `available_quantity` arrondi à l’entier inférieur)

## Attributs calculés du produit

- `price_range` (accessor): retourne `{ min: number, max: number }` calculés depuis les variantes.
  - fallback sur `attributes.price` puis `products.current_sale_price` si aucune variante.
- Scope `withVariants()`: eager load `variants.color`, `variants.size`, `variants.images`.

## Ressource JSON `ProductResource`

Chaque produit exposé inclut désormais:

```
{
  "id": 1,
  "name": "Sneakers Homme",
  ...
  "price_min": 12000,
  "price_max": 15000,
  "price_range": "À partir de 12 000 F CFA",
  "variants": [
    {
      "id": 10,
      "sku": "SN-001-c2-s44",
      "color_id": 2,
      "color": "Orange",
      "size_id": 7,
      "size": "44",
      "price": 12000,
      "sale_price": 12000,
      "stock": 5,
      "image_id": 99,
      "image": "https://.../storage/products/variants/99.webp"
    }
  ]
}
```

Remarque: `price` est un alias de `sale_price` pour compatibilité FE.

## Endpoints

- GET `/api/products/{product}/min-price`
  - Aide historique. Calcule le minimum parmi variantes/attributs/prix produit.

- GET `/api/products/{product}/variant?color_id={id}&size_id={id}`
  - Retourne la variante correspondant aux attributs, ou `null` si aucune trouvée.
  - Réponse:
    ```
    {
      "id": 10,
      "sku": "SN-001-c2-s44",
      "product_id": 1,
      "color_id": 2,
      "color": "Orange",
      "size_id": 7,
      "size": "44",
      "price": 12000,
      "sale_price": 12000,
      "stock": 5,
      "image_id": 99,
      "image": "https://.../storage/products/variants/99.webp"
    }
    ```

## Notes d’intégration Frontend (React / Inertia)

- Utiliser `product.variants` pour afficher les combinaisons disponibles.
- Utiliser `product.price_range` pour l’affichage marketing (ex: "À partir de ...").
- Pour récupérer une variante spécifique: appeler `/api/products/{product}/variant?color_id=...&size_id=...` et utiliser `stock`, `price`, `sku`.

