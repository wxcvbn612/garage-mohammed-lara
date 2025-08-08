import { useState, useEffect } from 'react';
import { DatabaseService } from '../lib/database';

// Enhanced useKV hook that uses IndexedDB instead of localStorage
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial value from database
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await DatabaseService.getKV<T>(key);
        if (storedValue !== undefined) {
          setValue(storedValue);
        }
      } catch (error) {
        console.error(`Failed to load value for key ${key}:`, error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = async (newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      
      // Save to database asynchronously
      DatabaseService.setKV(key, next).catch(error => {
        console.error(`Failed to save value for key ${key}:`, error);
      });
      
      return next;
    });
  };

  const deleteValue = async () => {
    setValue(defaultValue);
    try {
      await DatabaseService.deleteKV(key);
    } catch (error) {
      console.error(`Failed to delete value for key ${key}:`, error);
    }
  };

  // Return loading state as well for better UX
  return [isLoaded ? value : defaultValue, updateValue, deleteValue];
}

// Hook for database initialization and migration
export function useDatabaseMigration() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsInitializing(true);
        await DatabaseService.ensureInitialized();
        setMigrationComplete(true);
        setError(null);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError('Échec de l\'initialisation de la base de données');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDatabase();
  }, []);

  return {
    isInitializing,
    migrationComplete,
    error
  };
}

// Hook for database statistics
export function useDatabaseStats() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    repairs: 0,
    appointments: 0,
    invoices: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      const newStats = await DatabaseService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return {
    stats,
    isLoading,
    refreshStats
  };
}

// Hook for managing customers
export function useCustomers() {
  const [customers] = useKV('customers', []);
  return customers;
}

// Hook for managing vehicles  
export function useVehicles() {
  const [vehicles] = useKV('vehicles', []);
  return vehicles;
}