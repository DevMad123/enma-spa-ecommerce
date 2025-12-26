# Système de Backup Automatique de la Base de Données

## 📋 Vue d'ensemble

Un système complet de backup automatique de la base de données a été mis en place pour protéger vos données.

## ✨ Fonctionnalités

- ✅ Backup automatique quotidien à 2h00 du matin
- ✅ Support MySQL, PostgreSQL et SQLite
- ✅ Compression optionnelle des backups (réduction de ~90%)
- ✅ Nettoyage automatique des anciens backups
- ✅ Méthode alternative si mysqldump n'est pas disponible
- ✅ Logs détaillés avec émojis pour un suivi facile

## 📁 Emplacement des Backups

Les backups sont stockés dans : `storage/app/backups/`

Format des noms de fichiers :
- Sans compression : `backup_2025-12-26_15-04-13.sql`
- Avec compression : `backup_2025-12-26_15-04-59.sql.gz`

## 🚀 Utilisation Manuelle

### Backup Simple

```bash
php artisan db:backup
```

### Backup avec Compression

```bash
php artisan db:backup --compress
```

La compression réduit la taille du fichier d'environ 90% (de 208KB à 21KB dans notre cas).

### Backup avec Conservation Personnalisée

```bash
php artisan db:backup --keep-days=30
```

Ceci conservera les backups pendant 30 jours au lieu des 7 jours par défaut.

### Backup Compressé avec Conservation Longue

```bash
php artisan db:backup --compress --keep-days=90
```

## ⏰ Configuration du Backup Automatique

### Paramètres Actuels

- **Fréquence** : Quotidien
- **Heure** : 2h00 du matin
- **Conservation** : 30 jours
- **Compression** : Non (par défaut)

### Modifier la Planification

Éditez le fichier `routes/console.php` :

```php
// Backup quotidien à 2h00 (configuration actuelle)
Schedule::command('db:backup --keep-days=30')
    ->daily()
    ->at('02:00');

// Autres exemples :

// Backup toutes les 6 heures
Schedule::command('db:backup --compress --keep-days=30')
    ->everySixHours();

// Backup deux fois par jour (matin et soir)
Schedule::command('db:backup --compress')
    ->twiceDaily(2, 14); // 2h00 et 14h00

// Backup hebdomadaire (dimanche à 3h00)
Schedule::command('db:backup --compress --keep-days=60')
    ->weekly()
    ->sundays()
    ->at('03:00');
```

## 🔧 Activation du Scheduler Laravel

Pour que les backups automatiques fonctionnent, le scheduler Laravel doit être actif.

### Sur Serveur Linux/Production

Ajoutez cette ligne au crontab :

```bash
* * * * * cd /chemin/vers/votre/projet && php artisan schedule:run >> /dev/null 2>&1
```

Pour éditer le crontab :

```bash
crontab -e
```

### Sur Windows (Développement)

Vous pouvez utiliser le Planificateur de tâches Windows ou lancer manuellement :

```bash
php artisan schedule:work
```

Cette commande exécutera le scheduler en continu (pratique pour le développement).

### Vérifier les Tâches Planifiées

```bash
php artisan schedule:list
```

## 📊 Exemple de Résultat

```
🔄 Démarrage du backup de la base de données...
📦 Backup MySQL en cours...
 66/66 [============================] 100%
🗜️ Compression du backup...
✅ Backup compressé
🧹 Nettoyage des backups de plus de 7 jours...
✅ Aucun ancien backup à supprimer
✅ Backup créé avec succès: backup_2025-12-26_15-04-59.sql.gz (21.49 KB)
```

## 🔄 Restauration d'un Backup

### Backup Non Compressé (.sql)

```bash
# MySQL
mysql -u username -p database_name < storage/app/backups/backup_2025-12-26_15-04-13.sql

# PostgreSQL
psql -U username -d database_name -f storage/app/backups/backup_2025-12-26_15-04-13.sql
```

### Backup Compressé (.sql.gz)

```bash
# MySQL
gunzip < storage/app/backups/backup_2025-12-26_15-04-59.sql.gz | mysql -u username -p database_name

# PostgreSQL
gunzip < storage/app/backups/backup_2025-12-26_15-04-59.sql.gz | psql -U username -d database_name
```

### Avec Laravel Artisan (via Tinker)

```bash
php artisan tinker
```

Puis dans tinker :

```php
DB::unprepared(file_get_contents('storage/app/backups/backup_2025-12-26_15-04-13.sql'));
```

## 📦 Télécharger les Backups

### Liste des Backups

```bash
# Windows PowerShell
Get-ChildItem -Path "storage\app\backups" | Format-Table Name, Length, LastWriteTime

# Linux/Mac
ls -lh storage/app/backups/
```

### Copier un Backup

```bash
# Windows
copy storage\app\backups\backup_2025-12-26_15-04-59.sql.gz C:\Backups\

# Linux/Mac
cp storage/app/backups/backup_2025-12-26_15-04-59.sql.gz ~/Backups/
```

## 🛡️ Bonnes Pratiques

1. **Sauvegarde Externe** : Copiez régulièrement les backups vers un stockage externe (cloud, disque externe)

2. **Testez les Restaurations** : Testez périodiquement la restauration d'un backup pour vérifier son intégrité

3. **Surveillance** : Vérifiez régulièrement que les backups sont créés correctement

4. **Espace Disque** : Surveillez l'espace disque disponible dans `storage/app/backups/`

5. **Sécurité** : Les backups contiennent des données sensibles - protégez-les !

6. **Compression en Production** : Utilisez toujours `--compress` en production pour économiser l'espace

## 🔍 Dépannage

### Erreur "mysqldump non disponible"

Le système bascule automatiquement sur une méthode alternative utilisant PHP PDO. Aucune action requise.

### Espace disque insuffisant

Réduisez le nombre de jours de conservation :

```bash
php artisan db:backup --keep-days=3
```

Ou activez la compression :

```bash
php artisan db:backup --compress
```

### Backup vide (0 KB)

Vérifiez que la base de données contient des données et que les permissions sont correctes.

### Le scheduler ne s'exécute pas

Vérifiez que le cron est configuré (Linux) ou que `php artisan schedule:work` est en cours d'exécution (développement).

## 📝 Logs

Les logs sont disponibles dans :
- `storage/logs/laravel.log` - Logs généraux
- Les succès/échecs des backups automatiques y sont enregistrés

## 🔐 Sécurité

⚠️ **Important** : Le dossier `storage/app/backups/` contient vos données sensibles !

- Ne le commitez PAS dans Git
- Ajouté au `.gitignore` : `storage/app/backups/`
- Protégez l'accès à ce dossier en production
- Chiffrez les backups si nécessaire avant de les transférer

## 📈 Surveillance de l'Espace Disque

```bash
# Windows PowerShell
Get-ChildItem -Path "storage\app\backups" -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="TotalSizeMB";Expression={[math]::Round($_.Sum/1MB,2)}}

# Linux/Mac
du -sh storage/app/backups/
```

## ✅ Test du Système

Pour vérifier que tout fonctionne correctement :

```bash
# 1. Créer un backup manuel
php artisan db:backup --compress

# 2. Vérifier le fichier créé
ls -lh storage/app/backups/

# 3. Lister les tâches planifiées
php artisan schedule:list

# 4. Tester le scheduler (développement uniquement)
php artisan schedule:work
```

---

**Date de création** : 26 décembre 2025  
**Dernière mise à jour** : 26 décembre 2025
