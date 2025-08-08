#!/bin/bash

# 🚀 Script de Déploiement GitHub - Garage Management System
# ============================================================
# Ce script automatise le processus de push vers GitHub

echo "🚀 Garage Management System - Déploiement GitHub"
echo "================================================="
echo

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage coloré
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

print_status "Git est installé"

# Vérifier si on est dans un repository Git
if [ ! -d ".git" ]; then
    print_warning "Pas de repository Git détecté. Initialisation..."
    git init
    print_status "Repository Git initialisé"
fi

# Vérifier la configuration Git
git_name=$(git config user.name)
git_email=$(git config user.email)

if [ -z "$git_name" ] || [ -z "$git_email" ]; then
    print_warning "Configuration Git manquante"
    echo
    echo "📋 Configurez Git avec vos informations:"
    echo "git config --global user.name \"Votre Nom\""
    echo "git config --global user.email \"votre.email@example.com\""
    echo
    read -p "Voulez-vous configurer Git maintenant? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Entrez votre nom: " user_name
        read -p "Entrez votre email: " user_email
        git config --global user.name "$user_name"
        git config --global user.email "$user_email"
        print_status "Configuration Git mise à jour"
    else
        print_error "Configuration Git requise pour continuer"
        exit 1
    fi
else
    print_status "Git configuré (Utilisateur: $git_name <$git_email>)"
fi

# Vérifier l'état du repository
echo
print_info "Vérification de l'état du repository..."
git status --porcelain > /dev/null

# Afficher les fichiers modifiés s'il y en a
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Fichiers modifiés détectés:"
    git status --short
    echo
fi

# Demander le nom du repository GitHub
echo
echo "🌐 Configuration du repository GitHub"
echo "======================================"
read -p "Entrez votre nom d'utilisateur GitHub: " github_username
read -p "Entrez le nom du repository (par défaut: garage-management-system): " repo_name

# Utiliser le nom par défaut si vide
if [ -z "$repo_name" ]; then
    repo_name="garage-management-system"
fi

# URL du repository
repo_url="https://github.com/$github_username/$repo_name.git"

print_info "Repository URL: $repo_url"

# Vérifier si le remote origin existe déjà
if git remote get-url origin &> /dev/null; then
    current_origin=$(git remote get-url origin)
    print_warning "Remote origin existe déjà: $current_origin"
    read -p "Voulez-vous le remplacer? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$repo_url"
        print_status "Remote origin mis à jour"
    fi
else
    git remote add origin "$repo_url"
    print_status "Remote origin ajouté"
fi

# Préparer les fichiers pour le commit
echo
print_info "Préparation des fichiers..."

# Ajouter tous les fichiers
git add .
print_status "Fichiers ajoutés à l'index"

# Vérifier s'il y a quelque chose à committer
if git diff --cached --quiet; then
    print_warning "Aucune modification à committer"
else
    # Créer un commit de déploiement
    commit_message="deploy: mise en production du système de gestion de garage

Fonctionnalités complètes:
- Gestion clients et véhicules avec galerie photos
- Système de réparations et rendez-vous
- Authentification et gestion des utilisateurs
- Facturation et paramètres configurables
- Interface moderne React + TypeScript
- Base de données locale avec persistance

Date de déploiement: $(date '+%Y-%m-%d %H:%M:%S')"

    git commit -m "$commit_message"
    print_status "Commit créé avec succès"
fi

# S'assurer que la branche principale est 'main'
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    print_info "Renommage de la branche vers 'main'"
    git branch -M main
fi

# Instructions pour GitHub
echo
echo "🔧 Instructions GitHub"
echo "======================"
print_info "1. Créez un repository sur GitHub:"
echo "   - Allez sur https://github.com/new"
echo "   - Nom: $repo_name"
echo "   - Description: Système de gestion de garage avec React et TypeScript"
echo "   - Public ou Private selon vos besoins"
echo "   - ⚠️  NE PAS initialiser avec README (le code existe déjà)"

echo
read -p "Avez-vous créé le repository sur GitHub? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo
    print_info "Push vers GitHub en cours..."
    
    # Tenter le push
    if git push -u origin main; then
        print_status "Push réussi!"
        echo
        echo "🎉 Déploiement terminé avec succès!"
        echo "📍 Votre code est maintenant disponible sur:"
        echo "   $repo_url"
        echo
        echo "🔍 Vérifiez que tout est correct sur GitHub:"
        echo "   - Tous les fichiers sont présents"
        echo "   - Le README.md s'affiche correctement"
        echo "   - Aucun fichier sensible n'est exposé"
    else
        print_error "Échec du push"
        echo
        print_info "Causes possibles:"
        echo "   - Repository GitHub non créé"
        echo "   - Nom d'utilisateur incorrect"
        echo "   - Permissions insuffisantes"
        echo
        print_info "Solutions:"
        echo "   - Vérifiez l'URL: $repo_url"
        echo "   - Créez le repository sur GitHub"
        echo "   - Vérifiez vos permissions"
    fi
else
    echo
    print_warning "Créez d'abord le repository sur GitHub, puis exécutez:"
    echo "git push -u origin main"
fi

# Commandes utiles
echo
echo "🛠️  Commandes Git utiles pour la suite"
echo "======================================"
echo "git status                    # Voir l'état des fichiers"
echo "git add .                     # Ajouter tous les fichiers"
echo "git commit -m \"message\"       # Faire un commit"
echo "git push origin main          # Pousser vers GitHub"
echo "git pull origin main          # Récupérer les modifications"
echo

# Prochaines étapes
echo "🎯 Prochaines étapes recommandées"
echo "=================================="
echo "1. 📖 Consultez DEPLOYMENT.md pour le déploiement serveur"
echo "2. 🔧 Configurez GitHub Actions pour CI/CD (optionnel)"
echo "3. 👥 Invitez des collaborateurs si nécessaire"
echo "4. 🌐 Activez GitHub Pages pour une démo (optionnel)"
echo "5. 📊 Créez des Issues pour organiser le développement"

echo
print_status "Script terminé. Bon développement! 🚀"