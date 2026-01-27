# Système de Notifications UI - Documentation

## Vue d'ensemble

Le système de notifications UI a été amélioré pour offrir une expérience utilisateur premium avec des animations fluides, une barre de progression, et des fonctionnalités avancées.

## Améliorations Phase 3

### 1. **Animations Fluides** ✅
- **Slide-in-right** : Animation d'entrée élégante depuis la droite
- **Slide-out-right** : Animation de sortie douce
- **Bounce-in** : Animation rebondissante pour les icônes
- **Hover effects** : Scale et rotation au survol
- **Progress bar** : Barre de progression animée montrant le temps restant

### 2. **Barre de Progression** ✅
- Affichage visuel du temps restant avant disparition
- Pause automatique au survol de la souris
- Reprise de l'animation à la sortie du curseur
- Couleur adaptée au type de notification

### 3. **Gestion Intelligente** ✅
- **Déduplication** : Les notifications similaires sont groupées avec un groupKey
- **Throttling** : Empêche le spam de notifications identiques
- **Compteur** : Affiche le nombre de notifications similaires (×3)
- **Limite configurable** : Nombre maximum de notifications visibles

### 4. **Sons (Optionnel)** ✅
- Système de sons Web Audio API
- Désactivable par l'utilisateur
- Volume ajustable (0-100%)
- Sons différenciés par type (success, error, warning, info)
- Persistance des préférences dans localStorage

### 5. **Préférences Utilisateur** ✅
- Interface de configuration complète
- Position à l'écran personnalisable (6 positions)
- Durée d'affichage ajustable (2-10 secondes)
- Activation/désactivation des sons
- Nombre maximum de notifications visibles

## Composants

### NotificationProvider
Provider principal gérant l'état global des notifications.

```jsx
import { NotificationProvider } from '@/Components/Notifications/NotificationProvider';

<NotificationProvider>
  <App />
</NotificationProvider>
```

### useNotification Hook
Hook de base pour afficher des notifications.

```jsx
import { useNotification } from '@/Components/Notifications/NotificationProvider';

const { showSuccess, showError, showWarning, showInfo, clearAll } = useNotification();

// Exemples d'utilisation
showSuccess('Produit ajouté au panier !', 'Succès');
showError('Une erreur est survenue', 'Erreur');
showWarning('Stock faible', 'Attention');
showInfo('Nouvelle mise à jour disponible', 'Information');
```

### useAdvancedNotifications Hook
Hook avancé avec fonctionnalités supplémentaires.

```jsx
import useAdvancedNotifications from '@/Hooks/useAdvancedNotifications';

const {
  showThrottled,
  showGrouped,
  showLoading,
  updateLoadingToSuccess,
  showWithAction,
  showProgress,
} = useAdvancedNotifications();

// Notification avec throttling (évite le spam)
showThrottled('success', 'Sauvegardé', null, {}, 2000);

// Notification groupée avec compteur
showGrouped('cart-add', 'success', 'Article ajouté au panier');

// Notification de chargement
const loadingId = showLoading('Traitement en cours...');
// ... opération asynchrone ...
updateLoadingToSuccess('Opération terminée !');

// Notification avec action
showWithAction(
  'info',
  'Nouveau message reçu',
  'Voir',
  () => router.visit('/messages')
);

// Notification de progression
showProgress('Téléchargement...', 45);
```

### NotificationPreferences
Composant de configuration des préférences.

```jsx
import NotificationPreferences from '@/Components/Notifications/NotificationPreferences';

const [showPrefs, setShowPrefs] = useState(false);

<NotificationPreferences 
  isOpen={showPrefs}
  onClose={() => setShowPrefs(false)}
/>
```

## Options de Notification

### Options de Base
```javascript
{
  type: 'success' | 'error' | 'warning' | 'info',
  title: 'Titre de la notification',
  message: 'Message principal',
  duration: 5000, // en millisecondes (0 = infini)
  groupKey: 'unique-key', // Pour déduplication
}
```

### Options Avancées
```javascript
{
  ...optionsDeBase,
  className: 'custom-class', // Classes CSS personnalisées
  onClose: () => {}, // Callback à la fermeture
  persistent: true, // Ne disparaît pas automatiquement (duration: 0)
}
```

## Types de Notifications

### Success (Succès)
- **Couleur** : Vert
- **Icône** : CheckCircleIcon
- **Durée** : 5 secondes
- **Usage** : Confirmations d'actions réussies

### Error (Erreur)
- **Couleur** : Rouge
- **Icône** : XCircleIcon
- **Durée** : 7 secondes
- **Usage** : Messages d'erreur

### Warning (Avertissement)
- **Couleur** : Jaune
- **Icône** : ExclamationTriangleIcon
- **Durée** : 5 secondes
- **Usage** : Avertissements, stock faible

### Info (Information)
- **Couleur** : Bleu
- **Icône** : InformationCircleIcon
- **Durée** : 5 secondes
- **Usage** : Informations générales

## Préférences Utilisateur

Les préférences sont stockées dans `localStorage` sous la clé `notification_preferences` :

```javascript
{
  enabled: true,              // Activer/désactiver toutes les notifications
  soundEnabled: false,        // Activer/désactiver les sons
  duration: 5000,             // Durée par défaut (ms)
  position: 'top-right',      // Position à l'écran
  maxVisible: 5,              // Nombre maximum visible
}
```

## Positions Disponibles

- `top-left`
- `top-center`
- `top-right` (défaut)
- `bottom-left`
- `bottom-center`
- `bottom-right`

## Exemples d'Utilisation

### Cas d'Usage Courants

#### 1. Ajout au Panier
```jsx
const handleAddToCart = () => {
  // ... logique d'ajout ...
  showGrouped('cart-add', 'success', 'Article ajouté au panier', 'Panier');
};
```

#### 2. Suppression avec Confirmation
```jsx
const handleDelete = async () => {
  const loadingId = showLoading('Suppression en cours...');
  try {
    await deleteItem();
    updateLoadingToSuccess('Élément supprimé avec succès');
  } catch (error) {
    updateLoadingToError('Échec de la suppression');
  }
};
```

#### 3. Upload avec Progression
```jsx
const handleUpload = (file) => {
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    const progress = (e.loaded / e.total) * 100;
    showProgress(`Upload de ${file.name}`, progress);
  });
  // ... suite de l'upload ...
};
```

#### 4. Notification Persistante
```jsx
showPersistentError(
  'Votre session va expirer',
  'Attention',
  { duration: 0 }
);
```

#### 5. Séquence de Notifications
```jsx
await showSequence([
  { type: 'info', message: 'Étape 1 terminée' },
  { type: 'info', message: 'Étape 2 terminée' },
  { type: 'success', message: 'Processus complet !' }
], 1000);
```

## Personnalisation CSS

Les classes CSS utilisées pour les animations sont dans `resources/css/app.css` :

```css
@keyframes slide-in-right { ... }
@keyframes slide-out-right { ... }
@keyframes bounce-in { ... }

.animate-slide-in-right { ... }
.animate-slide-out-right { ... }
.animate-bounce-in { ... }
```

## Accessibilité

- Attribut `aria-live="assertive"` sur le conteneur
- Bouton de fermeture avec `aria-label`
- Support du clavier (Escape pour fermer)
- Contraste de couleurs WCAG AA compliant

## Performances

### Optimisations Implémentées
1. **Throttling** : Évite les notifications répétitives
2. **Déduplication** : Regroupe les notifications similaires
3. **Limite de visibilité** : Empêche l'accumulation excessive
4. **Cleanup automatique** : Supprime les notifications expirées
5. **useCallback** : Mémoïse les fonctions pour éviter les re-renders

### Bonnes Pratiques
- Utiliser `groupKey` pour les notifications similaires
- Limiter la durée des notifications (5-7 secondes)
- Éviter les notifications trop longues (> 200 caractères)
- Utiliser `showThrottled` pour les actions répétitives

## Dépendances

- **React** : ^18.0.0
- **@heroicons/react** : ^2.0.0
- **Tailwind CSS** : ^3.0.0

## Tests

Les notifications peuvent être testées manuellement via :

```jsx
// Page de test des notifications
<button onClick={() => showSuccess('Test réussi')}>
  Tester Success
</button>
<button onClick={() => showError('Test erreur')}>
  Tester Error
</button>
```

## Migration

Si vous utilisiez l'ancien système, voici comment migrer :

### Avant
```jsx
import { toast } from 'react-toastify';
toast.success('Message');
```

### Après
```jsx
import { useNotification } from '@/Components/Notifications/NotificationProvider';
const { showSuccess } = useNotification();
showSuccess('Message', 'Titre');
```

## Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les préférences utilisateur dans localStorage
3. Inspecter la console pour les erreurs
4. Vérifier que NotificationProvider entoure bien votre application

## Changelog

### Phase 3 (2024)
- ✅ Ajout de la barre de progression
- ✅ Amélioration des animations (slide, bounce, scale)
- ✅ Système de sons avec Web Audio API
- ✅ Préférences utilisateur configurables
- ✅ Hook avancé useAdvancedNotifications
- ✅ Déduplication et throttling
- ✅ Notifications groupées avec compteur
- ✅ Support des notifications avec actions
- ✅ Support des notifications de progression
