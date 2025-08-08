# Guide de Configuration Git et Push GitHub

## 🎯 Objectif

Ce guide vous accompagne pas à pas pour configurer Git et pousser votre système de gestion de garage vers GitHub.

## 🛠️ Méthodes Disponibles

### 1. Script Automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x deploy-github.sh

# Exécuter le script
./deploy-github.sh
```

Le script vous guidera à travers toutes les étapes automatiquement.

### 2. Configuration Manuelle

Si vous préférez contrôler chaque étape :

#### Étape 1: Configuration Git

```bash
# Configurer votre identité Git globalement
git config --global user.name "Mohammed Larache"
git config --global user.email "mohammed.larache@garage.com"

# Vérifier la configuration
git config --list | grep user
```

#### Étape 2: Préparer le Repository Local

```bash
# Vérifier l'état du repository
git status

# Ajouter tous les fichiers si nécessaire
git add .

# Créer un commit de déploiement
git commit -m "deploy: système de gestion de garage complet

Fonctionnalités implémentées:
- Gestion complète des clients et véhicules
- Galerie photos pour suivi des réparations
- Système d'authentification et permissions
- Facturation et paramètres configurables
- Interface moderne et responsive
- Base de données locale avec migration"
```

#### Étape 3: Créer le Repository GitHub

1. **Allez sur GitHub** : https://github.com/new
2. **Remplissez les informations** :
   - Nom : `garage-management-system`
   - Description : `Système de gestion de garage avec React et TypeScript`
   - Visibilité : Public ou Private
   - ⚠️ **NE PAS cocher** "Initialize with README"
3. **Cliquez "Create repository"**

#### Étape 4: Connecter et Pousser

```bash
# Ajouter l'origine GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/garage-management-system.git

# Vérifier la connexion
git remote -v

# S'assurer d'être sur la branche main
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

## ✅ Vérification du Déploiement

Après le push, vérifiez sur GitHub :

1. 📁 Tous les fichiers sont présents
2. 📖 Le README.md s'affiche correctement
3. 🔒 Aucun fichier sensible (.env) n'est exposé
4. 📝 L'historique des commits est visible

## 🔧 Configuration Avancée

### Variables d'Environnement GitHub

Si vous déployez en production, ajoutez les secrets GitHub :

1. **Repository Settings** > **Secrets and variables** > **Actions**
2. **Ajoutez les variables** :
   - `NODE_VERSION`: 18
   - `BUILD_COMMAND`: npm run build

### GitHub Actions (CI/CD)

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Run tests
      run: npm test
```

## 🌟 Bonnes Pratiques

### 1. Convention de Commits

```bash
# Nouvelle fonctionnalité
git commit -m "feat: ajouter gestion des photos véhicules"

# Correction de bug
git commit -m "fix: corriger calcul prix réparations"

# Amélioration
git commit -m "improve: optimiser chargement galerie"

# Documentation
git commit -m "docs: mettre à jour guide déploiement"
```

### 2. Gestion des Branches

```bash
# Branche principale (production)
main

# Branche de développement
develop

# Branches de fonctionnalités
feature/galerie-photos
feature/authentification-users
feature/facturation-avancee

# Branches de correction
hotfix/bug-critique-facturation
```

### 3. Workflow Collaboratif

```bash
# Démarrer une nouvelle fonctionnalité
git checkout main
git pull origin main
git checkout -b feature/nouvelle-fonction

# Développer...
git add .
git commit -m "feat: développer nouvelle fonction"

# Pousser et créer Pull Request
git push origin feature/nouvelle-fonction
```

## 🚨 Résolution de Problèmes

### Push Rejeté

```bash
# Si des modifications ont été faites sur GitHub
git pull origin main --rebase
git push origin main
```

### Conflit de Merge

```bash
# Résoudre manuellement les conflits dans les fichiers
# Puis :
git add .
git commit -m "resolve: conflits résolus"
git push origin main
```

### Changer l'URL du Repository

```bash
git remote set-url origin https://github.com/nouveau-username/nouveau-repo.git
```

### Annuler des Modifications

```bash
# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Annuler complètement le dernier commit
git reset --hard HEAD~1
```

## 📊 Monitoring GitHub

### Issues et Projects

1. **Créez des Issues** pour organiser le développement
2. **Utilisez les Projects** pour le suivi des tâches
3. **Assignez des Milestones** pour les versions

### Insights et Analytics

1. **Contributors** : Voir qui contribue au projet
2. **Traffic** : Statistiques de vues et clones
3. **Pulse** : Activité récente du repository

## 🔗 Ressources Utiles

- 📖 [Documentation Git officielle](https://git-scm.com/docs)
- 🐙 [GitHub Guides](https://guides.github.com/)
- 📝 [Conventional Commits](https://www.conventionalcommits.org/)
- 🚀 [GitHub Actions Documentation](https://docs.github.com/en/actions)

## ✅ Checklist de Déploiement

- [ ] Git configuré avec nom et email
- [ ] Repository GitHub créé
- [ ] Remote origin ajouté et vérifié
- [ ] Commit de déploiement créé
- [ ] Push réussi vers GitHub
- [ ] Vérification sur GitHub effectuée
- [ ] Documentation mise à jour
- [ ] .gitignore configuré correctement
- [ ] Aucun fichier sensible exposé

🎉 **Félicitations !** Votre garage management system est maintenant hébergé sur GitHub et prêt pour le développement collaboratif !