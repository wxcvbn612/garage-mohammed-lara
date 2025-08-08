import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Plus, 
  Search, 
  Edit,
  Trash,
  Phone,
  Mail,
  Calendar,
  Wrench,
  Euro,
  Star
} from '@phosphor-icons/react';
import { useState } from 'react';
import { Mechanic } from '@/entities';
import { toast } from 'sonner';
import { useAppSettings } from '../hooks/useAppSettings';

export default function MechanicManagement() {
  const settings = useAppSettings();
  const [mechanics, setMechanics] = useKV<Mechanic[]>('mechanics', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const [newMechanic, setNewMechanic] = useState<Partial<Mechanic>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specializations: [],
    hourlyRate: 45,
    isActive: true,
    hireDate: new Date(),
    notes: ''
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  const commonSpecializations = [
    'Moteur',
    'Transmission',
    'Freinage',
    'Suspension',
    'Électronique',
    'Climatisation',
    'Échappement',
    'Carrosserie',
    'Diagnostic',
    'Entretien'
  ];

  const filteredMechanics = mechanics.filter(mechanic => {
    const fullName = `${mechanic.firstName} ${mechanic.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) ||
           mechanic.email.toLowerCase().includes(searchLower) ||
           mechanic.specializations.some(spec => spec.toLowerCase().includes(searchLower));
  });

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !newMechanic.specializations?.includes(newSpecialization.trim())) {
      setNewMechanic(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setNewMechanic(prev => ({
      ...prev,
      specializations: prev.specializations?.filter(s => s !== spec) || []
    }));
  };

  const handleAddMechanic = () => {
    if (!newMechanic.firstName || !newMechanic.lastName || !newMechanic.email || !newMechanic.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si l'email existe déjà
    const emailExists = mechanics.some(m => m.email === newMechanic.email && m.id !== editingMechanic?.id);
    if (emailExists) {
      toast.error('Cette adresse email est déjà utilisée');
      return;
    }

    const mechanic: Mechanic = {
      id: Date.now().toString(),
      ...newMechanic as Omit<Mechanic, 'id'>,
      specializations: newMechanic.specializations || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMechanics(current => [...current, mechanic]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success('Mécanicien ajouté avec succès');
  };

  const handleEditMechanic = (mechanic: Mechanic) => {
    setEditingMechanic(mechanic);
    setNewMechanic(mechanic);
    setIsAddDialogOpen(true);
  };

  const handleUpdateMechanic = () => {
    if (!editingMechanic || !newMechanic.firstName || !newMechanic.lastName || !newMechanic.email || !newMechanic.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si l'email existe déjà (sauf pour le mécanicien actuel)
    const emailExists = mechanics.some(m => m.email === newMechanic.email && m.id !== editingMechanic.id);
    if (emailExists) {
      toast.error('Cette adresse email est déjà utilisée');
      return;
    }

    setMechanics(current => 
      current.map(m => 
        m.id === editingMechanic.id 
          ? { ...newMechanic as Mechanic, id: editingMechanic.id, updatedAt: new Date() }
          : m
      )
    );
    
    resetForm();
    setEditingMechanic(null);
    setIsAddDialogOpen(false);
    toast.success('Mécanicien modifié avec succès');
  };

  const handleDeleteMechanic = (mechanicId: string) => {
    setMechanics(current => current.filter(m => m.id !== mechanicId));
    toast.success('Mécanicien supprimé avec succès');
  };

  const resetForm = () => {
    setNewMechanic({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specializations: [],
      hourlyRate: 45,
      isActive: true,
      hireDate: new Date(),
      notes: ''
    });
    setNewSpecialization('');
  };

  const getSpecializationColor = (spec: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800'
    ];
    return colors[spec.length % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Mécaniciens</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un mécanicien
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMechanic ? 'Modifier le mécanicien' : 'Ajouter un nouveau mécanicien'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={newMechanic.firstName}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Mohammed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={newMechanic.lastName}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Benali"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMechanic.email}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="mohammed@garage.ma"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={newMechanic.phone}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0661234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Tarif horaire ({settings.currency.symbol})</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMechanic.hourlyRate}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                  placeholder="45.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={newMechanic.hireDate ? new Date(newMechanic.hireDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, hireDate: new Date(e.target.value) }))}
                />
              </div>

              <div className="col-span-2 space-y-3">
                <Label>Spécialisations</Label>
                
                {/* Spécialisations communes */}
                <div className="flex flex-wrap gap-2">
                  {commonSpecializations.map(spec => (
                    <Button
                      key={spec}
                      type="button"
                      variant={newMechanic.specializations?.includes(spec) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (newMechanic.specializations?.includes(spec)) {
                          handleRemoveSpecialization(spec);
                        } else {
                          setNewMechanic(prev => ({
                            ...prev,
                            specializations: [...(prev.specializations || []), spec]
                          }));
                        }
                      }}
                    >
                      {spec}
                    </Button>
                  ))}
                </div>

                {/* Ajouter une spécialisation personnalisée */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter une spécialisation..."
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialization()}
                  />
                  <Button type="button" onClick={handleAddSpecialization}>
                    Ajouter
                  </Button>
                </div>

                {/* Spécialisations sélectionnées */}
                {newMechanic.specializations && newMechanic.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newMechanic.specializations.map(spec => (
                      <Badge 
                        key={spec} 
                        className={`${getSpecializationColor(spec)} cursor-pointer`}
                        onClick={() => handleRemoveSpecialization(spec)}
                      >
                        {spec} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newMechanic.isActive}
                  onCheckedChange={(checked) => setNewMechanic(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Mécanicien actif</Label>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newMechanic.notes}
                  onChange={(e) => setNewMechanic(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informations supplémentaires..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingMechanic(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={editingMechanic ? handleUpdateMechanic : handleAddMechanic}>
                {editingMechanic ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{mechanics.length}</p>
              </div>
              <User className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {mechanics.filter(m => m.isActive).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarif moyen</p>
                <p className="text-2xl font-bold">
                  {mechanics.length > 0 
                    ? (mechanics.reduce((sum, m) => sum + m.hourlyRate, 0) / mechanics.length).toFixed(0)
                    : 0
                  }{settings.currency.symbol}/h
                </p>
              </div>
              <Euro className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spécialisations</p>
                <p className="text-2xl font-bold">
                  {new Set(mechanics.flatMap(m => m.specializations)).size}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, email ou spécialisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des mécaniciens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMechanics.map(mechanic => (
          <Card key={mechanic.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {mechanic.firstName} {mechanic.lastName}
                </CardTitle>
                <div className="flex gap-1">
                  {!mechanic.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactif
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditMechanic(mechanic)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMechanic(mechanic.id)}
                  >
                    <Trash className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{mechanic.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{mechanic.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{mechanic.hourlyRate}{settings.currency.symbol}/heure</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Embauché le {new Date(mechanic.hireDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {mechanic.specializations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Spécialisations:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mechanic.specializations.map(spec => (
                      <Badge 
                        key={spec} 
                        variant="outline" 
                        className={`text-xs ${getSpecializationColor(spec)}`}
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {mechanic.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">{mechanic.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMechanics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucun mécanicien trouvé
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? 'Aucun mécanicien ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter un mécanicien.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}