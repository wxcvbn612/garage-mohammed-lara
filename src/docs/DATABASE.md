# Système de Base de Données - Garage Mohammed Larache

## Vue d'ensemble

Le système de gestion du garage utilise maintenant une architecture de base de données robuste inspirée de Symfony Doctrine, offrant :

- **Validation des données** avec contraintes et règles métier
- **Relations entre entités** (Foreign Keys, One-to-Many, Many-to-One)
- **Query Builder** pour des requêtes complexes
- **Repository Pattern** pour une organisation claire du code
- **Migrations automatiques** des données existantes
- **Hooks React** pour une intégration simplifiée

## Architecture

### Services Principaux

1. **DatabaseService** (`src/services/DatabaseService.ts`)
   - Service principal de base de données
   - Gestion des schémas, contraintes et validations
   - Query Builder pour requêtes avancées
   - Système de migrations

2. **RepositoryService** (`src/services/RepositoryService.ts`)
   - Pattern Repository pour chaque entité
   - Méthodes spécialisées par type d'entité
   - Factory pour créer les repositories

3. **EntityManager** (`src/services/EntityManager.ts`)
   - Service de base pour la persistance
   - Validation simple des entités
   - Interface compatible avec l'ancien système

### Hooks React

4. **useDatabase** (`src/hooks/useDatabase.ts`)
   - Hooks pour chaque type d'entité (useCustomers, useVehicles, etc.)
   - Gestion automatique du loading et des erreurs
   - Méthodes CRUD simplifiées

5. **useDatabaseMigration** (`src/hooks/useDatabaseMigration.ts`)
   - Migration automatique des données existantes
   - Création de données de test si nécessaire
   - Initialisation des utilisateurs par défaut

## Schémas de Base de Données

### Clients (customers)
```typescript
{
  id: string (unique)
  firstName: string (requis, min: 2)
  lastName: string (requis, min: 2)
  email: string (requis, unique, format email)
  phone: string (requis)
  address: string
  city: string
  postalCode: string
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### Véhicules (vehicles)
```typescript
{
  id: string (unique)
  customerId: string (Foreign Key -> customers.id)
  make: string (requis)
  model: string (requis)
  year: number (requis)
  licensePlate: string (requis, unique)
  vin: string
  color: string
  mileage: number (défaut: 0)
  fuelType: string
  transmission: string
  photos: string[] (défaut: [])
  createdAt: Date
  updatedAt: Date
}
```

### Réparations (repairs)
```typescript
{
  id: string (unique)
  vehicleId: string (Foreign Key -> vehicles.id)
  customerId: string (Foreign Key -> customers.id)
  mechanicId: string (optionnel)
  title: string (requis)
  description: string (requis)
  status: string (défaut: 'pending')
  priority: string (défaut: 'medium')
  estimatedCost: number (défaut: 0)
  actualCost: number (défaut: 0)
  estimatedDuration: number
  startDate: Date
  endDate: Date
  parts: Array (défaut: [])
  laborHours: number (défaut: 0)
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### Utilisateurs (users)
```typescript
{
  id: string (unique)
  firstName: string (requis)
  lastName: string (requis)
  email: string (requis, unique)
  password: string (requis)
  role: string (requis, défaut: 'mechanic')
  permissions: string[] (défaut: [])
  isActive: boolean (défaut: true)
  createdAt: Date
  updatedAt: Date
}
```

## Relations

### Client → Véhicules (One-to-Many)
- Un client peut avoir plusieurs véhicules
- Chaque véhicule appartient à un seul client

### Véhicule → Réparations (One-to-Many)
- Un véhicule peut avoir plusieurs réparations
- Chaque réparation concerne un seul véhicule

### Client → Réparations (One-to-Many)
- Un client peut avoir plusieurs réparations
- Chaque réparation appartient à un seul client

## Utilisation

### Dans les Composants React

```typescript
import { useCustomers } from '../hooks/useDatabase';

function CustomerComponent() {
  const { 
    customers, 
    loading, 
    error, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer 
  } = useCustomers();

  const handleCreate = async (customerData) => {
    try {
      const newCustomer = await createCustomer(customerData);
      // Le state est automatiquement mis à jour
    } catch (error) {
      // Gestion d'erreur
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.firstName}</div>
      ))}
    </div>
  );
}
```

### Avec Query Builder

```typescript
import { RepositoryFactory } from '../services/RepositoryService';

const customerRepo = RepositoryFactory.getCustomerRepository();

// Recherche avancée
const results = await customerRepo
  .createQueryBuilder()
  .where('city', '=', 'Larache')
  .where('createdAt', '>', new Date('2024-01-01'))
  .orderBy('lastName', 'ASC')
  .limit(10)
  .execute();

// Recherche avec relations
const customerWithVehicles = await customerRepo
  .findWithVehicles('customer-id');
```

### Validation Automatique

Le système valide automatiquement :
- **Champs requis** : firstName, lastName, email pour les clients
- **Formats** : validation email, formats de données
- **Contraintes uniques** : email client, plaque d'immatriculation
- **Relations** : vérification des Foreign Keys
- **Types de données** : string, number, boolean, date, array

## Migration des Données

La migration s'effectue automatiquement au démarrage :

1. **Vérification** : Le système vérifie si la migration a déjà été effectuée
2. **Migration** : Les données existantes sont transférées vers le nouveau système
3. **Validation** : Chaque entité est validée selon les nouvelles règles
4. **Données de test** : Si aucune donnée n'existe, des données de test sont créées
5. **Utilisateurs par défaut** : Création d'un admin et d'un mécanicien

### Utilisateurs par Défaut

**Admin :**
- Email: admin@garage.com
- Mot de passe: admin123
- Toutes les permissions

**Mécanicien :**
- Email: mohammed@garage.com  
- Mot de passe: mohammed123
- Permissions limitées

## Avantages du Nouveau Système

1. **Robustesse** : Validation stricte des données
2. **Cohérence** : Relations garanties entre entités
3. **Performance** : Query Builder optimisé
4. **Maintenabilité** : Architecture claire et organisée
5. **Évolutivité** : Facile d'ajouter de nouvelles entités
6. **Sécurité** : Validation et contraintes renforcées

## Compatibilité

Le nouveau système est **rétrocompatible** :
- Les données existantes sont automatiquement migrées
- L'ancien EntityManager reste disponible
- Transition transparente pour l'utilisateur

## Développement Futur

Fonctionnalités prévues :
- [ ] Backup/Restore automatique
- [ ] Audit trail des modifications
- [ ] Cache intelligent
- [ ] Recherche full-text
- [ ] Statistiques avancées
- [ ] API REST pour intégrations externes