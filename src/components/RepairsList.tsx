import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Tool,
  Eye
} from '@phosphor-icons/react';
import { useState } from 'react';

interface Repair {
  id: string;
  vehicleModel: string;
  plateNumber: string;
  clientName: string;
  clientPhone: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  estimatedCost: number;
  actualCost?: number;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  mechanic: string;
  priority: 'low' | 'medium' | 'high';
}

const RepairsList = () => {
  const [repairs, setRepairs] = useKV<Repair[]>('repairs', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Tool className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'delivered': return 'Livré';
      default: return 'Inconnu';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateRepairStatus = (repairId: string, newStatus: string) => {
    setRepairs(currentRepairs => 
      currentRepairs.map(repair => 
        repair.id === repairId 
          ? { ...repair, status: newStatus as Repair['status'] }
          : repair
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Réparations</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle réparation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle réparation</DialogTitle>
            </DialogHeader>
            <AddRepairForm onAdd={(repair) => {
              setRepairs(current => [...current, repair]);
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par véhicule, client ou plaque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repairs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des réparations ({filteredRepairs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Coût estimé</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{repair.vehicleModel}</div>
                        <div className="text-sm text-muted-foreground">{repair.plateNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{repair.clientName}</div>
                      <div className="text-sm text-muted-foreground">{repair.clientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={repair.description}>
                      {repair.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(repair.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(repair.status)}
                      {getStatusLabel(repair.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(repair.priority)}>
                      {repair.priority === 'high' ? 'Haute' : repair.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{repair.estimatedCost}€</TableCell>
                  <TableCell className="text-sm">
                    {new Date(repair.estimatedEndDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRepair(repair)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {repair.status !== 'delivered' && (
                        <Select
                          value={repair.status}
                          onValueChange={(value) => updateRepairStatus(repair.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="completed">Terminé</SelectItem>
                            <SelectItem value="delivered">Livré</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Repair Detail Modal */}
      {selectedRepair && (
        <Dialog open={!!selectedRepair} onOpenChange={() => setSelectedRepair(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de la réparation</DialogTitle>
            </DialogHeader>
            <RepairDetail repair={selectedRepair} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const AddRepairForm = ({ onAdd }: { onAdd: (repair: Repair) => void }) => {
  const [formData, setFormData] = useState({
    vehicleModel: '',
    plateNumber: '',
    clientName: '',
    clientPhone: '',
    description: '',
    estimatedCost: '',
    estimatedEndDate: '',
    mechanic: '',
    priority: 'medium' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRepair: Repair = {
      id: Date.now().toString(),
      ...formData,
      estimatedCost: Number(formData.estimatedCost),
      status: 'pending',
      startDate: new Date().toISOString()
    };

    onAdd(newRepair);
    setFormData({
      vehicleModel: '',
      plateNumber: '',
      clientName: '',
      clientPhone: '',
      description: '',
      estimatedCost: '',
      estimatedEndDate: '',
      mechanic: '',
      priority: 'medium'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicleModel">Modèle du véhicule</Label>
          <Input
            id="vehicleModel"
            value={formData.vehicleModel}
            onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
            placeholder="ex: Peugeot 308"
            required
          />
        </div>
        <div>
          <Label htmlFor="plateNumber">Plaque d'immatriculation</Label>
          <Input
            id="plateNumber"
            value={formData.plateNumber}
            onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
            placeholder="ex: 123456-A-12"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Nom du client</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            placeholder="ex: Ahmed Benali"
            required
          />
        </div>
        <div>
          <Label htmlFor="clientPhone">Téléphone</Label>
          <Input
            id="clientPhone"
            value={formData.clientPhone}
            onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
            placeholder="ex: +212 6 12 34 56 78"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description du problème</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Décrivez le problème ou la réparation nécessaire..."
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="estimatedCost">Coût estimé (€)</Label>
          <Input
            id="estimatedCost"
            type="number"
            value={formData.estimatedCost}
            onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="estimatedEndDate">Date de fin estimée</Label>
          <Input
            id="estimatedEndDate"
            type="date"
            value={formData.estimatedEndDate}
            onChange={(e) => setFormData({...formData, estimatedEndDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="priority">Priorité</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as 'low' | 'medium' | 'high'})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="mechanic">Mécanicien assigné</Label>
        <Select value={formData.mechanic} onValueChange={(value) => setFormData({...formData, mechanic: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un mécanicien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mohammed">Mohammed</SelectItem>
            <SelectItem value="hassan">Hassan</SelectItem>
            <SelectItem value="omar">Omar</SelectItem>
            <SelectItem value="youssef">Youssef</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Ajouter la réparation</Button>
      </div>
    </form>
  );
};

const RepairDetail = ({ repair }: { repair: Repair }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Informations véhicule</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modèle:</span>
                <span className="font-medium">{repair.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plaque:</span>
                <span className="font-medium">{repair.plateNumber}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Informations client</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nom:</span>
                <span className="font-medium">{repair.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone:</span>
                <span className="font-medium">{repair.clientPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Détails réparation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut:</span>
                <Badge className={`${repair.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {repair.status === 'pending' ? 'En attente' : 
                   repair.status === 'in_progress' ? 'En cours' :
                   repair.status === 'completed' ? 'Terminé' : 'Livré'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priorité:</span>
                <Badge variant="outline" className={repair.priority === 'high' ? 'border-red-500 text-red-600' : repair.priority === 'medium' ? 'border-orange-500 text-orange-600' : 'border-green-500 text-green-600'}>
                  {repair.priority === 'high' ? 'Haute' : repair.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mécanicien:</span>
                <span className="font-medium">{repair.mechanic}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Coûts et dates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût estimé:</span>
                <span className="font-medium">{repair.estimatedCost}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date début:</span>
                <span className="font-medium">{new Date(repair.startDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date fin estimée:</span>
                <span className="font-medium">{new Date(repair.estimatedEndDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">
          {repair.description}
        </p>
      </div>
    </div>
  );
};

export default RepairsList;