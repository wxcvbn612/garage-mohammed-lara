import { useState, useEffect } from 'react';
import { DatabaseService } from '../lib/database';
import { useKV } from './useKV';

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

// Hook for managing customers with full CRUD operations
export function useCustomers() {
  const [customers, setCustomers] = useKV('customers', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useCustomers hook - customers from useKV:', customers, 'type:', typeof customers, 'isArray:', Array.isArray(customers));

  const refreshCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const allCustomers = await DatabaseService.getCustomers();
      // Convert numeric IDs to string IDs to match the frontend expectations
      const customersWithStringIds = allCustomers.map(customer => ({
        ...customer,
        id: customer.id?.toString() || Date.now().toString()
      }));
      setCustomers(customersWithStringIds);
    } catch (err) {
      setError('Erreur lors du chargement des clients');
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: any) => {
    try {
      setLoading(true);
      const newCustomer = await DatabaseService.createCustomer(customerData);
      const customerWithStringId = { ...newCustomer, id: newCustomer.id?.toString() || Date.now().toString() };
      setCustomers(prev => {
        const currentCustomers = Array.isArray(prev) ? prev : [];
        return [...currentCustomers, customerWithStringId];
      });
      return customerWithStringId;
    } catch (err) {
      setError('Erreur lors de la création du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: string, customerData: any) => {
    try {
      setLoading(true);
      const numericId = parseInt(id);
      await DatabaseService.updateCustomer(numericId, customerData);
      const updatedCustomer = await DatabaseService.getCustomer(numericId);
      if (updatedCustomer) {
        setCustomers(prev => {
          const currentCustomers = Array.isArray(prev) ? prev : [];
          return currentCustomers.map(c => c.id === id ? { ...updatedCustomer, id } : c);
        });
        return { ...updatedCustomer, id };
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setLoading(true);
      const numericId = parseInt(id);
      await DatabaseService.deleteCustomer(numericId);
      setCustomers(prev => {
        const currentCustomers = Array.isArray(prev) ? prev : [];
        return currentCustomers.filter(c => c.id !== id);
      });
    } catch (err) {
      setError('Erreur lors de la suppression du client');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (searchTerm: string) => {
    const customerArray = Array.isArray(customers) ? customers : [];
    if (!searchTerm.trim()) {
      return customerArray;
    }
    return customerArray.filter(customer => 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  };

  const getCustomerWithVehicles = async (customerId: string) => {
    try {
      const numericId = parseInt(customerId);
      const customer = await DatabaseService.getCustomer(numericId);
      const vehicles = await DatabaseService.getVehiclesByCustomer(numericId);
      return { 
        customer: customer ? { ...customer, id: customerId } : null, 
        vehicles: vehicles.map(v => ({ ...v, id: v.id?.toString() || '', customerId }))
      };
    } catch (err) {
      console.error('Failed to get customer with vehicles:', err);
      throw err;
    }
  };

  return {
    customers: Array.isArray(customers) ? customers : [],
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerWithVehicles,
    refreshCustomers
  };
}

// Hook for managing vehicles with full CRUD operations
export function useVehicles() {
  const [vehicles, setVehicles] = useKV('vehicles', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const allVehicles = await DatabaseService.getVehicles();
      // Convert numeric IDs to string IDs to match the frontend expectations
      const vehiclesWithStringIds = allVehicles.map(vehicle => ({
        ...vehicle,
        id: vehicle.id?.toString() || Date.now().toString(),
        customerId: vehicle.customerId?.toString() || ''
      }));
      setVehicles(vehiclesWithStringIds);
    } catch (err) {
      setError('Erreur lors du chargement des véhicules');
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (vehicleData: any) => {
    try {
      setLoading(true);
      const newVehicle = await DatabaseService.createVehicle(vehicleData);
      const vehicleWithStringId = { 
        ...newVehicle, 
        id: newVehicle.id?.toString() || Date.now().toString(),
        customerId: newVehicle.customerId?.toString() || vehicleData.customerId
      };
      setVehicles(prev => {
        const currentVehicles = Array.isArray(prev) ? prev : [];
        return [...currentVehicles, vehicleWithStringId];
      });
      return vehicleWithStringId;
    } catch (err) {
      setError('Erreur lors de la création du véhicule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (id: string, vehicleData: any) => {
    try {
      setLoading(true);
      const numericId = parseInt(id);
      await DatabaseService.updateVehicle(numericId, vehicleData);
      const updatedVehicle = await DatabaseService.getVehicle(numericId);
      if (updatedVehicle) {
        const vehicleWithStringId = { 
          ...updatedVehicle, 
          id, 
          customerId: updatedVehicle.customerId?.toString() || vehicleData.customerId 
        };
        setVehicles(prev => {
          const currentVehicles = Array.isArray(prev) ? prev : [];
          return currentVehicles.map(v => v.id === id ? vehicleWithStringId : v);
        });
        return vehicleWithStringId;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du véhicule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      setLoading(true);
      const numericId = parseInt(id);
      await DatabaseService.deleteVehicle(numericId);
      setVehicles(prev => {
        const currentVehicles = Array.isArray(prev) ? prev : [];
        return currentVehicles.filter(v => v.id !== id);
      });
    } catch (err) {
      setError('Erreur lors de la suppression du véhicule');
      throw err;
    } finally {
      setLoading(false);
    error,
    createVehicle,
    updateVehicle,
  return {
    vehicles: Array.isArray(vehicles) ? vehicles : [],
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    refreshVehicles
  };
}