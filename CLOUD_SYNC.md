# Synchronisation Cloud - Documentation Technique

## Vue d'ensemble

Le système de synchronisation cloud permet de sauvegarder automatiquement toutes les données de l'application garage vers Netlify Functions, offrant une protection contre la perte de données et la possibilité de restaurer les données sur différents appareils.

## Architecture

### Composants Principaux

1. **CloudSyncService** (`src/services/CloudSyncService.ts`)
   - Service principal gérant la synchronisation
   - Singleton pattern pour une instance unique
   - Synchronisation automatique toutes les 5 minutes
   - Support des sauvegardes manuelles

2. **useCloudSync Hook** (`src/hooks/useCloudSync.ts`)
   - Hook React pour l'intégration dans les composants
   - Gestion de l'état de synchronisation
   - Actions d'export/import manuel

3. **CloudSyncSettings Component** (`src/components/CloudSyncSettings.tsx`)
   - Interface utilisateur complète de configuration
   - Toggle pour activer/désactiver la sync
   - Boutons d'actions manuelles
   - Historique et statuts

4. **CloudSyncIndicator Component** (`src/components/CloudSyncIndicator.tsx`)
   - Indicateur visuel dans l'en-tête
   - Statut en temps réel
   - Bouton de synchronisation rapide

### Netlify Functions

1. **backup-data.ts** (`netlify/functions/backup-data.ts`)
   - POST: Stocke les données de sauvegarde
   - GET: Récupère les données de sauvegarde
   - Stockage en mémoire (pour démo)

2. **sync-data.ts** (`netlify/functions/sync-data.ts`)
   - Gestion du statut de synchronisation
   - Endpoints pour vérifier la santé du service
   - Tracking des métriques de sync

## Fonctionnalités

### Synchronisation Automatique
- **Fréquence**: Toutes les 5 minutes
- **Déclenchement**: Automatique après activation
- **Données**: Toutes les entités (clients, véhicules, réparations, etc.)
- **Fallback**: LocalStorage compressé si Netlify indisponible

### Synchronisation Manuelle
- **Bouton dans l'interface**: Sync immédiate
- **Indicateur visuel**: Badge cliquable dans l'en-tête
- **Export/Import**: Fichiers JSON pour sauvegarde locale

### Gestion des Erreurs
- **Retry automatique**: En cas d'échec temporaire
- **Fallback local**: Sauvegarde locale compressée
- **Notifications**: Messages d'erreur explicites
- **Logs**: Historique des tentatives de sync

## Formats de Données

### Structure de Sauvegarde
```typescript
interface CloudBackupData {
  timestamp: Date;
  version: string;
  garage: any; // Infos du garage
  data: {
    customers: Customer[];
    vehicles: Vehicle[];
    repairs: Repair[];
    invoices: Invoice[];
    users: User[];
    mechanics: Mechanic[];
    appointments: Appointment[];
    stock: StockItem[];
    settings: AppSettings;
  };
}
```

### Statut de Synchronisation
```typescript
interface SyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  error: string | null;
  totalRecords: number;
  syncedRecords: number;
}
```

## Configuration

### Variables d'Environment
- Aucune configuration spéciale requise
- Endpoints Netlify Functions détectés automatiquement
- Fallback localStorage en cas d'indisponibilité

### Paramètres Utilisateur
- **Toggle Activation**: Dans Paramètres > Cloud
- **Sync Manuelle**: Bouton "Synchroniser maintenant"
- **Export/Import**: Boutons de sauvegarde locale

## Sécurité

### Protection des Données
- **Aucun secret exposé**: Pas de clés API dans le frontend
- **CORS configuré**: Headers sécurisés dans netlify.toml
- **Validation côté serveur**: Vérification des données

### Authentication
- **User ID**: Identification via headers X-User-Id
- **Isolation**: Données séparées par utilisateur
- **Fallback**: Utilisateur "default" si pas d'auth

## Performance

### Optimisations
- **Compression locale**: Données compressées dans localStorage
- **Debouncing**: Évite les sync trop fréquentes
- **Streaming**: Pas de blocage de l'interface
- **Async**: Toutes les opérations non-bloquantes

### Limitations
- **Timeout Functions**: 10 secondes max
- **Taille max**: 50MB par function
- **Fréquence**: Respect des limites Netlify
- **Fallback**: LocalStorage limité à ~5-10MB

## Monitoring

### Métriques Suivies
- **Statut de synchronisation**: Succès/Échec
- **Nombre d'enregistrements**: Total et synchronisés
- **Timestamp**: Dernière synchronisation réussie
- **Erreurs**: Messages d'erreur détaillés

### Interface Utilisateur
- **Badge d'état**: Couleur selon le statut
- **Tooltip informatif**: Détails au survol
- **Notifications**: Toast pour succès/erreurs
- **Panneau de contrôle**: Interface complète

## Utilisation

### Activation
1. Aller dans Paramètres > Cloud
2. Activer "Synchronisation automatique"
3. La première sync démarre automatiquement

### Export Manuel
1. Paramètres > Cloud > "Exporter les données"
2. Fichier JSON téléchargé automatiquement
3. Nommage: `garage-backup-YYYY-MM-DD.json`

### Import Manuel
1. Paramètres > Cloud > "Importer les données"
2. Sélectionner fichier JSON de sauvegarde
3. Confirmation et remplacement des données

### Surveillance
- **Indicateur en-tête**: Statut visuel permanent
- **Page Paramètres**: Détails complets
- **Notifications**: Alertes automatiques

## Déploiement

### Prérequis
- Compte Netlify
- Repository GitHub
- Netlify Functions activées

### Configuration
- `netlify.toml` configuré
- Functions dans `/netlify/functions/`
- Build automatique via Git push

### Vérification
1. Site déployé sur Netlify
2. Functions accessibles via URL
3. Test de synchronisation manuel
4. Vérification des logs Netlify

## Troubleshooting

### Erreurs Communes
- **"Cannot find package '@github/spark'"**: Normal, utilise mocks en production
- **"Sync failed"**: Vérifier connectivité et logs Netlify
- **"No backup found"**: Première utilisation ou données effacées

### Solutions
- **Logs Netlify**: Vérifier Functions logs
- **Console navigateur**: Erreurs côté client
- **Test local**: `npm run dev` pour debug
- **Fallback**: Export/import manuel en cas de problème

### Support
- Documentation Netlify Functions
- Logs détaillés dans la console
- Mode debug via AuthDebugPanel
- Fallback localStorage toujours disponible

## Évolutions Futures

### Améliorations Possibles
- **Base de données persistante**: PostgreSQL/MongoDB
- **Versioning**: Historique des versions
- **Compression avancée**: Algorithmes plus efficaces
- **Sync incrémentale**: Seules les modifications
- **Multi-utilisateur**: Collaboration temps réel
- **Backup externalisé**: S3, Google Drive, etc.

### Intégrations
- **Webhooks**: Notifications externes
- **API REST**: Accès programmatique
- **Mobile**: Application mobile
- **Desktop**: Application Electron

Le système de synchronisation cloud offre une protection robuste des données avec une interface utilisateur intuitive et des performances optimisées pour un usage en production.