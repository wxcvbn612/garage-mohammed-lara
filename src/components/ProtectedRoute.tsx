import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield } from '@phosphor-icons/react';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  permission, 
  fallback 
}: ProtectedRouteProps) {
  const { hasPermission } = useAuth();

  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Accès refusé</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}