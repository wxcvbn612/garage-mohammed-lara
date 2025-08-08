# Guide de Déploiement - Garage Management System

## Architecture de la Base de Données

### Migration vers IndexedDB

L'application utilise maintenant **IndexedDB** au lieu de localStorage pour un stockage de données plus robuste et performant :

- **IndexedDB** : Base de données NoSQL native du navigateur
- **Support des transactions** : Opérations atomiques sécurisées
- **Index et requêtes** : Recherche et filtrage optimisés
- **Capacité de stockage** : Beaucoup plus importante que localStorage
- **Performance** : Opérations asynchrones et optimisées

### Fonctionnalités de la Base de Données

1. **Migration automatique** : Les données localStorage existantes sont automatiquement migrées vers IndexedDB
2. **Backup et restauration** : Possibilité d'exporter/importer les données
3. **Intégrité des données** : Validation et contraintes de clés étrangères
4. **Performance** : Recherche indexée et pagination optimisée

## Options de Déploiement

### 1. Déploiement Netlify (Recommandé)

#### Configuration Netlify via Interface Web

1. **Connecter le repository GitHub**
   - Aller sur [netlify.com](https://netlify.com)
   - Cliquer sur "Add new site" > "Import an existing project"
   - Choisir GitHub et sélectionner votre repository

2. **Configuration de build**
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18 ou plus récent
   ```

3. **Variables d'environnement** (optionnel)
   ```
   NODE_ENV=production
   ```

4. **Redirections** (automatique avec SPA)
   ```
   /* /index.html 200
   ```

#### Avantages Netlify
- ✅ Déploiement automatique sur push GitHub
- ✅ HTTPS gratuit
- ✅ CDN global
- ✅ Formulaires de contact (si nécessaire)
- ✅ Fonctions serverless (pour futures extensions)

### 2. Déploiement Vercel

#### Via CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configuration automatique détectée
```

#### Via Interface Web
1. Aller sur [vercel.com](https://vercel.com)
2. Importer le repository GitHub
3. Configuration automatique détectée

### 3. Déploiement GitHub Pages

#### Configuration dans le repository
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. Déploiement sur Serveur VPS

#### Prérequis Serveur
```bash
# Installation Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation Nginx
sudo apt update
sudo apt install nginx

# Installation PM2 (gestionnaire de processus)
sudo npm install -g pm2
```

#### Configuration Nginx
```nginx
# /etc/nginx/sites-available/garage-management
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/garage-management/dist;
    index index.html;

    # Configuration SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Script de Déploiement
```bash
#!/bin/bash
# deploy.sh

# Variables
REPO_URL="https://github.com/votre-username/garage-management.git"
DEPLOY_DIR="/var/www/garage-management"
BACKUP_DIR="/var/backups/garage-management"

# Sauvegarde
sudo mkdir -p $BACKUP_DIR
sudo cp -r $DEPLOY_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)

# Déploiement
cd /tmp
git clone $REPO_URL garage-temp
cd garage-temp

# Build
npm ci
npm run build

# Déploiement
sudo rm -rf $DEPLOY_DIR/dist
sudo mkdir -p $DEPLOY_DIR
sudo cp -r dist $DEPLOY_DIR/
sudo chown -R www-data:www-data $DEPLOY_DIR

# Nettoyage
cd /
rm -rf /tmp/garage-temp

echo "Déploiement terminé avec succès!"
```

## Configuration de Production

### 1. Optimisations Performance

#### Configuration Vite
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          database: ['dexie']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### Service Worker (PWA)
```javascript
// public/sw.js
const CACHE_NAME = 'garage-management-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### 2. Monitoring et Analytics

#### Configuration des erreurs
```typescript
// src/utils/errorReporting.ts
export const reportError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'production') {
    // Intégration avec service de monitoring
    // Ex: Sentry, LogRocket, etc.
    console.error(`[${context}]`, error);
  }
};
```

### 3. Sécurité

#### Headers de Sécurité
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Maintenance et Backup

### 1. Backup des Données Utilisateur

#### Export IndexedDB
```typescript
// Fonction d'export des données
export const exportDatabase = async (): Promise<string> => {
  const data = {
    customers: await db.customers.toArray(),
    vehicles: await db.vehicles.toArray(),
    repairs: await db.repairs.toArray(),
    appointments: await db.appointments.toArray(),
    invoices: await db.invoices.toArray(),
    settings: await db.settings.toArray(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};
```

#### Import des données
```typescript
export const importDatabase = async (jsonData: string): Promise<void> => {
  const data = JSON.parse(jsonData);
  
  await db.transaction('rw', [db.customers, db.vehicles, db.repairs], async () => {
    await db.customers.clear();
    await db.vehicles.clear();
    await db.repairs.clear();
    
    await db.customers.bulkAdd(data.customers);
    await db.vehicles.bulkAdd(data.vehicles);
    await db.repairs.bulkAdd(data.repairs);
  });
};
```

### 2. Monitoring Performance

#### Métriques à surveiller
- Temps de chargement initial
- Taille des chunks JavaScript
- Performance des requêtes IndexedDB
- Erreurs JavaScript côté client

## Troubleshooting

### Problèmes Courants

1. **Erreur de migration IndexedDB**
   ```
   Solution: Vider le cache du navigateur et recharger
   ```

2. **Performance lente**
   ```
   Solution: Vérifier la taille de la base de données, optimiser les requêtes
   ```

3. **Problèmes de déploiement**
   ```
   Solution: Vérifier les logs de build, dépendances manquantes
   ```

### Logs et Debugging

#### Mode Debug
```typescript
// Activer les logs en développement
if (process.env.NODE_ENV === 'development') {
  Dexie.debug = true;
}
```

## Conclusion

Cette architecture avec IndexedDB offre :
- ✅ **Performance supérieure** à localStorage
- ✅ **Capacité de stockage** importante
- ✅ **Requêtes complexes** avec index
- ✅ **Transactions atomiques** pour l'intégrité
- ✅ **Migration automatique** des données existantes
- ✅ **Compatible** avec tous les navigateurs modernes

L'application est maintenant prête pour un déploiement en production avec une base de données robuste et évolutive.