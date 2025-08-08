# Guide de Déploiement - Garage Management System

## Table des Matières
1. [Prérequis](#prérequis)
2. [Préparation du Code](#préparation-du-code)
3. [Déploiement sur GitHub Pages](#déploiement-sur-github-pages)
4. [Déploiement sur Netlify](#déploiement-sur-netlify)
5. [Déploiement sur Vercel](#déploiement-sur-vercel)
6. [Déploiement sur Serveur VPS](#déploiement-sur-serveur-vps)
7. [Configuration Post-Déploiement](#configuration-post-déploiement)
8. [Sécurité](#sécurité)
9. [Maintenance](#maintenance)

## Prérequis

### Système de développement
- Node.js 18+ installé
- npm ou yarn
- Git installé et configuré

### Comptes de service (optionnels selon la méthode)
- Compte GitHub (pour GitHub Pages)
- Compte Netlify (pour Netlify)
- Compte Vercel (pour Vercel)
- Serveur VPS avec accès SSH (pour déploiement serveur)

## Préparation du Code

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/garage-management-system.git
cd garage-management-system
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Tester en local
```bash
npm run dev
```
Vérifiez que l'application fonctionne sur http://localhost:5173

### 4. Build de production
```bash
npm run build
```
Cela génère le dossier `dist/` avec les fichiers optimisés.

## Déploiement sur GitHub Pages

### Configuration
1. Créez un repository GitHub pour votre projet
2. Poussez votre code vers GitHub
3. Installez gh-pages:
```bash
npm install --save-dev gh-pages
```

4. Ajoutez dans `package.json`:
```json
{
  "homepage": "https://votre-username.github.io/garage-management-system",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

5. Configurez Vite pour GitHub Pages dans `vite.config.js`:
```javascript
export default defineConfig({
  base: '/garage-management-system/',
  // ... autres configurations
});
```

### Déploiement
```bash
npm run deploy
```

L'application sera disponible sur `https://votre-username.github.io/garage-management-system`

## Déploiement sur Netlify

### Méthode 1: Via l'interface web
1. Connectez-vous à [Netlify](https://netlify.com)
2. Cliquez "New site from Git"
3. Connectez votre repository GitHub
4. Configuration:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18
5. Variables d'environnement (si nécessaire):
   - `NODE_VERSION=18`
6. Cliquez "Deploy site"

### Méthode 2: Via Netlify CLI
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=dist
```

### Configuration spéciale pour ce projet
Le projet inclut un fichier `netlify.toml` qui configure automatiquement:
- Le répertoire de publication (`dist`)
- Les redirections SPA (Single Page Application)
- La mise en cache des assets
- La version Node.js

### Résolution des problèmes Netlify
Si vous rencontrez l'erreur `Cannot find package '@github/spark'`:
1. Assurez-vous que le fichier `vite.config.ts` utilise la configuration de production
2. Vérifiez que `package.json` ne contient pas `@github/spark` dans les dépendances
3. Confirmez que tous les imports utilisent `@/lib/spark-mocks` au lieu de `@github/spark/hooks`

Le projet a été configuré pour fonctionner en production sans les dépendances Spark.

## Déploiement sur Vercel

### Méthode 1: Via l'interface web
1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez "New Project"
3. Importez votre repository GitHub
4. Vercel détecte automatiquement la configuration Vite

### Méthode 2: Via Vercel CLI
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

## Déploiement sur Serveur VPS

### Prérequis serveur
- Ubuntu 20.04+ ou CentOS 8+
- Nginx installé
- Node.js 18+ installé
- PM2 pour la gestion des processus
- Certificat SSL (Let's Encrypt recommandé)

### 1. Préparation du serveur
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2

# Installer Nginx
sudo apt install nginx -y
```

### 2. Déploiement de l'application
```bash
# Cloner le projet
git clone https://github.com/votre-username/garage-management-system.git
cd garage-management-system

# Installer les dépendances
npm install

# Build de production
npm run build

# Copier les fichiers vers le répertoire web
sudo cp -r dist/* /var/www/html/
```

### 3. Configuration Nginx
Créez `/etc/nginx/sites-available/garage-management`:

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gestion des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Activez la configuration:
```bash
sudo ln -s /etc/nginx/sites-available/garage-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL avec Let's Encrypt
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

## Configuration Post-Déploiement

### 1. Première connexion
- URL: https://votre-domaine.com
- Identifiants par défaut:
  - Email: `admin@garage.com`
  - Mot de passe: `admin123`

⚠️ **Important**: Changez immédiatement le mot de passe par défaut !

### 2. Configuration initiale
1. Allez dans "Paramètres"
2. Configurez les informations du garage
3. Ajustez la devise si nécessaire
4. Créez des utilisateurs supplémentaires
5. Définissez les permissions appropriées

## Sécurité

### Recommandations importantes

1. **Changement des mots de passe par défaut**
   - Changez immédiatement le mot de passe admin
   - Utilisez des mots de passe forts

2. **HTTPS obligatoire**
   - Utilisez toujours HTTPS en production
   - Forcez la redirection HTTP vers HTTPS

3. **Sauvegarde des données**
   ```bash
   # Script de sauvegarde des données Spark
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   # Les données sont stockées dans Spark KV store
   # Implémentez votre stratégie de sauvegarde selon vos besoins
   ```

4. **Monitoring**
   - Surveillez les logs d'accès
   - Configurez des alertes pour les tentatives de connexion échouées
   - Monitoring des performances

5. **Mise à jour régulière**
   - Mettez à jour régulièrement les dépendances
   - Surveillez les failles de sécurité

## Maintenance

### Mise à jour de l'application
```bash
# Récupérer les dernières modifications
git pull origin main

# Réinstaller les dépendances
npm install

# Nouveau build
npm run build

# Déployer les nouveaux fichiers
sudo cp -r dist/* /var/www/html/

# Redémarrer Nginx si nécessaire
sudo systemctl restart nginx
```

### Sauvegarde et restauration
Les données de l'application sont stockées dans le système Spark KV. Pour une sauvegarde complète:

1. **Sauvegarde manuelle**
   - Exportez les données depuis l'interface admin
   - Conservez les fichiers de configuration

2. **Restauration**
   - Importez les données sauvegardées
   - Vérifiez l'intégrité des données

### Logs et surveillance
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitoring des ressources
htop
df -h
```

## Dépannage

### Problèmes courants

1. **Application ne se charge pas**
   - Vérifiez les chemins dans la configuration Nginx
   - Consultez les logs Nginx
   - Vérifiez que les fichiers sont bien copiés

2. **Erreurs JavaScript**
   - Vérifiez la console du navigateur
   - Assurez-vous que tous les assets sont accessibles

3. **Problèmes de permissions**
   - Vérifiez les permissions des fichiers web
   - Assurez-vous que Nginx peut lire les fichiers

4. **Certificat SSL**
   - Vérifiez l'expiration du certificat
   - Testez le renouvellement automatique

## Support

Pour toute question ou problème:
1. Consultez d'abord la documentation
2. Vérifiez les logs d'erreur
3. Contactez l'équipe de développement

---

**Note**: Ce guide couvre les déploiements les plus courants. Adaptez les instructions selon votre environnement spécifique.