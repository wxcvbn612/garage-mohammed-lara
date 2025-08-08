#!/bin/bash

# Script de déploiement Git pour Garage Management System
# Ce script configure Git et pousse le code vers GitHub

echo "🚀 Garage Management System - Configuration Git & GitHub"
echo "========================================================"

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo
echo "📋 Étapes à suivre:"
echo "1. Configurez Git avec vos informations"
echo "2. Créez un repository sur GitHub"
echo "3. Exécutez les commandes de push"
echo

# Configuration Git
echo "🔧 Configuration Git"
echo "--------------------"
echo "Exécutez ces commandes avec vos informations:"
echo
echo "git config --global user.name \"Votre Nom\""
echo "git config --global user.email \"votre.email@example.com\""
echo

# Initialisation du repository
echo "📁 Initialisation du repository local"
echo "--------------------------------------"
echo "git init"
echo "git add ."
echo "git commit -m \"Initial commit: Garage Management System\""
echo

# Repository GitHub
echo "🌐 Création du repository GitHub"
echo "--------------------------------"
echo "1. Allez sur https://github.com"
echo "2. Cliquez sur 'New repository'"
echo "3. Nom: garage-management-system"
echo "4. Description: Système de gestion de garage avec React et TypeScript"
echo "5. Public ou Private selon vos besoins"
echo "6. NE PAS initialiser avec README (vous avez déjà du code)"
echo "7. Cliquez 'Create repository'"
echo

# Commandes de push
echo "📤 Push vers GitHub"
echo "-------------------"
echo "Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub:"
echo
echo "git remote add origin https://github.com/VOTRE-USERNAME/garage-management-system.git"
echo "git branch -M main"
echo "git push -u origin main"
echo

# Vérification
echo "✅ Vérification"
echo "---------------"
echo "Après le push, vérifiez:"
echo "- Votre code est visible sur GitHub"
echo "- Tous les fichiers sont présents"
echo "- Le README.md s'affiche correctement"
echo

# Prochaines étapes
echo "🎯 Prochaines étapes"
echo "--------------------"
echo "1. Consultez DEPLOYMENT.md pour le déploiement"
echo "2. Configurez les GitHub Actions (optionnel)"
echo "3. Invitez des collaborateurs si nécessaire"
echo

# Commandes utiles
echo "🛠️ Commandes Git utiles"
echo "-----------------------"
echo "git status                    # Voir l'état des fichiers"
echo "git add .                     # Ajouter tous les fichiers"
echo "git commit -m \"message\"       # Faire un commit"
echo "git push origin main          # Pousser vers GitHub"
echo "git pull origin main          # Récupérer les modifications"
echo

echo "📚 Pour plus d'informations, consultez GIT_SETUP.md"
echo

# Option pour exécuter automatiquement
read -p "Voulez-vous exécuter automatiquement l'initialisation Git? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Initialisation Git en cours..."
    
    # Initialiser Git si pas déjà fait
    if [ ! -d ".git" ]; then
        git init
        echo "✅ Repository Git initialisé"
    fi
    
    # Ajouter tous les fichiers
    git add .
    echo "✅ Fichiers ajoutés"
    
    # Faire le commit initial
    git commit -m "Initial commit: Garage Management System

    Fonctionnalités implémentées:
    - Gestion des clients et véhicules
    - Système de réparations
    - Galerie photos
    - Authentification et permissions
    - Facturation et paramètres
    - Interface moderne avec React + TypeScript"
    
    echo "✅ Commit initial créé"
    echo
    echo "🌐 Maintenant, créez votre repository sur GitHub et exécutez:"
    echo "git remote add origin https://github.com/VOTRE-USERNAME/garage-management-system.git"
    echo "git push -u origin main"
else
    echo "ℹ️ Exécutez manuellement les commandes Git selon vos besoins."
fi

echo
echo "🎉 Configuration terminée ! Bon développement !"