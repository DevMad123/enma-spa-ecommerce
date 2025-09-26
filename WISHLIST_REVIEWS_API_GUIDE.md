# 🚀 Guide d'Utilisation : API Wishlist & Avis Produits

## 📋 Vue d'ensemble

Ce guide documente les nouvelles fonctionnalités **Wishlist** et **Avis Produits** pour votre application e-commerce Laravel 11 + React (Inertia.js).

---

## 💝 API Wishlist (Liste de Souhaits)

### Authentification Requise
Toutes les routes wishlist nécessitent une authentification Sanctum via le header :
```
Authorization: Bearer {your_token}
```

### 📊 Récupérer ma wishlist
```http
GET /api/wishlist
```

**Réponse :**
```json
{
  "success": true,
  "message": "Liste de souhaits récupérée avec succès",
  "data": {
    "wishlists": [
      {
        "id": 1,
        "added_at": "2025-09-26 07:30:00",
        "product": {
          "id": 5,
          "name": "T-shirt Premium",
          "description": "Description du produit...",
          "price": 29.99,
          "image": "https://example.com/image.jpg",
          "category": "Vêtements",
          "brand": "Nike",
          "average_rating": 4.5,
          "reviews_count": 12,
          "status": 1
        }
      }
    ],
    "total_count": 1
  }
}
```

### ➕ Ajouter à la wishlist
```http
POST /api/wishlist
Content-Type: application/json

{
  "product_id": 5
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Produit ajouté à la liste de souhaits avec succès",
  "data": {
    "wishlist": {
      "id": 1,
      "added_at": "2025-09-26 07:30:00",
      "product": {
        "id": 5,
        "name": "T-shirt Premium",
        "price": 29.99,
        "image": "https://example.com/image.jpg",
        "category": "Vêtements",
        "brand": "Nike"
      }
    }
  }
}
```

### ➖ Retirer de la wishlist
```http
DELETE /api/wishlist/product/{productId}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Produit retiré de la liste de souhaits avec succès"
}
```

### ✅ Vérifier si un produit est dans la wishlist
```http
GET /api/wishlist/check?product_id=5
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "is_in_wishlist": true
  }
}
```

### 🗑️ Vider la wishlist
```http
DELETE /api/wishlist/clear
```

**Réponse :**
```json
{
  "success": true,
  "message": "Liste de souhaits vidée avec succès (3 produit(s) supprimé(s))"
}
```

---

## 💬 API Avis Produits (Reviews)

### 📋 Récupérer les avis d'un produit (Public)
```http
GET /api/products/{productId}/reviews?rating=5&verified_only=true&sort=newest&per_page=10
```

**Paramètres optionnels :**
- `rating` : Filtrer par note (1-5)
- `verified_only` : Uniquement les achats vérifiés (true/false)
- `sort` : Tri (newest, oldest, rating_high, rating_low)
- `per_page` : Nombre d'éléments par page (max 50)

**Réponse :**
```json
{
  "success": true,
  "message": "Avis récupérés avec succès",
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent produit, très satisfait !",
        "is_verified_purchase": true,
        "created_at": "2025-09-26 07:30:00",
        "user": {
          "id": 1,
          "name": "Jean Dupont",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ],
    "summary": {
      "total_reviews": 25,
      "average_rating": 4.3,
      "rating_distribution": {
        "1": 1,
        "2": 2,
        "3": 5,
        "4": 7,
        "5": 10
      },
      "verified_purchases_count": 18
    },
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 10,
      "total": 25
    }
  }
}
```

### ✍️ Créer un avis (Authentifié)
```http
POST /api/reviews
Content-Type: application/json
Authorization: Bearer {token}

{
  "product_id": 5,
  "rating": 5,
  "comment": "Excellent produit, je le recommande !"
}
```

**Validation :**
- `product_id` : requis, doit exister
- `rating` : requis, entre 1 et 5
- `comment` : optionnel, max 1000 caractères
- Un utilisateur ne peut écrire qu'un seul avis par produit

### 📝 Récupérer mes avis (Authentifié)
```http
GET /api/reviews/my-reviews?per_page=10
```

### 🔧 Modifier mon avis (Authentifié)
```http
PUT /api/reviews/{reviewId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "rating": 4,
  "comment": "Commentaire mis à jour"
}
```

### 🗑️ Supprimer mon avis (Authentifié)
```http
DELETE /api/reviews/{reviewId}
Authorization: Bearer {token}
```

---

## 🏗️ Structure des Données

### Modèle Wishlist
```php
- id : bigint (PK)
- user_id : bigint (FK → ecommerce_customers.id)
- product_id : bigint (FK → products.id)
- created_at : timestamp
- updated_at : timestamp
```

### Modèle ProductReview
```php
- id : bigint (PK)
- user_id : bigint (FK → ecommerce_customers.id)  
- product_id : bigint (FK → products.id)
- rating : tinyint (1-5)
- comment : text (nullable)
- is_verified_purchase : boolean
- is_approved : boolean
- created_at : timestamp
- updated_at : timestamp
```

---

## 🔒 Sécurité & Validation

### Contrôles d'Accès
- ✅ Authentification Sanctum obligatoire pour actions utilisateur
- ✅ Vérification de propriété pour modification/suppression d'avis
- ✅ Validation des données d'entrée avec FormRequest
- ✅ Protection contre les doublons (wishlist + avis)

### Règles de Validation
- **Wishlist** : Product existe, pas de doublon par utilisateur
- **Avis** : Rating 1-5, un seul avis par produit par utilisateur, commentaire max 1000 chars

---

## 🚀 Utilisation Frontend (React/Inertia.js)

### Exemple d'intégration Wishlist
```javascript
// Ajouter à la wishlist
const addToWishlist = async (productId) => {
  try {
    const response = await axios.post('/api/wishlist', {
      product_id: productId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      // Mise à jour de l'état local
      setWishlistItems(prev => [...prev, response.data.data.wishlist]);
      toast.success('Produit ajouté à vos favoris !');
    }
  } catch (error) {
    toast.error('Erreur lors de l\'ajout');
  }
};
```

### Exemple d'intégration Avis
```javascript
// Soumettre un avis
const submitReview = async (productId, rating, comment) => {
  try {
    const response = await axios.post('/api/reviews', {
      product_id: productId,
      rating,
      comment
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      // Rafraîchir les avis
      fetchProductReviews(productId);
      toast.success('Avis ajouté avec succès !');
    }
  } catch (error) {
    if (error.response.data.errors) {
      // Afficher erreurs de validation
      Object.values(error.response.data.errors).flat().forEach(msg => {
        toast.error(msg);
      });
    }
  }
};
```

---

## 🎯 Next Steps

1. **Frontend Integration** : Créer les composants React pour wishlist et avis
2. **Email Notifications** : Notifications lors d'ajout d'avis
3. **Admin Panel** : Interface de modération des avis
4. **Analytics** : Statistiques wishlist et avis
5. **Cache** : Mise en cache des résumés d'avis pour performance
6. **Testing** : Tests unitaires et d'intégration

---

## ✅ Statut d'Implémentation

- ✅ **Migrations** : Tables créées et configurées
- ✅ **Modèles** : Relations Eloquent définies
- ✅ **Contrôleurs** : API REST complète
- ✅ **Validation** : FormRequest avec règles métier
- ✅ **Routes** : Routes API sécurisées
- ✅ **Authentication** : Intégration Sanctum
- 🔄 **Frontend** : À implémenter (composants React)
- 🔄 **Testing** : À implémenter

Vos nouvelles fonctionnalités Wishlist et Avis Produits sont maintenant prêtes à être utilisées ! 🚀