/**
 * Hook pour initialiser l'application avec un utilisateur admin par défaut
 */

import { useEffect, useState } from 'react';
import { RepositoryFactory } from '../services/RepositoryService';

export function useDatabaseMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const initializeApp = async () => {
    try {
      setIsMigrating(true);

      console.log('Initialisation de l\'application...');

      const userRepo = RepositoryFactory.getUserRepository();
      const existingUsers = await userRepo.findAll();

      // Créer un utilisateur admin par défaut s'il n'existe pas
      if (existingUsers.length === 0) {
        console.log('Création de l\'utilisateur admin par défaut...');
        await userRepo.save({
          firstName: 'Admin',
          lastName: 'Garage',
          email: 'admin@garage.com',
          password: 'admin123', // Dans un vrai projet, ce serait hashé
          role: 'admin',
          permissions: [
            'customers.read', 'customers.create', 'customers.update', 'customers.delete',
            'vehicles.read', 'vehicles.create', 'vehicles.update', 'vehicles.delete',
            'repairs.read', 'repairs.create', 'repairs.update', 'repairs.delete',
            'invoices.read', 'invoices.create', 'invoices.update', 'invoices.delete',
            'reports.read', 'users.read', 'users.create', 'users.update', 'users.delete',
            'settings.update'
          ],
          isActive: true
        });
      }

      // Marquer l'initialisation comme terminée
      await window.spark.kv.set('app_initialized', true);
      setMigrationComplete(true);

      console.log('Initialisation terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    // Démarrer l'initialisation automatiquement au premier chargement
    const checkAndInitialize = async () => {
      const appInitialized = await window.spark.kv.get('app_initialized');
      if (!appInitialized) {
        await initializeApp();
      } else {
        setMigrationComplete(true);
      }
    };
    
    checkAndInitialize();
  }, []);

  return {
    isMigrating,
    migrationComplete,
    initializeApp
  };
}