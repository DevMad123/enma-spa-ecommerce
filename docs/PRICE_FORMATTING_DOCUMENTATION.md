# Documentation - Système de formatage des prix localisés

## Résumé des modifications

Nous avons mis en place un système complet de formatage des prix qui permet d'afficher les prix sans décimales pour correspondre aux conventions locales (par exemple : "100 F CFA" au lieu de "100.00 F CFA").

## 🚀 Fonctionnalités implémentées

### 1. Service AppSettingsService étendu
- ✅ `getShowDecimals()` - Contrôle l'affichage des décimales
- ✅ `getTaxRate()` - Taux de TVA configurable
- ✅ `getShippingThreshold()` - Seuil de livraison gratuite
- ✅ `getShippingCost()` - Coût de livraison
- ✅ `getMaxPriceDefault()` - Prix maximum par défaut pour les filtres

### 2. Utilitaire de formatage des prix (`/resources/js/Utils/priceFormatter.js`)
```javascript
// Fonctions disponibles :
- formatPrice(price, showDecimals) 
- formatPriceWithCurrency(price, currencySymbol, showDecimals)
- usePriceSettings(appSettings) // Hook React
```

### 3. Migration de la base de données
- ✅ Ajout des paramètres dans la table `settings` :
  - `show_decimals` = 'false' (pas de décimales par défaut)
  - `tax_rate` = '0.18' (18%)
  - `shipping_threshold` = '50000' (50 000 F CFA)
  - `shipping_cost` = '3000' (3 000 F CFA)
  - `max_price_default` = '500000' (500 000 F CFA)

### 4. Middleware HandleInertiaRequests mis à jour
- ✅ Partage tous les paramètres de prix avec le frontend via `appSettings`

### 5. Pages Frontend converties

#### Pages Shop (✅ Complété)
- ✅ `Shop/Index.jsx` - Liste des produits
- ✅ `Shop/Category.jsx` - Produits par catégorie  
- ✅ `Shop/Show.jsx` - Détail produit

#### Pages Cart (✅ Complété)
- ✅ `Cart/Index.jsx` - Panier
- ✅ `Cart/Success.jsx` - Confirmation de commande
- ✅ `Cart/Checkout.jsx` - Processus de commande

## 🔧 Avant/Après

### Avant
```javascript
// Affichage avec décimales forcées
{price.toFixed(2)} {currencySymbol}
// Résultat : "100.00 F CFA"
```

### Après  
```javascript
// Affichage conditionnel selon les paramètres
{formatPriceWithCurrency(price)}
// Résultat : "100 F CFA" (si show_decimals = false)
```

## 📊 Exemples de formatage

| Prix original | Avec décimales | Sans décimales (actuel) |
|---------------|----------------|-------------------------|
| 100.00        | 100.00 F CFA   | 100 F CFA              |
| 100.50        | 100.50 F CFA   | 101 F CFA              |
| 99.99         | 99.99 F CFA    | 100 F CFA              |
| 150.75        | 150.75 F CFA   | 151 F CFA              |

## 🧪 Tests disponibles

### Page de test complète
- URL : `/test-pricing`
- Affiche tous les paramètres actuels
- Compare les différents formatages
- Simule un panier avec calculs

### Fichier de test HTML statique
- Fichier : `/public/test-price-formatting.html`
- Test JavaScript pur des fonctions

## ⚙️ Configuration

### Changer les paramètres
Pour modifier les paramètres, utiliser les méthodes du service :

```php
use App\Services\AppSettingsService;

// Activer les décimales
AppSettingsService::set('show_decimals', 'true');

// Changer le taux de TVA
AppSettingsService::set('tax_rate', '0.20'); // 20%

// Modifier le seuil de livraison gratuite  
AppSettingsService::set('shipping_threshold', '75000'); // 75 000 F CFA
```

### Dans le frontend
```javascript
import { usePriceSettings } from '@/Utils/priceFormatter';

const { formatPriceWithCurrency, showDecimals } = usePriceSettings(appSettings);
```

## 🎯 Prochaines étapes possibles

1. **Interface d'administration** - Ajouter des champs dans l'admin pour modifier ces paramètres
2. **Multi-devises** - Étendre le système pour supporter plusieurs devises
3. **Localisation avancée** - Ajouter le formatage par pays/région
4. **Tests automatisés** - Créer des tests unitaires pour les fonctions de formatage

## 🔍 Vérification

✅ Les prix s'affichent maintenant sans décimales sur toutes les pages  
✅ Le système est entièrement configurable via la base de données  
✅ Tous les paramètres sont centralisés dans AppSettingsService  
✅ L'interface utilisateur est cohérente dans toute l'application  

---

*Cette modification résout le problème initial : "pourquoi les prix s'affichent avec des décimals genre 100.00 F CFA au lieu de 100 F CFA"*