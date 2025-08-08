# Guide de Déploiement GitHub - Garage Management System

## 🚀 Configuration Git et Push vers GitHub

### Prérequis
- Compte GitHub actif
- Git installé sur votre machine
- Accès au projet Garage Management System

## 📋 Étapes de Déploiement

### 1. Configuration Git Globale

Configurez Git avec vos informations personnelles :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### 2. Vérification du Repository Local

Le projet contient déjà un repository Git initialisé. Vérifiez l'état :

```bash
git status
git log --oneline
```

### 3. Création du Repository GitHub

1. **Connectez-vous à GitHub** : https://github.com
2. **Créez un nouveau repository** :
   - Cliquez sur le bouton "New" ou "+"
   - Nom du repository : `garage-management-system`
   - Description : `Système de gestion de garage professionnel avec React, TypeScript et authentification`
   - Visibilité : Public ou Private selon vos besoins
   - **⚠️ Important** : Ne cochez PAS "Initialize this repository with a README" (le code existe déjà)
3. **Cliquez sur "Create repository"**

### 4. Connection au Repository GitHub

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub :

```bash
# Ajouter l'origine GitHub
git remote add origin https://github.com/VOTRE-USERNAME/garage-management-system.git

# Vérifier la connexion
git remote -v
```

### 5. Préparation du Code pour le Push

```bash
# Vérifier les fichiers à committer
git status

# Ajouter tous les fichiers si nécessaire
git add .

# Créer un commit de déploiement
git commit -m "deploy: mise en production du système de gestion de garage

Fonctionnalités complètes:
- Gestion clients et véhicules avec galerie photos
- Système de réparations et rendez-vous  
- Authentification et gestion des utilisateurs
- Facturation et paramètres configurables
- Interface moderne React + TypeScript
- Base de données locale avec persistance"
```

### 6. Push vers GitHub

```bash
# S'assurer que la branche principale est 'main'
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

## 🔍 Vérification du Déploiement

Après le push, vérifiez sur GitHub que :

1. ✅ Tous les fichiers sont présents
2. ✅ Le README.md s'affiche correctement
3. ✅ La structure du projet est visible
4. ✅ Aucun fichier sensible n'est exposé (grâce au .gitignore)

## 📁 Structure du Projet Déployé

```
garage-management-system/
├── src/                     # Code source principal
│   ├── components/         # Composants React
│   ├── hooks/             # Hooks personnalisés
│   ├── assets/            # Images et médias
│   └── App.tsx            # Composant principal
├── public/                # Fichiers statiques
├── docs/                  # Documentation
│   ├── GIT_SETUP.md      # Guide Git complet
│   ├── DEPLOYMENT.md     # Guide déploiement serveur
│   └── SECURITY.md       # Politique de sécurité
├── package.json          # Dépendances
├── tsconfig.json         # Configuration TypeScript
└── README.md             # Documentation principale
```

## 🛠️ Workflow de Développement Continu

### Commits Réguliers

```bash
# Workflow quotidien
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité X"
git push origin main

# Types de commits recommandés
git commit -m "feat: nouvelle fonctionnalité"
git commit -m "fix: correction bug critique"
git commit -m "improve: optimisation performance"
git commit -m "docs: mise à jour documentation"
```

### Gestion des Branches

```bash
# Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonction

# Développer et committer
git add .
git commit -m "feat: développement nouvelle fonction"

# Pousser la branche
git push origin feature/nouvelle-fonction

# Merger dans main via Pull Request sur GitHub
```

## 🔐 Sécurité et Bonnes Pratiques

### Fichiers Protégés par .gitignore

Le projet ignore automatiquement :
- `node_modules/` - Dépendances npm
- `.env` - Variables d'environnement
- `dist/` - Build de production
- `.vscode/` - Configurations IDE
- `logs/` - Fichiers de log
- `.DS_Store` - Fichiers système macOS

### Vérification Avant Push

```bash
# Toujours vérifier avant de pousser
git status
git diff --cached
git log --oneline -5
```

## 🌐 Configuration GitHub Pages (Optionnel)

Pour héberger une démonstration :

1. Allez dans **Settings** > **Pages**
2. Source : **Deploy from a branch**
3. Branche : **main** / **/ (root)**
4. Cliquez **Save**

L'application sera accessible à : `https://VOTRE-USERNAME.github.io/garage-management-system`

## 🤝 Collaboration

### Inviter des Collaborateurs

1. **Settings** > **Manage access**
2. **Invite a collaborator**
3. Entrez l'email ou nom d'utilisateur GitHub
4. Définissez les permissions (Read, Write, Admin)

### Pull Requests

Pour les contributions :

```bash
# Fork du repository
# Clone de votre fork
git clone https://github.com/VOTRE-USERNAME/garage-management-system.git

# Branche de fonctionnalité
git checkout -b feature/ma-contribution

# Développement et commit
git add .
git commit -m "feat: ma contribution"
git push origin feature/ma-contribution

# Créer Pull Request sur GitHub
```

## 📊 Monitoring et Maintenance

### GitHub Actions (Optionnel)

Créez `.github/workflows/ci.yml` pour l'intégration continue :

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
```

### Suivi des Issues

Utilisez GitHub Issues pour :
- 🐛 Signaler des bugs
- ✨ Proposer des fonctionnalités
- 📋 Planifier le développement
- 🔧 Tâches de maintenance

## 🆘 Résolution de Problèmes

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

### Annuler des Modifications

```bash
# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Annuler complètement le dernier commit
git reset --hard HEAD~1
```

## 📞 Support

Pour obtenir de l'aide :

1. **Issues GitHub** : Créez une issue avec le tag `help wanted`
2. **Documentation** : Consultez les fichiers .md du projet
3. **Git Documentation** : https://git-scm.com/docs

---

## ✅ Checklist de Déploiement

- [ ] Git configuré avec nom et email
- [ ] Repository GitHub créé
- [ ] Remote origin ajouté
- [ ] Code committé localement
- [ ] Push réalisé avec succès
- [ ] Vérification sur GitHub effectuée
- [ ] README.md visible et correct
- [ ] .gitignore fonctionnel
- [ ] Aucun fichier sensible exposé

🎉 **Félicitations !** Votre système de gestion de garage est maintenant déployé sur GitHub et prêt pour le développement collaboratif !