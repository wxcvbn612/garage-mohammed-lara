import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeSlash, Car, User } from '@phosphor-icons/react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
}

export default function LoginForm({ onLogin, loading }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim() && !loading) {
      try {
        const success = await onLogin(username.trim(), password);
        if (!success) {
          // Le hook useAuth gère déjà l'état de chargement et les erreurs
          console.log('Échec de la connexion');
        }
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mx-auto mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Garage Mohammed</h1>
          <p className="text-muted-foreground">Système de gestion - Larache</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Connexion</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Connectez-vous à votre compte
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlash className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !username.trim() || !password.trim()}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Comptes de démonstration :
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Autres rôles:</strong> username / password</p>
              </div>
              {loading && (
                <div className="mt-2 text-xs text-primary">
                  Connexion en cours...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 Garage Mohammed Larache. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}