import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import '../lib/spark-mocks'; // Ensure spark is available

export default function AuthDebugPanel() {
  const { authState, users, resetAuthState } = useAuth();

  const handleClearAuth = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'état d\'authentification ?')) {
      resetAuthState();
      toast.success('État d\'authentification réinitialisé');
    }
  };

  const handleClearUsers = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les utilisateurs ?')) {
      // This would require exposing a clearUsers function from useAuth
      await window.spark.kv.delete('users');
      await window.spark.kv.delete('auth-state');
      window.location.reload();
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 bg-card/95 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          🐛 Debug Panel
          <Badge variant="outline">Dev Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <strong>Auth State:</strong>
          <div className="ml-2">
            <div>Authenticated: {authState.isAuthenticated ? '✅' : '❌'}</div>
            <div>Loading: {authState.loading ? '⏳' : '✅'}</div>
            <div>User: {authState.user?.username || 'None'}</div>
            <div>Role: {authState.user?.role || 'None'}</div>
            <div>Permissions: {authState.user?.permissions?.length || 0}</div>
          </div>
        </div>
        
        <div>
          <strong>Users Count:</strong> {users.length}
        </div>

        {authState.user && (
          <div>
            <strong>User Permissions:</strong>
            <div className="ml-2 max-h-20 overflow-y-auto">
              {authState.user.permissions?.map(perm => (
                <div key={perm} className="text-[10px]">• {perm}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleClearAuth}>
            Reset Auth
          </Button>
          <Button size="sm" variant="destructive" onClick={handleClearUsers}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}