import Dexie, { Table } from 'dexie';
import { Customer, Vehicle, Repair, Appointment, Invoice, User, AppSettings } from '../entities';

// Database interface definitions
export interface DbCustomer extends Omit<Customer, 'id'> {
  id?: number;
}

export interface DbVehicle extends Omit<Vehicle, 'id'> {
  id?: number;
}

export interface DbRepair extends Omit<Repair, 'id'> {
  id?: number;
}

export interface DbAppointment extends Omit<Appointment, 'id'> {
  id?: number;
}

export interface DbInvoice extends Omit<Invoice, 'id'> {
  id?: number;
}

export interface DbUser extends Omit<User, 'id'> {
  id?: number;
}

export interface DbAppSettings extends Omit<AppSettings, 'id'> {
  id?: number;
}

export interface DbKeyValue {
  key: string;
  value: any;
  updatedAt: Date;
}

// Database class
export class GarageDatabase extends Dexie {
  customers!: Table<DbCustomer>;
  vehicles!: Table<DbVehicle>;
  repairs!: Table<DbRepair>;
  appointments!: Table<DbAppointment>;
  invoices!: Table<DbInvoice>;
  users!: Table<DbUser>;
  settings!: Table<DbAppSettings>;
  keyValue!: Table<DbKeyValue>;

  constructor() {
    super('GarageManagementDB');
    this.version(1).stores({
      customers: '++id, firstName, lastName, email, phone, address, createdAt',
      vehicles: '++id, customerId, make, brand, model, year, registrationNumber, vin, color, createdAt',
      repairs: '++id, vehicleId, customerId, title, description, status, priority, cost, startDate, endDate, createdAt',
      appointments: '++id, customerId, vehicleId, date, type, status, description, createdAt',
      invoices: '++id, customerId, vehicleId, repairId, number, amount, status, dueDate, createdAt',
      users: '++id, email, firstName, lastName, role, permissions, isActive, createdAt',
      settings: '++id, garage, currency, taxes, notifications, createdAt',
      keyValue: 'key, value, updatedAt'
    });

    // Initialize default data on database creation
    this.on('populate', () => this.populateInitialData());
  }

  private async populateInitialData() {
    console.log('Initializing database with default data...');
    
    // Create default admin user
    await this.users.add({
      email: 'admin@garage.com',
      firstName: 'Admin',
      lastName: 'Garage',
      role: 'admin',
      permissions: ['*'],
      isActive: true,
      createdAt: new Date()
    });

    // Create default settings
    await this.settings.add({
      garage: {
        name: 'Garage Mohammed',
        address: 'Larache, Maroc',
        phone: '+212 539 12 34 56',
        email: 'contact@garage-mohammed.ma'
      },
      currency: 'MAD',
      taxes: {
        tva: 20,
        isEnabled: true
      },
      notifications: {
        email: true,
        browser: true,
        appointmentReminders: true,
        stockAlerts: true
      },
      createdAt: new Date()
    });

    console.log('Database initialized successfully');
  }

  // Migration method to transfer localStorage data to IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    console.log('Starting migration from localStorage to IndexedDB...');
    
    try {
      // Migrate customers
      const customersData = this.getLocalStorageData('customers');
      if (customersData?.length > 0) {
        await this.customers.bulkAdd(customersData.map((c: any) => ({
          ...c,
          id: undefined // Let IndexedDB assign new IDs
        })));
        console.log(`Migrated ${customersData.length} customers`);
      }

      // Migrate vehicles
      const vehiclesData = this.getLocalStorageData('vehicles');
      if (vehiclesData?.length > 0) {
        await this.vehicles.bulkAdd(vehiclesData.map((v: any) => ({
          ...v,
          id: undefined
        })));
        console.log(`Migrated ${vehiclesData.length} vehicles`);
      }

      // Migrate repairs
      const repairsData = this.getLocalStorageData('repairs');
      if (repairsData?.length > 0) {
        await this.repairs.bulkAdd(repairsData.map((r: any) => ({
          ...r,
          id: undefined
        })));
        console.log(`Migrated ${repairsData.length} repairs`);
      }

      // Migrate appointments
      const appointmentsData = this.getLocalStorageData('appointments');
      if (appointmentsData?.length > 0) {
        await this.appointments.bulkAdd(appointmentsData.map((a: any) => ({
          ...a,
          id: undefined
        })));
        console.log(`Migrated ${appointmentsData.length} appointments`);
      }

      // Migrate invoices
      const invoicesData = this.getLocalStorageData('invoices');
      if (invoicesData?.length > 0) {
        await this.invoices.bulkAdd(invoicesData.map((i: any) => ({
          ...i,
          id: undefined
        })));
        console.log(`Migrated ${invoicesData.length} invoices`);
      }

      // Migrate users (if any)
      const usersData = this.getLocalStorageData('users');
      if (usersData?.length > 0) {
        await this.users.bulkAdd(usersData.map((u: any) => ({
          ...u,
          id: undefined
        })));
        console.log(`Migrated ${usersData.length} users`);
      }

      // Migrate settings
      const settingsData = this.getLocalStorageData('app-settings');
      if (settingsData) {
        await this.settings.add({
          ...settingsData,
          id: undefined
        });
        console.log('Migrated settings');
      }

      // Migrate other key-value data
      await this.migrateKeyValueData();

      console.log('Migration completed successfully');
      
      // Mark migration as complete
      await this.keyValue.put({
        key: 'migration_complete',
        value: true,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private getLocalStorageData(key: string): any {
    try {
      const data = localStorage.getItem(`spark_kv_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async migrateKeyValueData(): Promise<void> {
    const kvPairs = [];
    
    // Scan localStorage for spark_kv_ prefixed keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('spark_kv_') && !this.isEntityKey(key)) {
        try {
          const cleanKey = key.replace('spark_kv_', '');
          const value = JSON.parse(localStorage.getItem(key) || '');
          kvPairs.push({
            key: cleanKey,
            value,
            updatedAt: new Date()
          });
        } catch (error) {
          console.warn(`Failed to migrate key ${key}:`, error);
        }
      }
    }

    if (kvPairs.length > 0) {
      await this.keyValue.bulkPut(kvPairs);
      console.log(`Migrated ${kvPairs.length} key-value pairs`);
    }
  }

  private isEntityKey(key: string): boolean {
    const entityKeys = ['customers', 'vehicles', 'repairs', 'appointments', 'invoices', 'users', 'app-settings'];
    return entityKeys.some(entityKey => key.includes(entityKey));
  }

  // Check if migration is needed
  async needsMigration(): Promise<boolean> {
    try {
      const migrationComplete = await this.keyValue.get('migration_complete');
      return !migrationComplete?.value;
    } catch {
      return true;
    }
  }

  // Clean up localStorage after successful migration
  async cleanupLocalStorage(): Promise<void> {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('spark_kv_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove localStorage key ${key}:`, error);
      }
    });

    console.log(`Cleaned up ${keysToRemove.length} localStorage keys`);
  }
}

// Create singleton database instance
export const db = new GarageDatabase();

// Database service functions
export class DatabaseService {
  static async ensureInitialized(): Promise<void> {
    try {
      await db.open();
      
      // Run migration if needed
      if (await db.needsMigration()) {
        console.log('Migration needed, starting migration process...');
        await db.migrateFromLocalStorage();
        // Don't cleanup localStorage immediately in case of issues
        // await db.cleanupLocalStorage();
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Key-Value operations (backward compatibility)
  static async getKV<T>(key: string): Promise<T | undefined> {
    try {
      const result = await db.keyValue.get(key);
      return result?.value;
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error);
      return undefined;
    }
  }

  static async setKV<T>(key: string, value: T): Promise<void> {
    try {
      await db.keyValue.put({
        key,
        value,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  static async deleteKV(key: string): Promise<void> {
    try {
      await db.keyValue.delete(key);
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const results = await db.keyValue.toArray();
      return results.map(item => item.key);
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  // Entity operations
  static async getCustomers(): Promise<Customer[]> {
    return db.customers.orderBy('createdAt').reverse().toArray() as Promise<Customer[]>;
  }

  static async getCustomer(id: number): Promise<Customer | undefined> {
    return db.customers.get(id) as Promise<Customer | undefined>;
  }

  static async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const id = await db.customers.add(customer as DbCustomer);
    return { ...customer, id } as Customer;
  }

  static async updateCustomer(id: number, updates: Partial<Customer>): Promise<void> {
    await db.customers.update(id, updates);
  }

  static async deleteCustomer(id: number): Promise<void> {
    await db.customers.delete(id);
  }

  static async getVehicles(): Promise<Vehicle[]> {
    return db.vehicles.orderBy('createdAt').reverse().toArray() as Promise<Vehicle[]>;
  }

  static async getVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
    return db.vehicles.where('customerId').equals(customerId).toArray() as Promise<Vehicle[]>;
  }

  static async getVehicle(id: number): Promise<Vehicle | undefined> {
    return db.vehicles.get(id) as Promise<Vehicle | undefined>;
  }

  static async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const id = await db.vehicles.add(vehicle as DbVehicle);
    return { ...vehicle, id } as Vehicle;
  }

  static async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<void> {
    await db.vehicles.update(id, updates);
  }

  static async deleteVehicle(id: number): Promise<void> {
    await db.vehicles.delete(id);
  }

  // Get database statistics
  static async getStats() {
    const [
      customersCount,
      vehiclesCount, 
      repairsCount,
      appointmentsCount,
      invoicesCount
    ] = await Promise.all([
      db.customers.count(),
      db.vehicles.count(),
      db.repairs.count(),
      db.appointments.count(),
      db.invoices.count()
    ]);

    return {
      customers: customersCount,
      vehicles: vehiclesCount,
      repairs: repairsCount,
      appointments: appointmentsCount,
      invoices: invoicesCount
    };
  }
}