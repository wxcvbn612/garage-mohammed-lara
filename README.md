# 🚗 Garage Management System

Système de gestion de garage professionnel développé avec React, TypeScript et Tailwind CSS pour Mohammed Larache.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table des Matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies](#️-technologies)
- [⚙️ Installation](#️-installation)
- [🚀 Déploiement GitHub](#-déploiement-github)
- [🌐 Déploiement Serveur](#-déploiement-serveur)
- [👤 Authentification](#-authentification)
- [📱 Interface](#-interface)
- [🔒 Sécurité](#-sécurité)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🚀 Fonctionnalités

### Gestion des Clients
- ✅ Ajout, modification et suppression de clients
- ✅ Fiche client détaillée avec historique
- ✅ Gestion des coordonnées et informations de contact

### Gestion des Véhicules
- ✅ Enregistrement des véhicules par client
- ✅ Galerie photos (état avant/après réparation)
- ✅ Historique complet des réparations
- ✅ Informations techniques complètes

### Gestion des Réparations
- ✅ Création et suivi des réparations
- ✅ Gestion des pièces et main d'œuvre
- ✅ Calcul automatique des coûts
- ✅ Statuts de réparation (en attente, en cours, terminé)

### Facturation
- ✅ Génération automatique de factures
- ✅ Calcul TVA et totaux
- ✅ Suivi des paiements
- ✅ Export et impression

### Système d'Authentification
- ✅ Connexion sécurisée
- ✅ Gestion des rôles et permissions
- ✅ Système d'utilisateurs multiples

### Paramètres et Configuration
- ✅ Configuration de la devise
- ✅ Paramètres du garage
- ✅ Personnalisation de l'interface

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Phosphor Icons
- **Storage**: Spark KV (système de stockage intégré)
- **Build**: Vite
- **Notifications**: Sonner

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/garage-management-system.git
cd garage-management-system
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer en mode développement**
```bash
npm run dev
```

4. **Accéder à l'application**
Ouvrez http://localhost:5173 dans votre navigateur

## 🚀 Déploiement GitHub

Pour pousser votre code vers GitHub et collaborer:

### Configuration Rapide

1. **Exécutez le script automatique**:
```bash
chmod +x deploy-github.sh
./deploy-github.sh
```

2. **Ou suivez le guide détaillé**: Consultez [GITHUB_DEPLOYMENT.md](./GITHUB_DEPLOYMENT.md)

### Étapes Manuelles

```bash
# 1. Configurez Git
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# 2. Créez un repository sur GitHub
# https://github.com/new -> garage-management-system

# 3. Connectez et poussez
git remote add origin https://github.com/VOTRE-USERNAME/garage-management-system.git
git add .
git commit -m "deploy: système de gestion de garage complet"
git push -u origin main
```

## 🌐 Déploiement Serveur

Pour déployer en production, consultez [DEPLOYMENT.md](./DEPLOYMENT.md) qui contient:

- 🐳 Configuration Docker
- 🌐 Déploiement Nginx
- ☁️ Solutions cloud (Vercel, Netlify, DigitalOcean)
- 🔒 Configuration HTTPS
- 📊 Monitoring et maintenance

## 👤 Authentification

### Première Connexion

Au premier lancement, l'application crée automatiquement un utilisateur administrateur:

- **Email**: `admin@garage.com`
- **Mot de passe**: `admin123`

⚠️ **Important**: Changez immédiatement ce mot de passe par défaut !

### Gestion des Utilisateurs

- 👤 **Administrateur**: Accès complet à toutes les fonctionnalités
- 🔧 **Mécanicien**: Gestion des réparations et rendez-vous
- 📊 **Gestionnaire**: Consultation des rapports et facturation
- 📝 **Réceptionniste**: Gestion clients et véhicules

## 📱 Interface

### Dashboard Principal
- 📊 Vue d'ensemble des statistiques
- 📈 Graphiques de performance
- 🔔 Notifications en temps réel
- ⚡ Actions rapides

### Responsive Design
- 📱 Optimisé mobile et tablette
- 🖥️ Interface desktop complète
- 🎨 Thème professionnel cohérent
- ♿ Accessibilité WCAG AA

## 🔒 Sécurité

- 🔐 Authentification sécurisée
- 🛡️ Gestion des permissions par rôle
- 🔒 Stockage local sécurisé
- 🚫 Protection CSRF
- 📝 Audit des actions utilisateur

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants shadcn/ui
│   ├── CustomerManagement.tsx
│   ├── VehicleManagement.tsx
│   ├── RepairsList.tsx
│   └── ...
├── hooks/              # Hooks personnalisés
│   ├── useAuth.ts
│   ├── useDatabase.ts
│   └── useAppSettings.ts
├── services/           # Services métier
│   ├── DatabaseService.ts
│   └── RepositoryService.ts
├── entities/           # Types et interfaces
├── utils/              # Utilitaires
└── App.tsx            # Composant principal
```

## 🛠️ Technologies

### Frontend
- ⚛️ **React 18+** - Interface utilisateur moderne
- 🔷 **TypeScript** - Typage statique et sécurité
- 🎨 **Tailwind CSS** - Styling utilitaire
- 🧩 **shadcn/ui** - Composants UI professionnels
- 📱 **Phosphor Icons** - Iconographie cohérente

### Backend & Data
- 💾 **Spark KV Store** - Base de données locale performante
- 🔒 **Système d'authentification** - Sécurité intégrée
- 📊 **Gestion d'état** - Hooks React personnalisés

### Build & Deploy
## 🤝 Contribution

Nous accueillons les contributions ! Voici comment participer:

### 1. Fork et Clone
```bash
# Forkez le repository sur GitHub
git clone https://github.com/VOTRE-USERNAME/garage-management-system.git
cd garage-management-system
```

### 2. Développement
```bash
# Créez une branche pour votre fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite

# Développez et testez vos modifications
npm run dev

# Committez vos changements
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
```

### 3. Pull Request
```bash
# Poussez votre branche
git push origin feature/ma-nouvelle-fonctionnalite

# Créez une Pull Request sur GitHub
```

### Guidelines
- 📝 Suivez les conventions de commit
- 🧪 Testez vos modifications
- 📚 Mettez à jour la documentation
- 🎨 Respectez le style de code

## 📞 Support

- 📧 **Email**: mohammed.larache@garage.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/USERNAME/garage-management-system/issues)
- 📖 **Documentation**: Consultez les fichiers `.md` du projet

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 🚀 Démarrage Rapide

```bash
# 1. Clonez ou téléchargez le projet
git clone https://github.com/USERNAME/garage-management-system.git

# 2. Installez les dépendances  
cd garage-management-system
npm install

# 3. Lancez l'application
npm run dev

# 4. Connectez-vous avec admin@garage.com / admin123
```

**🎉 Votre garage management system est prêt !**

> Développé avec ❤️ pour Mohammed Larache - Garage Professionnel

### Build de production
```bash
npm run build
```

### Plateformes supportées
- GitHub Pages
- Netlify
- Vercel
- Serveur VPS (Nginx)

## 📖 Documentation

- [Guide de Déploiement](./DEPLOYMENT.md) - Instructions complètes de déploiement
- [Configuration Git](./GIT_SETUP.md) - Guide Git et GitHub

## 🧹 Nettoyage des Données

Pour nettoyer toutes les données de test en développement:

```javascript
// Dans la console du navigateur
cleanAllData();
```

Ou utilisez l'utilitaire:
```javascript
import DataCleanup from './src/utils/DataCleanup';
DataCleanup.cleanAllData();
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

## 🏗️ Architecture

### Stockage des Données
L'application utilise le système Spark KV pour le stockage des données, offrant:
- Persistance automatique
- Synchronisation en temps réel
- API simple et efficace

### Système d'Authentification
- Gestion des rôles (admin, mécanicien, employé)
- Permissions granulaires par fonctionnalité
- Session sécurisée

### Pattern Repository
- Séparation des préoccupations
- Facilité de maintenance
- Tests unitaires simplifiés

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'feat: ajouter nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou assistance:
- Consultez la documentation
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

Développé avec ❤️ pour optimiser la gestion des garages automobiles.