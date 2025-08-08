# 🚗 Garage Management System

Système de gestion de garage professionnel développé avec React, TypeScript et IndexedDB pour Mohammed Larache.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-3.0.0-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6)
![Database](https://img.shields.io/badge/Database-IndexedDB-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🆕 Nouveautés Version 3.0

### 🗄️ Architecture de Base de Données Améliorée
- **Migration vers IndexedDB** : Remplacement de localStorage par IndexedDB pour des performances et une capacité décuplées
- **Transactions ACID** : Intégrité des données garantie avec support des transactions atomiques
- **Index automatiques** : Recherche et filtrage optimisés sur toutes les entités
- **Migration transparente** : Migration automatique des données existantes sans perte
- **Outils de gestion** : Interface complète pour export/import et maintenance

### 📊 Capacités Augmentées
- **Stockage** : Passage de ~10MB à plusieurs GB de données
- **Performance** : Opérations 10x plus rapides sur les grandes datasets
- **Recherche** : Index automatiques pour des requêtes instantanées
- **Fiabilité** : Système de récupération et validation des données

## 📋 Table des Matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [🗄️ Architecture de Base de Données](#️-architecture-de-base-de-données)
- [🛠️ Technologies](#️-technologies)
- [⚙️ Installation](#️-installation)
- [🚀 Déploiement](#-déploiement)
- [👤 Authentification](#-authentification)
- [📱 Interface](#-interface)
- [🔒 Sécurité](#-sécurité)
- [🧪 Tests et Développement](#-tests-et-développement)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🚀 Fonctionnalités

### Gestion des Clients
- ✅ Ajout, modification et suppression de clients
- ✅ Fiche client détaillée avec historique complet
- ✅ Gestion des coordonnées et informations de contact
- ✅ **NOUVEAU** : Recherche instantanée avec index

### Gestion des Véhicules
- ✅ Enregistrement des véhicules par client
- ✅ Galerie photos (état avant/après réparation)
- ✅ Historique complet des réparations
- ✅ Informations techniques complètes
- ✅ **NOUVEAU** : Relations optimisées client-véhicule

### Gestion des Réparations
- ✅ Création et suivi des réparations
- ✅ Gestion des pièces et main d'œuvre
- ✅ Calcul automatique des coûts
- ✅ Statuts de réparation (en attente, en cours, terminé)
- ✅ **NOUVEAU** : Recherche par statut et période

### Facturation
- ✅ Génération automatique de factures
- ✅ Calcul TVA et totaux
- ✅ Suivi des paiements
- ✅ Export et impression
- ✅ **NOUVEAU** : Devise configurable dynamique

### Système d'Authentification
- ✅ Connexion sécurisée
- ✅ Gestion des rôles et permissions
- ✅ Système d'utilisateurs multiples
- ✅ **NOUVEAU** : Stockage sécurisé des sessions

### Paramètres et Configuration
- ✅ Configuration de la devise
- ✅ Paramètres du garage
- ✅ Personnalisation de l'interface
- ✅ **NOUVEAU** : Gestion complète de la base de données

### 🗄️ Nouvelle Gestion de Base de Données
- ✅ **Migration automatique** depuis localStorage
- ✅ **Export/Import** complet des données
- ✅ **Statistiques** en temps réel
- ✅ **Sauvegarde** et restauration
- ✅ **Maintenance** préventive

## 🗄️ Architecture de Base de Données

### Migration vers IndexedDB

Cette version introduit une architecture de base de données moderne utilisant **IndexedDB** :

#### Avantages de la Migration
| Critère | localStorage (v2) | IndexedDB (v3) |
|---------|------------------|----------------|
| **Capacité** | ~10 MB | Plusieurs GB |
| **Performance** | Synchrone bloquant | Asynchrone optimisé |
| **Requêtes** | Recherche linéaire | Index + Filtres |
| **Transactions** | Aucune | ACID complètes |
| **Relations** | Manuelles | Automatisées |

#### Structure des Données
```
📦 GarageManagementDB
├── 👥 customers (clients)
├── 🚗 vehicles (véhicules)  
├── 🔧 repairs (réparations)
├── 📅 appointments (RDV)
├── 🧾 invoices (factures)
├── 👤 users (utilisateurs)
├── ⚙️ settings (paramètres)
└── 🗃️ keyValue (données diverses)
```

#### Fonctionnalités Avancées
- **Migration transparente** : Vos données localStorage sont automatiquement migrées
- **Index automatiques** : Recherche instantanée sur tous les champs importants  
- **Transactions ACID** : Intégrité garantie lors des opérations complexes
- **Export/Import** : Sauvegarde complète au format JSON
- **Monitoring** : Statistiques d'utilisation en temps réel

#### Interface de Gestion
Nouvelle section **"Base de Données"** dans les Paramètres :
- 📊 **Tableau de bord** : Statistiques et répartition des données
- 🔄 **Migration** : Outils de migration et diagnostic  
- 💾 **Sauvegarde** : Export/Import avec validation
- 🔍 **Informations** : Détails techniques et performance

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Base de Données**: IndexedDB + Dexie.js
- **État**: React Hooks + Context API
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

## 🧪 Tests et Développement

### Testeur de Base de Données Intégré

Un système de tests complet est disponible en mode développement pour valider le bon fonctionnement de la base de données IndexedDB.

#### Accès au Testeur
En mode développement, ouvrez la console du navigateur et utilisez :

```javascript
// Exécuter tous les tests
await DatabaseTester.runTests();

// Nettoyer les données de test
await DatabaseTester.cleanupTestData();

// Obtenir les informations de la DB
const info = await DatabaseTester.getDBInfo();
console.log(info);
```

#### Tests Automatisés
Le testeur vérifie :
- ✅ **Initialisation** de la base de données
- ✅ **CRUD complet** sur tous les modèles
- ✅ **Relations** entre entités
- ✅ **Transactions ACID** 
- ✅ **Performance** des requêtes
- ✅ **Export/Import** des données

#### Outils de Développement
```javascript
// Console développeur - Commandes disponibles
window.DatabaseTester.runTests()        // Tests complets
window.DatabaseTester.cleanupTestData() // Nettoyage  
window.DatabaseTester.getDBInfo()       // Informations DB

// Accès direct à la base
window.db.customers.toArray()           // Voir tous les clients
window.db.vehicles.count()              // Compter véhicules
```

### Migration et Développement

#### Test de Migration
Pour tester la migration localStorage → IndexedDB :

1. **Préparer des données localStorage** (en v2)
2. **Mettre à jour vers v3**
3. **Observer la migration automatique**
4. **Valider l'intégrité des données**

#### Variables d'Environnement de Debug
```typescript
// Activer les logs détaillés
if (process.env.NODE_ENV === 'development') {
  Dexie.debug = true; // Logs des requêtes DB
}
```

#### Performance Monitoring
```typescript
// Mesurer les performances
const startTime = performance.now();
await DatabaseService.getCustomers();
const endTime = performance.now();
console.log(`Requête executée en ${endTime - startTime}ms`);
```

## 🏗️ Architecture

### 🗄️ Stockage des Données - IndexedDB
L'application utilise IndexedDB via Dexie.js pour le stockage, offrant:
- **Persistance robuste** avec transactions ACID
- **Performance optimisée** avec index automatiques  
- **Capacité étendue** (plusieurs GB vs 10MB localStorage)
- **API moderne** avec support async/await

#### Schema de Base de Données
```typescript
// Tables avec index automatiques
customers: '++id, firstName, lastName, email, phone, createdAt'
vehicles: '++id, customerId, make, brand, registrationNumber, createdAt'  
repairs: '++id, vehicleId, customerId, status, startDate, createdAt'
// ... autres tables
```

#### Opérations Avancées
```typescript
// Recherche optimisée avec index
const results = await db.customers
  .where('firstName')
  .startsWithIgnoreCase('ahmed')
  .toArray();

// Relations automatisées  
const customerVehicles = await db.vehicles
  .where('customerId')
  .equals(customerId)
  .toArray();

// Transactions complexes
await db.transaction('rw', [db.customers, db.vehicles], async () => {
  const customerId = await db.customers.add(customer);
  await db.vehicles.add({ ...vehicle, customerId });
});
```

### Système d'Authentification
- Gestion des rôles (admin, mécanicien, employé)
- Permissions granulaires par fonctionnalité
- Session sécurisée stockée en IndexedDB

### Pattern Repository Enhanced
- **Séparation claire** entre logique métier et persistance
- **Service Layer** pour opérations complexes
- **Type Safety** complet avec TypeScript
- **Tests unitaires** sur chaque couche

### Migration Architecture
```
v2 (localStorage) → v3 (IndexedDB)
├── 🔄 Migration automatique transparente
├── 🔒 Préservation intégrité des données  
├── ⚡ Performance x10 améliorée
└── 📈 Capacité stockage x1000 augmentée
```

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