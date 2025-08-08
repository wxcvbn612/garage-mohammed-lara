import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Pencil, 
  Trash, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Clock,
  Users,
  Eye,
  UserCircle
} from '@phosphor-icons/react';
import { useAuth, type User } from '../hooks/useAuth';
import { toast } from 'sonner';

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: User['role'];
  isActive: boolean;
}

const ROLE_LABELS = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  mechanic: 'Mécanicien',
  receptionist: 'Réceptionniste'
};

const ROLE_COLORS = {
  admin: 'bg-destructive text-destructive-foreground',
  manager: 'bg-primary text-primary-foreground',
  mechanic: 'bg-accent text-accent-foreground',
  receptionist: 'bg-secondary text-secondary-foreground'
};

export default function UserManagement() {
  const { users, createUser, updateUser, deleteUser, hasPermission, authState } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'receptionist',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'receptionist',
      isActive: true
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // For new users, password is required
    if (!editingUser && !formData.password.trim()) {
      toast.error('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    // Password validation for new users or when password is provided
    if ((!editingUser || formData.password.trim()) && formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (editingUser) {
      // Only update password if it's provided
      const updateData = { ...formData };
      if (!formData.password.trim()) {
        delete updateData.password;
      }
      updateUser(editingUser.id, updateData);
    } else {
      // Check if username already exists
      const existingUser = users.find(u => u.username === formData.username.trim());
      if (existingUser) {
        toast.error('Ce nom d\'utilisateur existe déjà');
        return;
      }
      createUser(formData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: '', // Don't pre-fill password for security
      role: user.role,
      isActive: user.isActive
    });
    setIsDialogOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      deleteUser(user.id);
    }
  };

  const canManageUsers = hasPermission('users.create') && hasPermission('users.update');

  if (!hasPermission('users.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Vous n'avez pas accès à cette section</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        {canManageUsers && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={resetForm}>
                <Plus className="w-4 h-4" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? 'Nouveau mot de passe' : 'Mot de passe'}
                  />
                  {formData.password && formData.password.length < 6 && (
                    <p className="text-xs text-destructive">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="manager">Gestionnaire</SelectItem>
                      <SelectItem value="mechanic">Mécanicien</SelectItem>
                      <SelectItem value="receptionist">Réceptionniste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Compte actif</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Mettre à jour' : 'Créer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <UserCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connectés</p>
                <p className="text-xl font-bold">{users.filter(u => u.lastLogin).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      <Badge className={ROLE_COLORS[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                      {user.id === authState.user?.id && (
                        <Badge variant="outline">Vous</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {user.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      {user.lastLogin && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Dernière connexion: {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(user)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canManageUsers && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {hasPermission('users.delete') && user.id !== authState.user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <Badge className={ROLE_COLORS[selectedUser.role]}>
                  {ROLE_LABELS[selectedUser.role]}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Nom d'utilisateur</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.isActive ? 'Actif' : 'Inactif'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Créé le</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedUser.lastLogin && (
                  <div>
                    <Label className="text-sm font-medium">Dernière connexion</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedUser.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.permissions.slice(0, 6).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {selectedUser.permissions.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedUser.permissions.length - 6} autres
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}