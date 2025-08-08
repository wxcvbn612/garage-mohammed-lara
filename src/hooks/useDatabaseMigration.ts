/**
 * Hook pour migrer les données existantes vers le nouveau système de base de données
 * et initialiser des données de test si nécessaire
 */

import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import DatabaseService from '../services/DatabaseService';
import { RepositoryFactory } from '../services/RepositoryService';
import { Customer, Vehicle, Repair, User } from '../entities';

export function useDatabaseMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [legacyCustomers] = useKV<Customer[]>('customers', []);
  const [legacyVehicles] = useKV<Vehicle[]>('vehicles', []);
  const [legacyRepairs] = useKV<Repair[]>('repairs', []);
  const [legacyUsers] = useKV<User[]>('users', []);

  const db = DatabaseService;

  const migrateData = async () => {
    try {
      setIsMigrating(true);

      // Force re-migration pour corriger les données
      console.log('Début de la migration des données...');

      // Migration des clients
      if (legacyCustomers.length > 0) {
        console.log(`Migration de ${legacyCustomers.length} clients...`);
        const customerRepo = RepositoryFactory.getCustomerRepository();
        
        for (const customer of legacyCustomers) {
          try {
            // Vérifier si le client existe déjà
            const existing = await customerRepo.findById(customer.id);
            if (!existing) {
              const { id, createdAt, updatedAt, ...customerData } = customer;
              await customerRepo.save(customerData);
            }
          } catch (error) {
            console.warn(`Erreur lors de la migration du client ${customer.id}:`, error);
          }
        }
      }

      // Migration des véhicules
      if (legacyVehicles.length > 0) {
        console.log(`Migration de ${legacyVehicles.length} véhicules...`);
        const vehicleRepo = RepositoryFactory.getVehicleRepository();
        
        for (const vehicle of legacyVehicles) {
          try {
            // Vérifier si le véhicule existe déjà
            const existing = await vehicleRepo.findById(vehicle.id);
            if (!existing) {
              const { id, createdAt, updatedAt, ...vehicleData } = vehicle;
              await vehicleRepo.save(vehicleData);
            }
          } catch (error) {
            console.warn(`Erreur lors de la migration du véhicule ${vehicle.id}:`, error);
          }
        }
      }

      // Migration des réparations
      if (legacyRepairs.length > 0) {
        console.log(`Migration de ${legacyRepairs.length} réparations...`);
        const repairRepo = RepositoryFactory.getRepairRepository();
        
        for (const repair of legacyRepairs) {
          try {
            // Vérifier si la réparation existe déjà
            const existing = await repairRepo.findById(repair.id);
            if (!existing) {
              const { id, createdAt, updatedAt, ...repairData } = repair;
              await repairRepo.save(repairData);
            }
          } catch (error) {
            console.warn(`Erreur lors de la migration de la réparation ${repair.id}:`, error);
          }
        }
      }

      // Migration des utilisateurs
      if (legacyUsers.length > 0) {
        console.log(`Migration de ${legacyUsers.length} utilisateurs...`);
        const userRepo = RepositoryFactory.getUserRepository();
        
        for (const user of legacyUsers) {
          try {
            // Vérifier si l'utilisateur existe déjà
            const existing = await userRepo.findById(user.id);
            if (!existing) {
              const { id, createdAt, updatedAt, ...userData } = user;
              await userRepo.save(userData);
            }
          } catch (error) {
            console.warn(`Erreur lors de la migration de l'utilisateur ${user.id}:`, error);
          }
        }
      }

      // Créer des données de test si aucune donnée n'existe
      await createTestDataIfNeeded();

      // Marquer la migration comme terminée
      await window.spark.kv.set('database_migration_v3_complete', true);
      setMigrationComplete(true);

      console.log('Migration des données terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  const createTestDataIfNeeded = async () => {
    const customerRepo = RepositoryFactory.getCustomerRepository();
    const vehicleRepo = RepositoryFactory.getVehicleRepository();
    const repairRepo = RepositoryFactory.getRepairRepository();
    const userRepo = RepositoryFactory.getUserRepository();

    // Vérifier s'il y a déjà des données
    const existingCustomers = await customerRepo.findAll();
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

      await userRepo.save({
        firstName: 'Mohammed',
        lastName: 'Larache',
        email: 'mohammed@garage.com',
        password: 'mohammed123',
        role: 'mechanic',
        permissions: [
          'customers.read', 'customers.create', 'customers.update',
          'vehicles.read', 'vehicles.create', 'vehicles.update',
          'repairs.read', 'repairs.create', 'repairs.update',
          'invoices.read'
        ],
        isActive: true
      });
    }

    // Créer des données de test seulement s'il n'y a aucun client
    if (existingCustomers.length === 0) {
      console.log('Création de données de test...');

      // Clients de test
      const testCustomers = [
        {
          firstName: 'Ahmed',
          lastName: 'Benali',
          email: 'ahmed.benali@email.com',
          phone: '+212 6 12 34 56 78',
          address: '123 Rue Mohammed V',
          city: 'Larache',
          postalCode: '92000',
          notes: 'Client régulier, préfère les RDV le matin'
        },
        {
          firstName: 'Fatima',
          lastName: 'El Khairi',
          email: 'fatima.elkhairi@email.com',
          phone: '+212 6 98 76 54 32',
          address: '456 Avenue Hassan II',
          city: 'Larache',
          postalCode: '92000',
          notes: 'Possède plusieurs véhicules'
        },
        {
          firstName: 'Youssef',
          lastName: 'Taoufik',
          email: 'youssef.taoufik@email.com',
          phone: '+212 6 11 22 33 44',
          address: '789 Boulevard Zerktouni',
          city: 'Larache',
          postalCode: '92000',
          notes: 'Nouveau client'
        }
      ];

      const createdCustomers = [];
      for (const customerData of testCustomers) {
        const customer = await customerRepo.save(customerData);
        createdCustomers.push(customer);
      }

      // Véhicules de test
      const testVehicles = [
        {
          customerId: createdCustomers[0].id,
          brand: 'Peugeot',
          model: '308',
          year: 2018,
          licensePlate: 'A 12345 92',
          vin: 'VF3LCYHZXJS123456',
          color: 'Bleu',
          mileage: 85000,
          fuelType: 'essence' as const,
          notes: 'Véhicule en bon état général'
        },
        {
          customerId: createdCustomers[1].id,
          brand: 'Renault',
          model: 'Clio',
          year: 2020,
          licensePlate: 'B 67890 92',
          vin: 'VF1CLJEY0L0234567',
          color: 'Rouge',
          mileage: 45000,
          fuelType: 'essence' as const,
          notes: 'Véhicule récent, entretenu régulièrement'
        },
        {
          customerId: createdCustomers[1].id,
          brand: 'Dacia',
          model: 'Duster',
          year: 2019,
          licensePlate: 'C 11111 92',
          vin: 'UU1HSMC20L0345678',
          color: 'Gris',
          mileage: 62000,
          fuelType: 'diesel' as const,
          notes: 'SUV familial, usage fréquent'
        },
        {
          customerId: createdCustomers[2].id,
          brand: 'Toyota',
          model: 'Corolla',
          year: 2021,
          licensePlate: 'D 22222 92',
          vin: 'JTDEPRAE0LJ456789',
          color: 'Blanc',
          mileage: 25000,
          fuelType: 'hybride' as const,
          notes: 'Véhicule hybride, très économique'
        }
      ];

      const createdVehicles = [];
      for (const vehicleData of testVehicles) {
        const vehicle = await vehicleRepo.save(vehicleData);
        createdVehicles.push(vehicle);
      }

      // Réparations de test
      const testRepairs = [
        {
          vehicleId: createdVehicles[0].id,
          customerId: createdCustomers[0].id,
          title: 'Vidange et révision',
          description: 'Vidange moteur, changement du filtre à huile et vérification générale',
          status: 'termine' as const,
          priority: 'normale' as const,
          estimatedCost: 150,
          actualCost: 145,
          estimatedDuration: 1.5,
          actualDuration: 1.5,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-15'),
          parts: [
            { partId: 'oil-1', quantity: 5, unitPrice: 12, totalPrice: 60 },
            { partId: 'filter-1', quantity: 1, unitPrice: 25, totalPrice: 25 }
          ],
          laborCost: 60,
          notes: 'Réparation terminée sans problème'
        },
        {
          vehicleId: createdVehicles[1].id,
          customerId: createdCustomers[1].id,
          title: 'Changement plaquettes de frein',
          description: 'Remplacement des plaquettes de frein avant',
          status: 'en_cours' as const,
          priority: 'haute' as const,
          estimatedCost: 200,
          actualCost: 0,
          estimatedDuration: 2,
          startDate: new Date(),
          parts: [
            { partId: 'brake-pads-1', quantity: 1, unitPrice: 80, totalPrice: 80 }
          ],
          laborCost: 120,
          notes: 'En cours de réparation'
        },
        {
          vehicleId: createdVehicles[2].id,
          customerId: createdCustomers[1].id,
          title: 'Diagnostic électronique',
          description: 'Contrôle du système électronique suite à voyant moteur',
          status: 'en_attente' as const,
          priority: 'normale' as const,
          estimatedCost: 80,
          estimatedDuration: 1,
          parts: [],
          laborCost: 80,
          notes: 'En attente de diagnostic'
        }
      ];

      for (const repairData of testRepairs) {
        await repairRepo.save(repairData);
      }

      console.log('Données de test créées avec succès');
    }
  };

  useEffect(() => {
    // Démarrer la migration automatiquement
    migrateData();
  }, []);

  return {
    isMigrating,
    migrationComplete,
    migrateData
  };
}