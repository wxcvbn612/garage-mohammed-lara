# Guide de Déploiement - Garage Mohammed

## Vue d'ensemble
Ce guide explique comment déployer l'application de gestion de garage avec synchronisation cloud sur Netlify.

## Prérequis
- Compte GitHub
- Compte Netlify (gratuit)
- Node.js 18+ installé localement

## Étapes de Déploiement

### 1. Préparation du Code

```bash
# Cloner le repository (si pas déjà fait)
git clone https://github.com/your-username/garage-mohammed.git
cd garage-mohammed

# Installer les dépendances
npm install

# Tester le build localement
npm run build
```

### 2. Configuration Netlify

#### Via Interface Web (Recommandé)

1. **Connecter le Repository**
   - Aller sur [app.netlify.com](https://app.netlify.com)
   - Cliquer sur "New site from Git"
   - Sélectionner GitHub et autoriser l'accès
   - Choisir votre repository `garage-mohammed`

2. **Configuration du Build**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Variables d'Environnement** (si nécessaire)
   ```
   NODE_VERSION=18
   CI=false
   ```

4. **Déployer**
   - Cliquer sur "Deploy site"
   - Attendre la fin du build (2-5 minutes)

#### Via CLI Netlify (Alternative)

```bash
# Installer le CLI Netlify
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Initialiser le site
netlify init

# Déployer manuellement
netlify deploy --prod --dir=dist
```

### 3. Configuration des Functions

Les Netlify Functions sont déjà configurées dans le dossier `netlify/functions/` :

- `backup-data.ts` - Gestion des sauvegardes cloud
- `sync-data.ts` - Statut et synchronisation

Ces functions sont automatiquement déployées avec votre site.

### 4. Configuration du Domaine (Optionnel)

1. **Domaine Personnalisé**
   - Dans Netlify Dashboard > Site settings > Domain management
   - Ajouter votre domaine personnalisé
   - Configurer les enregistrements DNS chez votre registrar

2. **HTTPS**
   - Activé automatiquement par Netlify
   - Certificat SSL Let's Encrypt gratuit

### 5. Variables d'Environnement de Production

Dans Netlify Dashboard > Site settings > Environment variables :

```
NODE_VERSION=18
CI=false
BUILD_COMMAND=npm run build
```

### 6. Configuration de la Base de Données

L'application utilise IndexedDB côté client pour le stockage local et Netlify Functions pour la synchronisation cloud.

**Options de Base de Données Serverless** (pour le futur) :
- **Netlify Blobs** : Stockage simple de fichiers
- **Supabase** : Base de données PostgreSQL
- **PlanetScale** : MySQL serverless
- **Firebase Firestore** : Base NoSQL

### 7. Monitoring et Analytics

#### Logs Netlify
```bash
# Voir les logs de functions
netlify logs --live

# Voir les logs de build
netlify build
```

#### Performance Monitoring
- Activé par défaut dans Netlify
- Analytics disponibles dans le dashboard

### 8. Sauvegarde et Restauration

#### Sauvegarde Automatique
- Configurée dans l'application (Paramètres > Cloud)
- Synchronisation automatique toutes les 5 minutes
- Stockage via Netlify Functions

#### Sauvegarde Manuelle
1. Dans l'application : Paramètres > Cloud > Exporter les données
2. Télécharge un fichier JSON avec toutes les données
3. Stocker ce fichier en sécurité

#### Restauration
1. Dans l'application : Paramètres > Cloud > Importer les données
2. Sélectionner le fichier JSON de sauvegarde
3. Confirmer l'import (remplace toutes les données)

### 9. Mise à Jour de l'Application

#### Déploiement Automatique
```bash
# Sur votre machine locale
git add .
git commit -m "Mise à jour de l'application"
git push origin main

# Netlify détecte automatiquement le push et redéploie
```

#### Déploiement Manuel
```bash
# Build local
npm run build

# Deploy via CLI
netlify deploy --prod --dir=dist
```

### 10. Sécurité

#### Configuration CORS
- Configurée dans `netlify.toml`
- Headers de sécurité activés

#### Authentification
- Système d'authentification intégré
- Gestion des rôles et permissions
- Sessions sécurisées via localStorage

### 11. Optimisations

#### Performance
- Build optimisé avec Vite
- Tree-shaking automatique
- Compression gzip activée par Netlify

#### SEO
- Meta tags configurés dans `index.html`
- URL propres avec redirections

#### PWA (Progressive Web App)
- Configuration possible avec Vite PWA plugin
- Installation sur mobile/desktop

### 12. Dépannage

#### Erreurs de Build Communes

**Error: Cannot find package '@github/spark'**
```bash
# Solution : Utiliser les mocks en production
# Le code utilise déjà les mocks automatiquement
```

**Error: Out of memory**
```bash
# Augmenter la mémoire Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Erreurs de Functions

**Function timeout**
- Timeout par défaut : 10 secondes
- Optimiser les requêtes de base de données

**CORS errors**
- Vérifier la configuration dans `netlify.toml`
- Headers correctement configurés

### 13. Support et Maintenance

#### Logs d'Erreur
- Netlify Dashboard > Functions
- Console du navigateur pour erreurs client

#### Monitoring
- Uptime monitoring via Netlify
- Alerts par email configurables

#### Mises à Jour de Sécurité
```bash
# Mettre à jour les dépendances
npm audit fix
npm update

# Rebuild et redéployer
npm run build
git add . && git commit -m "Security updates"
git push
```

### 14. URLs et Endpoints

Une fois déployé :
- **Application principale** : https://your-site.netlify.app
- **Functions API** : https://your-site.netlify.app/.netlify/functions/
- **Backup endpoint** : https://your-site.netlify.app/.netlify/functions/backup-data
- **Sync endpoint** : https://your-site.netlify.app/.netlify/functions/sync-data

### 15. Coûts et Limitations

#### Plan Gratuit Netlify
- 100GB bande passante/mois
- 300 minutes de build/mois
- 125k invocations de functions/mois
- Domaines personnalisés inclus

#### Limites
- Functions timeout : 10 secondes
- Taille max function : 50MB
- Build timeout : 15 minutes

Ces limites sont largement suffisantes pour une application de garage.

---

## Checklist de Déploiement

- [ ] Code poussé sur GitHub
- [ ] Site créé sur Netlify
- [ ] Build réussi sans erreurs
- [ ] Functions déployées
- [ ] Application accessible
- [ ] Synchronisation cloud testée
- [ ] Sauvegarde/restauration testée
- [ ] Performance validée
- [ ] Domaine configuré (optionnel)
- [ ] Monitoring activé

## Support

En cas de problème :
1. Vérifier les logs Netlify
2. Tester en local avec `npm run dev`
3. Consulter la documentation Netlify
4. Contacter le support technique

L'application est maintenant prête pour un usage en production avec sauvegarde cloud automatique !