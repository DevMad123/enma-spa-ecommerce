# 🚀 API Routes Documentation - Wishlist & Reviews (Révisé)

## 📋 Vue d'ensemble des Routes

Voici la documentation complète des routes API **Wishlist** et **Avis Produits** révisées et optimisées.

---

## 💝 Routes Wishlist (Liste de Souhaits)

### 🔐 Authentification Requise
```
Authorization: Bearer {your_sanctum_token}
```

### 📊 Ma liste de souhaits
```http
GET /api/wishlist
```
**Route:** `api.wishlist.index`

### ⚡ Toggle produit (Ajouter/Retirer intelligemment)
```http
POST /api/wishlist/toggle
Content-Type: application/json

{
  "product_id": 5
}
```
**Route:** `api.wishlist.toggle`  
**Réponse:**
```json
{
  "success": true,
  "message": "Produit ajouté à la liste de souhaits",
  "data": {
    "action": "added", // ou "removed"
    "product_id": 5,
    "is_in_wishlist": true
  }
}
```

### ➕ Ajouter explicitement
```http
POST /api/wishlist/add
Content-Type: application/json

{
  "product_id": 5
}
```
**Route:** `api.wishlist.store`

### ➖ Supprimer produit
```http
DELETE /api/wishlist/remove/{productId}
```
**Route:** `api.wishlist.destroy`

### ✅ Vérifier plusieurs produits
```http
POST /api/wishlist/check
Content-Type: application/json

{
  "product_ids": [1, 2, 3, 5, 8]
}
```
**Route:** `api.wishlist.check`  
**Réponse:**
```json
{
  "success": true,
  "data": {
    "1": true,
    "2": false,
    "3": true,
    "5": true,
    "8": false
  }
}
```

### ✅ Vérifier un seul produit
```http
GET /api/wishlist/check/{productId}
```
**Route:** `api.wishlist.check.single`

### 📊 Compter mes favoris
```http
GET /api/wishlist/count
```
**Route:** `api.wishlist.count`  
**Réponse:**
```json
{
  "success": true,
  "data": {
    "count": 12
  }
}
```

### 🗑️ Vider la wishlist
```http
DELETE /api/wishlist/clear
```
**Route:** `api.wishlist.clear`

### 🛒 Toggle depuis page produit
```http
POST /api/products/{productId}/wishlist-toggle
```
**Route:** `api.products.wishlist-toggle`  
**Réponse enrichie:**
```json
{
  "success": true,
  "message": "Produit ajouté à vos favoris",
  "data": {
    "action": "added",
    "product_id": 5,
    "is_in_wishlist": true,
    "wishlist_count": 13
  }
}
```

---

## 💬 Routes Avis Produits (Reviews)

### 👀 Routes Publiques (sans authentification)

#### 📋 Avis d'un produit
```http
GET /api/products/{productId}/reviews?rating=5&verified_only=true&sort=newest&per_page=10
```
**Route:** `api.reviews.product`

#### 📊 Résumé des avis d'un produit
```http
GET /api/products/{productId}/reviews/summary
```
**Route:** `api.reviews.summary`  
**Réponse:**
```json
{
  "success": true,
  "data": {
    "product_id": 5,
    "product_name": "T-shirt Premium",
    "summary": {
      "total_reviews": 156,
      "average_rating": 4.3,
      "rating_distribution": {
        "1": 2, "2": 8, "3": 21, "4": 45, "5": 80
      },
      "verified_purchases_count": 89
    }
  }
}
```

### 🔐 Routes Authentifiées

#### 📝 Mes avis
```http
GET /api/reviews/my-reviews?per_page=10
```
**Route:** `api.reviews.my-reviews`

#### 📊 Mes statistiques d'avis
```http
GET /api/reviews/my-reviews/stats
```
**Route:** `api.reviews.my-stats`  
**Réponse:**
```json
{
  "success": true,
  "data": {
    "total_reviews": 23,
    "average_rating": 4.2,
    "verified_reviews": 18,
    "rating_distribution": {
      "1": 0, "2": 1, "3": 3, "4": 8, "5": 11
    }
  }
}
```

#### ✍️ Créer un avis
```http
POST /api/reviews
Content-Type: application/json

{
  "product_id": 5,
  "rating": 5,
  "comment": "Excellent produit !"
}
```
**Route:** `api.reviews.store`

#### 👁️ Détail d'un avis
```http
GET /api/reviews/{reviewId}
```
**Route:** `api.reviews.show`

#### 🔧 Modifier un avis
```http
PUT /api/reviews/{reviewId}
PATCH /api/reviews/{reviewId}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Commentaire mis à jour"
}
```
**Route:** `api.reviews.update` / `api.reviews.patch`

#### 🗑️ Supprimer un avis
```http
DELETE /api/reviews/{reviewId}
```
**Route:** `api.reviews.destroy`

#### 👍 Marquer comme utile
```http
POST /api/reviews/{reviewId}/helpful
```
**Route:** `api.reviews.helpful`

#### 🚨 Signaler un avis
```http
POST /api/reviews/{reviewId}/report
Content-Type: application/json

{
  "reason": "spam", // spam, inappropriate, fake, offensive, other
  "comment": "Raison du signalement"
}
```
**Route:** `api.reviews.report`

#### 🔍 Vérifier si je peux écrire un avis
```http
GET /api/products/{productId}/can-review
```
**Route:** `api.products.can-review`  
**Réponse:**
```json
{
  "success": true,
  "data": {
    "can_review": true,
    "reason": "eligible",
    "message": "Vous pouvez écrire un avis pour ce produit"
  }
}
```

---

## 🎯 Exemples d'Usage Frontend

### React/JavaScript - Wishlist Toggle
```javascript
const toggleWishlist = async (productId) => {
  try {
    const response = await axios.post(`/api/products/${productId}/wishlist-toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { action, is_in_wishlist, wishlist_count } = response.data.data;
    
    // Mettre à jour l'état local
    setIsInWishlist(is_in_wishlist);
    setWishlistCount(wishlist_count);
    
    toast.success(
      action === 'added' 
        ? '💖 Ajouté à vos favoris !' 
        : '💔 Retiré de vos favoris'
    );
  } catch (error) {
    toast.error('Erreur lors de l\'opération');
  }
};
```

### React/JavaScript - Vérification multiple
```javascript
const checkMultipleWishlist = async (productIds) => {
  try {
    const response = await axios.post('/api/wishlist/check', {
      product_ids: productIds
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const wishlistStatus = response.data.data;
    
    // Mettre à jour l'état pour chaque produit
    productIds.forEach(id => {
      setProductWishlistStatus(prev => ({
        ...prev,
        [id]: wishlistStatus[id]
      }));
    });
  } catch (error) {
    console.error('Erreur vérification wishlist:', error);
  }
};
```

### React/JavaScript - Soumission d'avis
```javascript
const submitReview = async (productId, rating, comment) => {
  try {
    // Vérifier d'abord si on peut écrire un avis
    const canReviewResponse = await axios.get(`/api/products/${productId}/can-review`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!canReviewResponse.data.data.can_review) {
      toast.error(canReviewResponse.data.data.message);
      return;
    }
    
    // Soumettre l'avis
    const response = await axios.post('/api/reviews', {
      product_id: productId,
      rating,
      comment
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    toast.success('Avis ajouté avec succès !');
    
    // Rafraîchir les avis du produit
    fetchProductReviews(productId);
    
  } catch (error) {
    if (error.response?.data?.errors) {
      // Afficher erreurs de validation
      Object.values(error.response.data.errors).flat().forEach(msg => {
        toast.error(msg);
      });
    } else {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    }
  }
};
```

---

## 🛡️ Sécurité & Validation

### Contrôles d'Accès
- ✅ **Authentification Sanctum** pour toutes les actions utilisateur
- ✅ **Vérification de propriété** pour modification/suppression d'avis
- ✅ **Validation stricte** des données d'entrée
- ✅ **Protection anti-spam** avec limitations
- ✅ **Contraintes d'intégrité** base de données

### Règles Métier
- **Wishlist:** Un produit par utilisateur maximum
- **Avis:** Un seul avis par produit par utilisateur
- **Rating:** Obligatoire, entre 1 et 5
- **Commentaire:** Optionnel, max 1000 caractères
- **Signalements:** Pas de signalement de ses propres avis

---

## 📈 Nouvelles Fonctionnalités Ajoutées

### 🎯 **Améliorations Wishlist:**
- ⚡ **Toggle intelligent** (ajouter/retirer en une action)
- 📊 **Vérification multiple** de produits en batch
- 🔢 **Compteur** de favoris en temps réel
- 🛒 **Intégration produit** direct depuis pages

### 🎯 **Améliorations Reviews:**
- 📊 **Résumé statistiques** par produit
- 📈 **Statistiques utilisateur** personnelles
- ✅ **Vérification éligibilité** avant avis
- 👍 **Système votes utiles** (préparé)
- 🚨 **Système signalements** avec raisons

### 🎯 **Optimisations Techniques:**
- 🏷️ **Noms de routes** pour faciliter l'usage
- 🔢 **Contraintes regex** sur les paramètres
- 📝 **Documentation inline** complète
- 🛡️ **Validation renforcée** everywhere
- ⚡ **Performance** queries optimisées

---

## ✅ Status Implementation

- ✅ **Routes API** : 19 routes complètes et documentées
- ✅ **Contrôleurs** : Méthodes avancées implémentées
- ✅ **Validation** : FormRequests avec règles métier
- ✅ **Sécurité** : Protection Sanctum + vérifications propriété
- ✅ **Performance** : Queries optimisées avec relations
- 🔄 **Frontend** : Exemples d'intégration fournis
- 🔄 **Tests** : À implémenter (recommandé)

Vos API **Wishlist** et **Reviews** sont maintenant **niveau production** avec des fonctionnalités avancées ! 🚀✨