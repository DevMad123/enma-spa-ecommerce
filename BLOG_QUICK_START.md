# 🚀 QUICK START - Blog Sneakers

## Installation (3 minutes)

### 1️⃣ Lancer les migrations
```bash
php artisan migrate
```

### 2️⃣ Créer des données de test
```bash
php artisan db:seed --class=BlogSeeder
```

### 3️⃣ Compiler les assets
```bash
npm run dev
```

### 4️⃣ Lier le storage (si pas déjà fait)
```bash
php artisan storage:link
```

## ✅ Vérification

Accédez à : **http://localhost:8000/blog**

Vous devriez voir :
- ✅ Hero avec article mis en avant
- ✅ Navigation des catégories (4 catégories)
- ✅ Grid de 4 articles
- ✅ Recherche fonctionnelle
- ✅ Tags cliquables

## 📍 URLs disponibles

- `/blog` → Listing complet
- `/blog/sneaker-culture` → Catégorie Culture
- `/blog/guides-astuces` → Catégorie Guides
- `/blog/comment-nettoyer-et-entretenir-vos-sneakers-comme-un-pro` → Article exemple

## 🏠 Intégration Homepage

La section blog apparaît automatiquement sur la homepage (après les catégories).

Si vous ne la voyez pas :
1. Vérifiez que les migrations sont lancées
2. Vérifiez que le seeder est exécuté
3. Rechargez la page d'accueil

## 🎨 Personnalisation

### Ajouter des images réelles

Par défaut, le seeder utilise des placeholders. Pour ajouter de vraies images :

1. **Créez le dossier** : `storage/app/public/blog`
2. **Ajoutez vos images** : `blog/nom-image.jpg`
3. **Modifiez vos articles** :
```php
$post->cover_image = 'blog/mon-image-reelle.jpg';
$post->save();
```

### Créer un nouvel article

```bash
php artisan tinker
```

```php
use App\Models\BlogPost;

BlogPost::create([
    'title' => 'Mon super article',
    'excerpt' => 'Résumé court...',
    'content' => '<h2>Titre</h2><p>Contenu HTML...</p>',
    'cover_image' => 'blog/image.jpg',
    'category_id' => 1,
    'author_id' => 1,
    'tags' => ['tag1', 'tag2'],
    'published_at' => now(),
]);
```

## 📚 Documentation complète

Consultez [BLOG_ARCHITECTURE.md](BLOG_ARCHITECTURE.md) pour :
- Structure complète des fichiers
- Guide des composants React
- API des modèles
- Scopes et accesseurs
- Évolutions futures

## 🐛 Problèmes courants

### "Route blog.index not found"
```bash
php artisan route:clear
php artisan optimize:clear
```

### "BlogPost model not found"
```bash
composer dump-autoload
```

### Images 404
```bash
php artisan storage:link
```

## 🎯 Next Steps

1. **Admin CRUD** : Créer interface admin pour gérer les articles
2. **Vraies images** : Remplacer les placeholders
3. **Rich Editor** : Intégrer TinyMCE ou Tiptap
4. **Newsletter** : Alertes automatiques nouveaux articles
5. **Analytics** : Tracking des articles les plus lus

---

**Bon courage !** 🚀

Le système est 100% opérationnel. Vous pouvez maintenant :
- ✅ Créer des articles
- ✅ Gérer des catégories
- ✅ Afficher sur la homepage
- ✅ SEO-optimisé
- ✅ Design premium style 43einhalb
