import { useKV } from './useKV';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'admin' | 'manager' | 'mechanic' | 'receptionist';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

const DEFAULT_PERMISSIONS = {
  admin: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'customers.create',
    'customers.read',
    'customers.update',
    'customers.delete',
    'vehicles.create',
    'vehicles.read',
    'vehicles.update',
    'vehicles.delete',
    'repairs.create',
    'repairs.read',
    'repairs.update',
    'repairs.delete',
    'invoices.create',
    'invoices.read',
    'invoices.update',
    'invoices.delete',
    'reports.read',
    'settings.update'
  ],
  manager: [
    'customers.create',
    'customers.read',
    'customers.update',
    'vehicles.create',
    'vehicles.read',
    'vehicles.update',
    'repairs.create',
    'repairs.read',
    'repairs.update',
    'invoices.create',
    'invoices.read',
    'invoices.update',
    'reports.read'
  ],
  mechanic: [
    'customers.read',
    'vehicles.read',
    'vehicles.update',
    'repairs.create',
    'repairs.read',
    'repairs.update'
  ],
  receptionist: [
    'customers.create',
    'customers.read',
    'customers.update',
    'vehicles.create',
    'vehicles.read',
    'repairs.read',
    'invoices.read'
  ]
};

export function useAuth() {
  const [authState, setAuthState] = useKV<AuthState>('auth-state', {
    isAuthenticated: false,
    user: null,
    loading: false
  });

  const [users, setUsers] = useKV<User[]>('users', []);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug function to reset auth state if needed
  const resetAuthState = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  // Initialize auth state and default admin user
  useEffect(() => {
    if (!isInitialized) {
      // Initialize default admin user if no users exist
      if (users.length === 0) {
        const defaultAdmin: User = {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@garage-mohammed.com',
          firstName: 'Mohammed',
          lastName: 'Larache',
          password: 'admin123',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          permissions: DEFAULT_PERMISSIONS.admin
        };
        setUsers([defaultAdmin]);
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, users.length, setUsers]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Mettre l'état en loading
      setAuthState(current => ({ ...current, loading: true }));

      // Simuler un délai de connexion réaliste
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simple password validation (in real app, use proper hashing)
      const user = users.find(u => u.username === username && u.isActive);
      
      if (user && user.password === password) {
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString(),
          permissions: user.permissions || DEFAULT_PERMISSIONS[user.role] || []
        };

        // Update user's last login
        setUsers(currentUsers => 
          currentUsers.map(u => u.id === user.id ? updatedUser : u)
        );

        // Connecter l'utilisateur
        setAuthState({
          isAuthenticated: true,
          user: updatedUser,
          loading: false
        });

        toast.success(`Bienvenue, ${user.firstName} ${user.lastName}!`);
        return true;
      } else {
        // Échec de connexion
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
        toast.error('Nom d\'utilisateur ou mot de passe incorrect');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // Échec de connexion avec erreur
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      toast.error('Erreur lors de la connexion');
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    toast.success('Déconnexion réussie');
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) {
      return false;
    }
    
    return authState.user.permissions?.includes(permission) || false;
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt' | 'permissions'> & { password: string }): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      permissions: DEFAULT_PERMISSIONS[userData.role]
    };

    setUsers(currentUsers => [...currentUsers, newUser]);
    toast.success('Utilisateur créé avec succès');
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>): void => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === userId
          ? {
              ...user,
              ...updates,
              permissions: updates.role ? DEFAULT_PERMISSIONS[updates.role] : user.permissions
            }
          : user
      )
    );
    
    // If updating current user, update auth state
    if (userId === authState.user?.id) {
      setAuthState(current => ({
        ...current,
        user: current.user ? { ...current.user, ...updates } : null
      }));
    }
    
    toast.success('Utilisateur mis à jour');
  };

  const deleteUser = (userId: string): void => {
    if (userId === authState.user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
    toast.success('Utilisateur supprimé');
  };

  const getUsersByRole = (role: User['role']): User[] => {
    return users.filter(user => user.role === role && user.isActive);
  };

  return {
    authState,
    users,
    login,
    logout,
    hasPermission,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    resetAuthState
  };
}