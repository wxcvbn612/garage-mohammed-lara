import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Wrench, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Warning,
  PencilSimple,
  Eye,
  MagnifyingGlass,
  Filter
} from '@phosphor-icons/react';
import { Repair, Customer, Vehicle, RepairStatus, RepairPriority } from '@/entities';
import { repairService, customerService, vehicleService } from '@/services';
import { toast } from 'sonner';
import { useAppGear, formatCurrency } from '../hooks/useAppSettings';

export default function RepairsList() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isAddRepairOpen, setIsAddRepairOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFunnel, setStatusFilter] = useState<string>('all');
  const [priorityFunnel, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const settings = useAppSettings();

  // Formulaire de réparation
  const [repairForm, setRepairForm] = useState({
    vehicleId: '',
    customerId: '',
    title: '',
    description: '',
    status: 'en_attente' as const,
    priority: 'normale' as const,
    estimatedCost: 0,
    estimatedDuration: 0,
    laborCost: 0,
    parts: [] as any[],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [repairsData, customersData, vehiclesData] = await Promise.all([
        repairService.getAllRepairs(),
        customerService.getAllCustomers(),
        vehicleService.getAllVehicles()
      ]);
      setRepairs(repairsData);
      setCustomers(customersData);
      setVehicles(vehiclesData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRepair = async () => {
    try {
      const newRepair = await repairService.createRepair(repairForm);
      setRepairs(prev => [...prev, newRepair]);
      setRepairForm({
        vehicleId: '',
        customerId: '',
        title: '',
        description: '',
        status: 'en_attente',
        priority: 'normale',
        estimatedCost: 0,
        estimatedDuration: 0,
        laborCost: 0,
        parts: [],
        notes: ''
      });
      setIsAddRepairOpen(false);
      toast.success('Réparation créée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création de la réparation');
    }
  };

  const handleStatusChange = async (repairId: string, newStatus: string) => {
    try {
      const updatedRepair = await repairService.updateRepairStatus(repairId, newStatus);
      if (updatedRepair) {
        setRepairs(prev => prev.map(r => r.id === repairId ? updatedRepair : r));
        toast.success('Statut mis à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_attente: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      en_cours: { label: 'En cours', variant: 'default' as const, icon: Wrench },
      termine: { label: 'Terminé', variant: 'secondary' as const, icon: CheckCircle },
      annule: { label: 'Annulé', variant: 'outline' as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      basse: { label: 'Basse', className: 'bg-green-100 text-green-800' },
      normale: { label: 'Normale', className: 'bg-blue-100 text-blue-800' },
      haute: { label: 'Haute', className: 'bg-orange-100 text-orange-800' },
      urgente: { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normale;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Client inconnu';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'Véhicule inconnu';
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesMagnifyingGlass = repair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCustomerName(repair.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || repair.priority === priorityFilter;
    
    return matchesMagnifyingGlass && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Réparations</h2>
        <Button onClick={() => setIsAddRepairOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réparation
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une réparation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
                <SelectItem value="normale">Normale</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des réparations */}
      <Card>
        <CardHeader>
          <CardTitle>Réparations ({filteredRepairs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Coût estimé</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell className="font-medium">{repair.title}</TableCell>
                  <TableCell>{getCustomerName(repair.customerId)}</TableCell>
                  <TableCell>{getVehicleInfo(repair.vehicleId)}</TableCell>
                  <TableCell>{getStatusBadge(repair.status)}</TableCell>
                  <TableCell>{getPriorityBadge(repair.priority)}</TableCell>
                  <TableCell>{formatCurrency(repair.estimatedCost, settings.currency)}</TableCell>
                  <TableCell>{new Date(repair.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedRepair(repair);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={repair.status}
                        onValueChange={(value) => handleStatusChange(repair.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="termine">Terminé</SelectItem>
                          <SelectItem value="annule">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pour nouvelle réparation */}
      <Dialog open={isAddRepairOpen} onOpenChange={setIsAddRepairOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nouvelle Réparation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Client</Label>
              <Select 
                value={repairForm.customerId} 
                onValueChange={(value) => {
                  setRepairForm(prev => ({ ...prev, customerId: value }));
                  // Reset vehicle when customer changes
                  const customerVehicles = vehicles.filter(v => v.customerId === value);
                  if (customerVehicles.length > 0) {
                    setRepairForm(prev => ({ ...prev, vehicleId: customerVehicles[0].id }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Véhicule</Label>
              <Select value={repairForm.vehicleId} onValueChange={(value) => setRepairForm(prev => ({ ...prev, vehicleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles
                    .filter(v => !repairForm.customerId || v.customerId === repairForm.customerId)
                    .map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={repairForm.title}
                onChange={(e) => setRepairForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Changement des plaquettes de frein"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={repairForm.description}
                onChange={(e) => setRepairForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée de la réparation..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={repairForm.priority} onValueChange={(value) => setRepairForm(prev => ({ ...prev, priority: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basse">Basse</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Coût estimé ({settings.currency.symbol})</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={repairForm.estimatedCost}
                onChange={(e) => setRepairForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Durée estimée (heures)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={repairForm.estimatedDuration}
                onChange={(e) => setRepairForm(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laborCost">Coût main d'œuvre ({settings.currency.symbol})</Label>
              <Input
                id="laborCost"
                type="number"
                value={repairForm.laborCost}
                onChange={(e) => setRepairForm(prev => ({ ...prev, laborCost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddRepairOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddRepair}>
              Créer la réparation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog détail réparation */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la réparation</DialogTitle>
          </DialogHeader>
          {selectedRepair && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRepair.title}</h3>
                    <p className="text-muted-foreground">{selectedRepair.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedRepair.status)}
                    {getPriorityBadge(selectedRepair.priority)}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Client</Label>
                    <p>{getCustomerName(selectedRepair.customerId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Véhicule</Label>
                    <p>{getVehicleInfo(selectedRepair.vehicleId)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(selectedRepair.estimatedCost, settings.currency)}</p>
                      <p className="text-sm text-muted-foreground">Coût estimé</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedRepair.estimatedDuration}h</p>
                      <p className="text-sm text-muted-foreground">Durée estimée</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(selectedRepair.laborCost, settings.currency)}</p>
                      <p className="text-sm text-muted-foreground">Main d'œuvre</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label className="text-sm font-medium">Dates</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Créée le</p>
                    <p>{new Date(selectedRepair.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedRepair.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Débutée le</p>
                      <p>{new Date(selectedRepair.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedRepair.endDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Terminée le</p>
                      <p>{new Date(selectedRepair.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRepair.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="mt-2 p-3 bg-muted rounded-lg">{selectedRepair.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}