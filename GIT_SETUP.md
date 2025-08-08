# Guide Git & GitHub - Garage Management System

## Configuration Git et Push vers GitHub

### 1. Configuration initiale de Git

Si ce n'est pas déjà fait, configurez Git avec vos informations:

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### 2. Initialiser le repository Git local

Dans le dossier de votre projet:

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit: Garage Management System"
```

### 3. Créer un repository sur GitHub

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur le bouton "New" ou "New repository"
3. Remplissez les informations:
   - **Repository name**: `garage-management-system` (ou le nom de votre choix)
   - **Description**: `Système de gestion de garage développé avec React et TypeScript`
   - **Visibility**: Public ou Private selon vos besoins
   - **Ne cochez PAS** "Initialize this repository with a README" (car vous avez déjà du code)

4. Cliquez "Create repository"

### 4. Connecter le repository local à GitHub

Remplacez `VOTRE-USERNAME` et `NOM-DU-REPO` par vos informations:

```bash
# Ajouter l'origine GitHub
git remote add origin https://github.com/VOTRE-USERNAME/NOM-DU-REPO.git

# Vérifier la connexion
git remote -v
```

### 5. Pousser le code vers GitHub

```bash
# Pousser sur la branche main
git push -u origin main
```

Si vous obtenez une erreur car la branche par défaut est `master`:
```bash
git branch -M main
git push -u origin main
```

## Workflow de développement recommandé

### Structure des branches

```bash
# Branche principale
main                    # Code stable, prêt pour la production

# Branches de développement
develop                 # Intégration des nouvelles fonctionnalités
feature/nom-feature     # Développement d'une fonctionnalité spécifique
hotfix/nom-bug         # Correction urgente de bug
```

### Créer une nouvelle fonctionnalité

```bash
# Créer et basculer sur une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Faire vos modifications...

# Ajouter les fichiers modifiés
git add .

# Committer avec un message descriptif
git commit -m "feat: ajouter gestion des rendez-vous"

# Pousser la branche
git push origin feature/nouvelle-fonctionnalite
```

### Messages de commit conventionnels

Utilisez la convention suivante pour vos messages de commit:

```bash
# Nouvelle fonctionnalité
git commit -m "feat: ajouter authentification utilisateur"

# Correction de bug
git commit -m "fix: corriger calcul des prix dans les factures"

# Amélioration
git commit -m "improve: optimiser la performance des requêtes"

# Documentation
git commit -m "docs: ajouter guide de déploiement"

# Style/formatage
git commit -m "style: corriger l'indentation des composants"

# Refactoring
git commit -m "refactor: réorganiser la structure des dossiers"

# Tests
git commit -m "test: ajouter tests pour les composants clients"
```

### Mettre à jour votre code local

```bash
# Récupérer les dernières modifications
git fetch origin

# Fusionner les modifications de main
git pull origin main
```

## Commandes Git essentielles

### Status et informations
```bash
# Voir l'état des fichiers
git status

# Voir l'historique des commits
git log --oneline

# Voir les différences
git diff
```

### Gestion des fichiers
```bash
# Ajouter des fichiers spécifiques
git add src/components/NewComponent.tsx

# Ajouter tous les fichiers modifiés
git add .

# Retirer un fichier de l'index
git reset HEAD fichier.txt
```

### Branches
```bash
# Lister les branches
git branch

# Créer une nouvelle branche
git branch nouvelle-branche

# Basculer vers une branche
git checkout nom-branche

# Créer et basculer en une commande
git checkout -b nouvelle-branche

# Supprimer une branche locale
git branch -d nom-branche

# Supprimer une branche distante
git push origin --delete nom-branche
```

### Annuler des modifications
```bash
# Annuler les modifications d'un fichier (avant add)
git checkout -- fichier.txt

# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Annuler le dernier commit (supprime les modifications)
git reset --hard HEAD~1
```

## Fichier .gitignore

Créez un fichier `.gitignore` pour ignorer les fichiers inutiles:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/
```

## Collaboration en équipe

### Pull Requests (PR)

1. **Créer une Pull Request**:
   - Poussez votre branche: `git push origin feature/ma-fonctionnalite`
   - Allez sur GitHub
   - Cliquez "Compare & pull request"
   - Ajoutez une description détaillée
   - Assignez des reviewers

2. **Template de PR** (créez `.github/pull_request_template.md`):
```markdown
## Description
Brève description des modifications apportées.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests manuels effectués
- [ ] Tous les tests passent

## Checklist
- [ ] Code review effectué
- [ ] Documentation mise à jour
- [ ] Aucun conflit de merge
```

### Résoudre les conflits

```bash
# Si il y a des conflits lors du merge
git pull origin main

# Résoudre les conflits dans les fichiers
# Éditer les fichiers en conflit

# Ajouter les fichiers résolus
git add .

# Terminer le merge
git commit -m "resolve: merge conflicts with main"
```

## Bonnes pratiques

### 1. Commits fréquents et atomiques
- Committez souvent avec des modifications logiques
- Un commit = une fonctionnalité ou une correction

### 2. Messages de commit clairs
- Utilisez l'impératif: "Add" au lieu de "Added"
- Limitez la première ligne à 50 caractères
- Ajoutez des détails si nécessaire

### 3. Branches descriptives
```bash
# Bon
feature/user-authentication
fix/invoice-calculation-bug
improve/dashboard-performance

# Éviter
my-changes
test
update
```

### 4. Synchronisation régulière
```bash
# Chaque jour de travail
git pull origin main

# Avant de commencer une nouvelle fonctionnalité
git checkout main
git pull origin main
git checkout -b feature/nouvelle-fonctionnalite
```

### 5. Nettoyage des branches
```bash
# Supprimer les branches locales fusionnées
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Nettoyer les références distantes
git remote prune origin
```

## Commandes de déploiement rapide

```bash
# Script de mise à jour complète
#!/bin/bash
git add .
git commit -m "update: $(date '+%Y-%m-%d %H:%M')"
git push origin main

# Build et déploiement
npm run build
# Puis suivre les instructions de déploiement selon votre plateforme
```

## Résolution de problèmes courants

### 1. Push rejeté
```bash
# Forcer le push (ATTENTION: peut écraser des modifications)
git push --force-with-lease origin main
```

### 2. Fichier trop volumineux
```bash
# Supprimer un fichier de l'historique
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch fichier-volumineux.pdf' --prune-empty --tag-name-filter cat -- --all
```

### 3. Changer l'URL du repository
```bash
# Modifier l'URL de origin
git remote set-url origin https://github.com/nouveau-username/nouveau-repo.git
```

---

Avec ce guide, vous devriez pouvoir gérer efficacement votre code avec Git et GitHub!