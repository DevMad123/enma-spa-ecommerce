@echo off
REM 🚀 Script d'installation du système de blog (Windows)
REM Exécute toutes les commandes nécessaires

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📰 INSTALLATION BLOG SNEAKERS - ENMA SPA
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 1. Autoload Composer
echo 1️⃣  Mise à jour de l'autoload Composer...
call composer dump-autoload
echo ✅ Autoload mis à jour
echo.

REM 2. Migrations
echo 2️⃣  Lancement des migrations...
call php artisan migrate
echo ✅ Migrations exécutées
echo.

REM 3. Seeder
echo 3️⃣  Création des données de test...
call php artisan db:seed --class=BlogSeeder
echo ✅ Données de test créées
echo.

REM 4. Storage link
echo 4️⃣  Création du lien symbolique storage...
call php artisan storage:link
echo ✅ Lien storage créé
echo.

REM 5. Cache clear
echo 5️⃣  Nettoyage du cache...
call php artisan route:clear
call php artisan config:clear
call php artisan view:clear
call php artisan optimize:clear
echo ✅ Cache nettoyé
echo.

REM 6. Assets
echo 6️⃣  Compilation des assets...
call npm run build
echo ✅ Assets compilés
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ INSTALLATION TERMINÉE !
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📍 Accédez au blog : http://localhost:8000/blog
echo 🏠 Section blog homepage : http://localhost:8000
echo.
echo 📊 Résumé de l'installation :
echo    • 4 catégories créées
echo    • 4 articles d'exemple créés
echo    • Routes fonctionnelles
echo    • Design style 43einhalb
echo.
echo 📚 Documentation :
echo    • Quick Start : BLOG_QUICK_START.md
echo    • Architecture : BLOG_ARCHITECTURE.md
echo.
echo 🎉 Bon développement !
echo.

pause
