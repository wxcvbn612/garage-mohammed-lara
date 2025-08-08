# Garage Management System

Un système de gestion de garage professionnel développé avec React, TypeScript et Tailwind CSS.

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

## 🔐 Première Connexion

Au premier lancement, l'application crée automatiquement un utilisateur administrateur:

- **Email**: `admin@garage.com`
- **Mot de passe**: `admin123`

⚠️ **Important**: Changez immédiatement ce mot de passe par défaut !

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

## 🚀 Déploiement

Consultez le [Guide de Déploiement](./DEPLOYMENT.md) pour les instructions détaillées.

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