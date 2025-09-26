// Script de test pour la console du navigateur
// À exécuter sur http://localhost:8000 après connexion

console.log('🔧 Test du système Wishlist');

// Vérifier le token CSRF
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
console.log('Token CSRF trouvé:', csrfToken ? '✅ Oui' : '❌ Non');

// Vérifier les routes
console.log('Routes disponibles:');
console.log('- Ajout:', route('frontend.wishlist.store'));
console.log('- Suppression:', route('frontend.wishlist.destroy', 1));

// Test d'ajout (remplacez 1 par un ID de produit existant)
if (confirm('Tester l\'ajout du produit 1 à la wishlist ?')) {
    fetch(route('frontend.wishlist.store'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            product_id: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Réponse ajout:', data);
    })
    .catch(error => {
        console.error('❌ Erreur ajout:', error);
    });
}