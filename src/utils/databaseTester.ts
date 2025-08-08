/**
 * Utilitaire de test pour la base de données IndexedDB
 * Permet de tester les fonctionnalités principales en développement
 */

import { DatabaseService, db } from '../lib/database';
import { Customer, Vehicle, Repair } from '../entities';

// Données de test
const testCustomer: Omit<Customer, 'id'> = {
  firstName: 'Ahmed',
  lastName: 'Benali',
  email: 'ahmed.benali@email.com',
  phone: '+212 661 234 567',
  address: '123 Rue Mohammed V, Larache',
  createdAt: new Date()
};

const testVehicle: Omit<Vehicle, 'id' | 'customerId'> = {
  customerId: 0, // Will be set after customer creation
  make: 'Peugeot',
  brand: 'Peugeot',
  model: '308',
  year: 2020,
  registrationNumber: 'A-123456-20',
  vin: 'VF3LCYHZXKS123456',
  color: 'Noir',
  createdAt: new Date()
};

export class DatabaseTester {
  
  static async runTests(): Promise<void> {
    console.log('🚀 Début des tests de la base de données IndexedDB');
    
    try {
      // Test 1: Initialisation
      await this.testInitialization();
      
      // Test 2: CRUD Customers
      await this.testCustomerCRUD();
      
      // Test 3: CRUD Vehicles
      await this.testVehicleCRUD();
      
      // Test 4: Relations
      await this.testRelations();
      
      // Test 5: Transactions
      await this.testTransactions();
      
      // Test 6: Performance
      await this.testPerformance();
      
      // Test 7: Export/Import
      await this.testExportImport();
      
      console.log('✅ Tous les tests sont passés avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      throw error;
    }
  }
  
  private static async testInitialization(): Promise<void> {
    console.log('📋 Test 1: Initialisation de la base de données');
    
    await DatabaseService.ensureInitialized();
    
    // Vérifier que les tables existent
    const tables = ['customers', 'vehicles', 'repairs', 'appointments', 'invoices', 'users', 'settings', 'keyValue'];
    
    for (const tableName of tables) {
      const table = (db as any)[tableName];
      if (!table) {
        throw new Error(`Table ${tableName} n'existe pas`);
      }
    }
    
    console.log('✅ Initialisation réussie');
  }
  
  private static async testCustomerCRUD(): Promise<void> {
    console.log('📋 Test 2: CRUD Clients');
    
    // Create
    const customer = await DatabaseService.createCustomer(testCustomer);
    if (!customer.id) {
      throw new Error('Customer ID not generated');
    }
    
    // Read
    const retrievedCustomer = await DatabaseService.getCustomer(customer.id);
    if (!retrievedCustomer || retrievedCustomer.email !== testCustomer.email) {
      throw new Error('Customer retrieval failed');
    }
    
    // Update
    await DatabaseService.updateCustomer(customer.id, { phone: '+212 661 999 888' });
    const updatedCustomer = await DatabaseService.getCustomer(customer.id);
    if (updatedCustomer?.phone !== '+212 661 999 888') {
      throw new Error('Customer update failed');
    }
    
    // List
    const customers = await DatabaseService.getCustomers();
    if (customers.length === 0) {
      throw new Error('Customer list is empty');
    }
    
    console.log('✅ CRUD Clients réussi');
  }
  
  private static async testVehicleCRUD(): Promise<void> {
    console.log('📋 Test 3: CRUD Véhicules');
    
    // Créer un client d'abord
    const customer = await DatabaseService.createCustomer({
      ...testCustomer,
      email: 'vehicle.test@email.com'
    });
    
    // Create vehicle
    const vehicle = await DatabaseService.createVehicle({
      ...testVehicle,
      customerId: customer.id!
    });
    
    if (!vehicle.id) {
      throw new Error('Vehicle ID not generated');
    }
    
    // Read
    const retrievedVehicle = await DatabaseService.getVehicle(vehicle.id);
    if (!retrievedVehicle || retrievedVehicle.registrationNumber !== testVehicle.registrationNumber) {
      throw new Error('Vehicle retrieval failed');
    }
    
    // Update
    await DatabaseService.updateVehicle(vehicle.id, { color: 'Rouge' });
    const updatedVehicle = await DatabaseService.getVehicle(vehicle.id);
    if (updatedVehicle?.color !== 'Rouge') {
      throw new Error('Vehicle update failed');
    }
    
    console.log('✅ CRUD Véhicules réussi');
  }
  
  private static async testRelations(): Promise<void> {
    console.log('📋 Test 4: Relations entre entités');
    
    // Créer un client
    const customer = await DatabaseService.createCustomer({
      ...testCustomer,
      email: 'relations.test@email.com'
    });
    
    // Créer plusieurs véhicules pour ce client
    const vehicle1 = await DatabaseService.createVehicle({
      ...testVehicle,
      customerId: customer.id!,
      registrationNumber: 'REL-001',
      model: '308'
    });
    
    const vehicle2 = await DatabaseService.createVehicle({
      ...testVehicle,
      customerId: customer.id!,
      registrationNumber: 'REL-002',
      model: '208'
    });
    
    // Récupérer les véhicules du client
    const customerVehicles = await DatabaseService.getVehiclesByCustomer(customer.id!);
    
    if (customerVehicles.length !== 2) {
      throw new Error(`Expected 2 vehicles, got ${customerVehicles.length}`);
    }
    
    if (!customerVehicles.some(v => v.model === '308') || !customerVehicles.some(v => v.model === '208')) {
      throw new Error('Vehicle relationships not working correctly');
    }
    
    console.log('✅ Relations entre entités réussies');
  }
  
  private static async testTransactions(): Promise<void> {
    console.log('📋 Test 5: Transactions ACID');
    
    const initialCustomerCount = await db.customers.count();
    
    try {
      // Transaction qui doit échouer
      await db.transaction('rw', [db.customers, db.vehicles], async () => {
        const customer = await db.customers.add({
          ...testCustomer,
          email: 'transaction.test@email.com'
        });
        
        await db.vehicles.add({
          ...testVehicle,
          customerId: customer,
          registrationNumber: 'TXN-001'
        });
        
        // Forcer une erreur
        throw new Error('Transaction intentionally failed');
      });
    } catch (error) {
      // C'est attendu
    }
    
    // Vérifier que rien n'a été ajouté
    const finalCustomerCount = await db.customers.count();
    if (finalCustomerCount !== initialCustomerCount) {
      throw new Error('Transaction rollback failed');
    }
    
    console.log('✅ Transactions ACID réussies');
  }
  
  private static async testPerformance(): Promise<void> {
    console.log('📋 Test 6: Performance');
    
    const startTime = performance.now();
    
    // Créer plusieurs clients en lot
    const customers = Array.from({ length: 100 }, (_, i) => ({
      ...testCustomer,
      email: `perf.test.${i}@email.com`,
      firstName: `Test${i}`
    }));
    
    await db.customers.bulkAdd(customers);
    
    // Test de recherche indexée
    const searchStart = performance.now();
    const results = await db.customers.where('firstName').startsWith('Test').toArray();
    const searchTime = performance.now() - searchStart;
    
    if (results.length !== 100) {
      throw new Error(`Expected 100 results, got ${results.length}`);
    }
    
    if (searchTime > 100) { // Plus de 100ms serait suspect
      console.warn(`⚠️ Recherche lente: ${searchTime}ms`);
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`✅ Performance: ${totalTime.toFixed(2)}ms pour 100 enregistrements`);
  }
  
  private static async testExportImport(): Promise<void> {
    console.log('📋 Test 7: Export/Import des données');
    
    // Export
    const exportData = {
      customers: await db.customers.toArray(),
      vehicles: await db.vehicles.toArray(),
      exportDate: new Date().toISOString()
    };
    
    if (exportData.customers.length === 0) {
      throw new Error('No data to export');
    }
    
    // Simuler import (sans effacer les données existantes)
    const importData = JSON.stringify(exportData);
    const parsedData = JSON.parse(importData);
    
    if (!parsedData.customers || !Array.isArray(parsedData.customers)) {
      throw new Error('Import data structure invalid');
    }
    
    console.log('✅ Export/Import réussi');
  }
  
  static async cleanupTestData(): Promise<void> {
    console.log('🧹 Nettoyage des données de test...');
    
    // Supprimer les données de test
    await db.customers.where('email').startsWith('ahmed.benali@').delete();
    await db.customers.where('email').startsWith('vehicle.test@').delete();
    await db.customers.where('email').startsWith('relations.test@').delete();
    await db.customers.where('email').startsWith('transaction.test@').delete();
    await db.customers.where('email').startsWith('perf.test.').delete();
    
    // Supprimer les véhicules orphelins
    const allVehicles = await db.vehicles.toArray();
    const allCustomers = await db.customers.toArray();
    const customerIds = new Set(allCustomers.map(c => c.id));
    
    const orphanVehicles = allVehicles.filter(v => !customerIds.has(v.customerId));
    for (const vehicle of orphanVehicles) {
      await db.vehicles.delete(vehicle.id!);
    }
    
    console.log('✅ Nettoyage terminé');
  }
  
  static async getDBInfo(): Promise<any> {
    const stats = await DatabaseService.getStats();
    const storageEstimate = await navigator.storage?.estimate?.();
    
    return {
      stats,
      storage: storageEstimate,
      dbName: db.name,
      version: db.verno
    };
  }
}

// Fonction utilitaire pour les tests en développement
if (process.env.NODE_ENV === 'development') {
  (window as any).DatabaseTester = DatabaseTester;
  console.log('🔧 DatabaseTester disponible dans la console (window.DatabaseTester)');
}