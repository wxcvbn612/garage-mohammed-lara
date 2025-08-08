/**
 * Hook React pour utiliser les repositories de base de données
 * Simplifie l'utilisation des services de base de données dans les composants React
 */

import { useCallback, useState, useEffect } from 'react';
import { RepositoryFactory } from '../services/RepositoryService';
import { Customer, Vehicle, Repair, User } from '../entities';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const repository = RepositoryFactory.getCustomerRepository();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCustomer = await repository.save(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCustomer = await repository.update(id, updates);
      if (updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      }
      return updatedCustomer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await repository.delete(id);
      if (success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const searchCustomers = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await repository.searchByName(searchTerm);
      setCustomers(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const getCustomerWithVehicles = useCallback(async (id: string) => {
    try {
      return await repository.findWithVehicles(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      throw err;
    }
  }, [repository]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerWithVehicles,
    refreshCustomers: loadCustomers
  };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const repository = RepositoryFactory.getVehicleRepository();

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newVehicle = await repository.save(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedVehicle = await repository.update(id, updates);
      if (updatedVehicle) {
        setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      }
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await repository.delete(id);
      if (success) {
        setVehicles(prev => prev.filter(v => v.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const getVehiclesByCustomer = useCallback(async (customerId: string) => {
    try {
      return await repository.findByCustomer(customerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      throw err;
    }
  }, [repository]);

  const addPhoto = useCallback(async (vehicleId: string, photoUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedVehicle = await repository.addPhoto(vehicleId, photoUrl);
      if (updatedVehicle) {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));
      }
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la photo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const removePhoto = useCallback(async (vehicleId: string, photoUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedVehicle = await repository.removePhoto(vehicleId, photoUrl);
      if (updatedVehicle) {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));
      }
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la photo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return {
    vehicles,
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehiclesByCustomer,
    addPhoto,
    removePhoto,
    refreshVehicles: loadVehicles
  };
}

export function useRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const repository = RepositoryFactory.getRepairRepository();

  const loadRepairs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll();
      setRepairs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createRepair = useCallback(async (repairData: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newRepair = await repository.save(repairData);
      setRepairs(prev => [...prev, newRepair]);
      return newRepair;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const updateRepair = useCallback(async (id: string, updates: Partial<Repair>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRepair = await repository.update(id, updates);
      if (updatedRepair) {
        setRepairs(prev => prev.map(r => r.id === id ? updatedRepair : r));
      }
      return updatedRepair;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const deleteRepair = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await repository.delete(id);
      if (success) {
        setRepairs(prev => prev.filter(r => r.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const getRepairsByStatus = useCallback(async (status: string) => {
    try {
      return await repository.findByStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      throw err;
    }
  }, [repository]);

  const getRepairsByVehicle = useCallback(async (vehicleId: string) => {
    try {
      return await repository.findByVehicle(vehicleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      throw err;
    }
  }, [repository]);

  const getRepairsByCustomer = useCallback(async (customerId: string) => {
    try {
      return await repository.findByCustomer(customerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      throw err;
    }
  }, [repository]);

  useEffect(() => {
    loadRepairs();
  }, [loadRepairs]);

  return {
    repairs,
    loading,
    error,
    createRepair,
    updateRepair,
    deleteRepair,
    getRepairsByStatus,
    getRepairsByVehicle,
    getRepairsByCustomer,
    refreshRepairs: loadRepairs
  };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const repository = RepositoryFactory.getUserRepository();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repository.findAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await repository.save(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await repository.update(id, updates);
      if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      }
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await repository.delete(id);
      if (success) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const activateUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await repository.activateUser(id);
      if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      }
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'activation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  const deactivateUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await repository.deactivateUser(id);
      if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      }
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la désactivation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    refreshUsers: loadUsers
  };
}

/**
 * Hook pour obtenir des statistiques de base de données
 */
export function useDatabaseStats() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    totalRepairs: 0,
    activeRepairs: 0,
    completedRepairs: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      const customerRepo = RepositoryFactory.getCustomerRepository();
      const vehicleRepo = RepositoryFactory.getVehicleRepository();
      const repairRepo = RepositoryFactory.getRepairRepository();
      
      const [customers, vehicles, repairs] = await Promise.all([
        customerRepo.findAll(),
        vehicleRepo.findAll(),
        repairRepo.findAll()
      ]);
      
      const activeRepairs = repairs.filter(r => r.status === 'in_progress');
      const completedRepairs = repairs.filter(r => r.status === 'completed');
      const totalRevenue = await repairRepo.getTotalRevenue();
      
      setStats({
        totalCustomers: customers.length,
        totalVehicles: vehicles.length,
        totalRepairs: repairs.length,
        activeRepairs: activeRepairs.length,
        completedRepairs: completedRepairs.length,
        totalRevenue
      });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refreshStats: loadStats };
}