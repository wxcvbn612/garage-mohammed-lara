import { DatabaseService } from './DatabaseService';
import { EntityManager } from './EntityManager';

export interface SyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  error: string | null;
  totalRecords: number;
  syncedRecords: number;
}

export interface CloudBackupData {
  timestamp: Date;
  version: string;
  garage: any;
  data: {
    customers: any[];
    vehicles: any[];
    repairs: any[];
    invoices: any[];
    users: any[];
    mechanics: any[];
    appointments: any[];
    stock: any[];
    settings: any;
  };
}

export class CloudSyncService {
  private static instance: CloudSyncService;
  private syncInterval: number | null = null;
  private readonly SYNC_ENDPOINT = '/.netlify/functions/sync-data';
  private readonly BACKUP_ENDPOINT = '/.netlify/functions/backup-data';
  private readonly AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  private constructor() {
    this.initializeAutoSync();
  }

  /**
   * Initialize automatic synchronization
   */
  private async initializeAutoSync() {
    const status = await this.getSyncStatus();
    if (status.isEnabled) {
      this.startAutoSync();
    }
  }

  /**
   * Get current synchronization status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const db = DatabaseService.getInstance();
    const settings = await db.get('app_settings', 'main') || {};
    
    return {
      isEnabled: settings.cloudSync?.enabled || false,
      lastSync: settings.cloudSync?.lastSync ? new Date(settings.cloudSync.lastSync) : null,
      syncInProgress: settings.cloudSync?.syncInProgress || false,
      error: settings.cloudSync?.lastError || null,
      totalRecords: await this.getTotalRecordsCount(),
      syncedRecords: settings.cloudSync?.syncedRecords || 0
    };
  }

  /**
   * Enable/disable cloud synchronization
   */
  async toggleSync(enabled: boolean): Promise<void> {
    const db = DatabaseService.getInstance();
    const settings = await db.get('app_settings', 'main') || {};
    
    settings.cloudSync = {
      ...settings.cloudSync,
      enabled
    };
    
    await db.put('app_settings', { id: 'main', ...settings });
    
    if (enabled) {
      this.startAutoSync();
      // Perform immediate sync
      await this.performSync();
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Start automatic synchronization
   */
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = window.setInterval(() => {
      this.performSync().catch(console.error);
    }, this.AUTO_SYNC_INTERVAL);
  }

  /**
   * Stop automatic synchronization
   */
  private stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform manual synchronization
   */
  async performSync(): Promise<boolean> {
    const status = await this.getSyncStatus();
    
    if (!status.isEnabled || status.syncInProgress) {
      return false;
    }

    try {
      await this.setSyncProgress(true, null);
      
      const backupData = await this.prepareBackupData();
      const success = await this.uploadToCloud(backupData);
      
      if (success) {
        await this.updateSyncStatus(true, backupData.data);
        return true;
      } else {
        throw new Error('Upload to cloud failed');
      }
    } catch (error) {
      await this.setSyncProgress(false, error.message);
      console.error('Sync failed:', error);
      return false;
    }
  }

  /**
   * Prepare data for backup
   */
  private async prepareBackupData(): Promise<CloudBackupData> {
    const entityManager = EntityManager.getInstance();
    const db = DatabaseService.getInstance();
    
    const [
      customers,
      vehicles, 
      repairs,
      invoices,
      users,
      mechanics,
      appointments,
      stock,
      settings
    ] = await Promise.all([
      entityManager.getAllCustomers(),
      entityManager.getAllVehicles(),
      entityManager.getAllRepairs(),
      entityManager.getAllInvoices(),
      entityManager.getAllUsers(),
      entityManager.getAllMechanics(),
      entityManager.getAllAppointments(),
      entityManager.getAllStockItems(),
      db.get('app_settings', 'main')
    ]);

    return {
      timestamp: new Date(),
      version: '1.0.0',
      garage: settings?.garage || {},
      data: {
        customers: customers || [],
        vehicles: vehicles || [],
        repairs: repairs || [],
        invoices: invoices || [],
        users: users || [],
        mechanics: mechanics || [],
        appointments: appointments || [],
        stock: stock || [],
        settings: settings || {}
      }
    };
  }

  /**
   * Upload data to cloud
   */
  private async uploadToCloud(data: CloudBackupData): Promise<boolean> {
    try {
      // Try Netlify Functions first
      const response = await fetch(this.BACKUP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return true;
      }

      // Fallback to localStorage backup with compression
      return await this.fallbackLocalBackup(data);
    } catch (error) {
      console.warn('Cloud upload failed, using local backup:', error);
      return await this.fallbackLocalBackup(data);
    }
  }

  /**
   * Fallback to compressed local backup
   */
  private async fallbackLocalBackup(data: CloudBackupData): Promise<boolean> {
    try {
      const compressed = this.compressData(data);
      localStorage.setItem('garage_cloud_backup', compressed);
      localStorage.setItem('garage_backup_timestamp', data.timestamp.toISOString());
      return true;
    } catch (error) {
      console.error('Fallback backup failed:', error);
      return false;
    }
  }

  /**
   * Simple data compression for localStorage
   */
  private compressData(data: CloudBackupData): string {
    const jsonString = JSON.stringify(data);
    // Simple compression by removing unnecessary spaces
    return jsonString.replace(/\s+/g, ' ').trim();
  }

  /**
   * Restore data from cloud backup
   */
  async restoreFromCloud(): Promise<boolean> {
    try {
      // Try to get from Netlify Functions
      const response = await fetch(this.BACKUP_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      let backupData: CloudBackupData | null = null;

      if (response.ok) {
        backupData = await response.json();
      } else {
        // Fallback to localStorage
        const localBackup = localStorage.getItem('garage_cloud_backup');
        if (localBackup) {
          backupData = JSON.parse(localBackup);
        }
      }

      if (!backupData) {
        throw new Error('No backup data found');
      }

      await this.restoreData(backupData);
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  /**
   * Restore data to database
   */
  private async restoreData(backup: CloudBackupData): Promise<void> {
    const entityManager = EntityManager.getInstance();
    const db = DatabaseService.getInstance();

    // Clear existing data
    await this.clearAllData();

    // Restore data
    const { data } = backup;

    // Restore in order to maintain relationships
    if (data.settings) {
      await db.put('app_settings', data.settings);
    }

    if (data.users?.length) {
      for (const user of data.users) {
        await entityManager.saveUser(user);
      }
    }

    if (data.customers?.length) {
      for (const customer of data.customers) {
        await entityManager.saveCustomer(customer);
      }
    }

    if (data.vehicles?.length) {
      for (const vehicle of data.vehicles) {
        await entityManager.saveVehicle(vehicle);
      }
    }

    if (data.mechanics?.length) {
      for (const mechanic of data.mechanics) {
        await entityManager.saveMechanic(mechanic);
      }
    }

    if (data.repairs?.length) {
      for (const repair of data.repairs) {
        await entityManager.saveRepair(repair);
      }
    }

    if (data.invoices?.length) {
      for (const invoice of data.invoices) {
        await entityManager.saveInvoice(invoice);
      }
    }

    if (data.appointments?.length) {
      for (const appointment of data.appointments) {
        await entityManager.saveAppointment(appointment);
      }
    }

    if (data.stock?.length) {
      for (const item of data.stock) {
        await entityManager.saveStockItem(item);
      }
    }
  }

  /**
   * Clear all data from database
   */
  private async clearAllData(): Promise<void> {
    const db = DatabaseService.getInstance();
    const stores = [
      'customers', 'vehicles', 'repairs', 'invoices', 
      'users', 'mechanics', 'appointments', 'stock'
    ];

    for (const store of stores) {
      await db.clear(store);
    }
  }

  /**
   * Get total number of records
   */
  private async getTotalRecordsCount(): Promise<number> {
    const entityManager = EntityManager.getInstance();
    
    const [
      customers,
      vehicles,
      repairs,
      invoices,
      users,
      mechanics,
      appointments,
      stock
    ] = await Promise.all([
      entityManager.getAllCustomers(),
      entityManager.getAllVehicles(),
      entityManager.getAllRepairs(),
      entityManager.getAllInvoices(),
      entityManager.getAllUsers(),
      entityManager.getAllMechanics(),
      entityManager.getAllAppointments(),
      entityManager.getAllStockItems()
    ]);

    return (customers?.length || 0) + 
           (vehicles?.length || 0) + 
           (repairs?.length || 0) + 
           (invoices?.length || 0) + 
           (users?.length || 0) + 
           (mechanics?.length || 0) + 
           (appointments?.length || 0) + 
           (stock?.length || 0);
  }

  /**
   * Set sync progress status
   */
  private async setSyncProgress(inProgress: boolean, error: string | null): Promise<void> {
    const db = DatabaseService.getInstance();
    const settings = await db.get('app_settings', 'main') || {};
    
    settings.cloudSync = {
      ...settings.cloudSync,
      syncInProgress: inProgress,
      lastError: error
    };
    
    await db.put('app_settings', { id: 'main', ...settings });
  }

  /**
   * Update sync status after successful sync
   */
  private async updateSyncStatus(success: boolean, data?: any): Promise<void> {
    const db = DatabaseService.getInstance();
    const settings = await db.get('app_settings', 'main') || {};
    
    const recordCount = data ? Object.values(data).reduce((total: number, items: any) => {
      return total + (Array.isArray(items) ? items.length : 0);
    }, 0) : 0;
    
    settings.cloudSync = {
      ...settings.cloudSync,
      syncInProgress: false,
      lastSync: new Date().toISOString(),
      lastError: success ? null : 'Sync failed',
      syncedRecords: recordCount
    };
    
    await db.put('app_settings', { id: 'main', ...settings });
  }

  /**
   * Get sync history/logs
   */
  async getSyncHistory(): Promise<any[]> {
    const db = DatabaseService.getInstance();
    const settings = await db.get('app_settings', 'main') || {};
    return settings.cloudSync?.history || [];
  }

  /**
   * Export data for manual backup
   */
  async exportData(): Promise<string> {
    const backupData = await this.prepareBackupData();
    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Import data from manual backup
   */
  async importData(jsonString: string): Promise<boolean> {
    try {
      const backupData: CloudBackupData = JSON.parse(jsonString);
      await this.restoreData(backupData);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}