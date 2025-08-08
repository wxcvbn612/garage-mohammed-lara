import { useKV } from '../hooks/useKV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Car, 
  Plus, 
  MagnifyingGlass, 
  PencilSimple,
  Trash,
  GasPump,
  Calendar,
  Info,
  Camera,
  Eye
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { Vehicle, Customer, VehiclePhoto } from '@/entities';
import { toast } from 'sonner';
import VehiclePhotoGallery from './VehiclePhotoGallery';
import '../lib/spark-mocks'; // Ensure spark is available
import VehicleDetailView from './VehicleDetailView';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useKV<Vehicle[]>('vehicles', []);
  const [customers] = useKV<Customer[]>('customers', []);
  const [photos, setPhotos] = useKV<VehiclePhoto[]>('vehicle-photos', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingGallery, setViewingGallery] = useState<Vehicle | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Vehicle | null>(null);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);

  // Effet pour rafraîchir les photos quand nécessaire
  useEffect(() => {
    const refreshPhotos = async () => {
      try {
        const currentPhotos = await window.spark.kv.get<VehiclePhoto[]>('vehicle-photos') || [];
        setPhotos(currentPhotos);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des photos:', error);
      }
    };
    
    // Rafraîchir au montage du composant et lors des changements
    refreshPhotos();
  }, [photoRefreshKey, setPhotos]);

  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle & { fuelType: string }>>({
    customerId: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    mileage: 0,
    fuelType: 'essence',
    color: '',
    notes: ''
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const customer = customers.find(c => c.id === vehicle.customerId);
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : '';
    
    const matchesMagnifyingGlass = !searchTerm || 
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = selectedCustomer === 'all' || vehicle.customerId === selectedCustomer;
    
    return matchesMagnifyingGlass && matchesCustomer;
  });

  const handleAddVehicle = () => {
    if (!newVehicle.customerId || !newVehicle.brand || !newVehicle.model || !newVehicle.licensePlate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que le client sélectionné existe
    const selectedCustomerExists = customers.find(c => c.id === newVehicle.customerId);
    if (!selectedCustomerExists) {
      toast.error('Le client sélectionné n\'existe pas');
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle as Omit<Vehicle, 'id'>,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setVehicles(current => [...current, vehicle]);
    setNewVehicle({
      customerId: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
      mileage: 0,
      fuelType: 'essence',
      color: '',
      notes: ''
    });
    setIsAddDialogOpen(false);
    toast.success('Véhicule ajouté avec succès');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle(vehicle);
    setIsAddDialogOpen(true);
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle || !newVehicle.customerId || !newVehicle.brand || !newVehicle.model || !newVehicle.licensePlate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setVehicles(current => 
      current.map(v => 
        v.id === editingVehicle.id 
          ? { ...newVehicle as Vehicle, id: editingVehicle.id, updatedAt: new Date() }
          : v
      )
    );
    
    setEditingVehicle(null);
    setNewVehicle({
      customerId: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
      mileage: 0,
      fuelType: 'essence',
      color: '',
      notes: ''
    });
    setIsAddDialogOpen(false);
    toast.success('Véhicule modifié avec succès');
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(current => current.filter(v => v.id !== vehicleId));
    toast.success('Véhicule supprimé avec succès');
  };

  const handleViewGallery = (vehicle: Vehicle) => {
    setViewingGallery(vehicle);
    // Rafraîchir les photos avant d'ouvrir la galerie
    setPhotoRefreshKey(prev => prev + 1);
  };

  const handleViewDetail = (vehicle: Vehicle) => {
    setViewingDetail(vehicle);
  };

  const handleCloseGallery = () => {
    setViewingGallery(null);
    // Déclencher un rafraîchissement des photos
    setPhotoRefreshKey(prev => prev + 1);
  };

  const handleCloseDetail = () => {
    setViewingDetail(null);
  };

  // Recalculer en temps réel le nombre de photos depuis le storage
  const getVehiclePhotoCount = (vehicleId: string) => {
    return photos.filter(photo => photo.vehicleId === vehicleId).length;
  };

  const getFuelTypeIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'essence':
        return '⛽';
      case 'diesel':
        return '🛢️';
      case 'hybride':
        return '🔋';
      case 'electrique':
        return '⚡';
      default:
        return '⛽';
    }
  };

  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
      case 'essence':
        return 'bg-blue-100 text-blue-800';
      case 'diesel':
        return 'bg-gray-100 text-gray-800';
      case 'hybride':
        return 'bg-green-100 text-green-800';
      case 'electrique':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {viewingDetail ? (
        <VehicleDetailView 
          vehicle={viewingDetail} 
          onClose={handleCloseDetail} 
        />
      ) : viewingGallery ? (
        <VehiclePhotoGallery 
          vehicle={viewingGallery} 
          onClose={handleCloseGallery}
          onPhotoAdded={() => setPhotoRefreshKey(prev => prev + 1)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Véhicules</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un véhicule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un nouveau véhicule'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="customer">Client *</Label>
                <Select 
                  value={newVehicle.customerId} 
                  onValueChange={(value) => setNewVehicle(prev => ({ ...prev, customerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Aucun client disponible. Veuillez d'abord ajouter des clients.
                      </div>
                    ) : (
                      customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {customers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Vous devez d'abord ajouter des clients dans la section "Clients".
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marque *</Label>
                <Input
                  id="brand"
                  value={newVehicle.brand}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Peugeot, Renault, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modèle *</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="308, Clio, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min="1980"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Plaque d'immatriculation *</Label>
                <Input
                  id="licensePlate"
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                  placeholder="AA-123-AA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">Numéro VIN</Label>
                <Input
                  id="vin"
                  value={newVehicle.vin}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value }))}
                  placeholder="17 caractères"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={newVehicle.mileage}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                  placeholder="150000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Type de carburant</Label>
                <Select 
                  value={newVehicle.fuelType} 
                  onValueChange={(value) => setNewVehicle(prev => ({ ...prev, fuelType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essence">Essence</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                    <SelectItem value="electrique">Électrique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Blanc, Rouge, etc."
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informations supplémentaires..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingVehicle(null);
                  setNewVehicle({
                    customerId: '',
                    brand: '',
                    model: '',
                    year: new Date().getFullYear(),
                    licensePlate: '',
                    vin: '',
                    mileage: 0,
                    fuelType: 'essence',
                    color: '',
                    notes: ''
                  });
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
                disabled={customers.length === 0}
              >
                {editingVehicle ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par marque, modèle, plaque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des véhicules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => {
          const customer = customers.find(c => c.id === vehicle.customerId);
          return (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    {vehicle.brand} {vehicle.model}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(vehicle)}
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewGallery(vehicle)}
                      title="Galerie photos"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="ml-1 text-xs">
                        {getVehiclePhotoCount(vehicle.id)}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditVehicle(vehicle)}
                      title="Modifier"
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      title="Supprimer"
                    >
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Propriétaire:</span>
                    <span className="text-sm font-medium">
                      {customer ? `${customer.firstName} ${customer.lastName}` : 'Client inconnu'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plaque:</span>
                    <Badge variant="outline" className="font-mono">
                      {vehicle.licensePlate}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Année:</span>
                    <span className="text-sm">{vehicle.year}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Carburant:</span>
                    <Badge className={`text-xs ${getFuelTypeColor(vehicle.fuelType)}`}>
                      {getFuelTypeIcon(vehicle.fuelType)} {vehicle.fuelType}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Kilométrage:</span>
                    <span className="text-sm">{vehicle.mileage.toLocaleString()} km</span>
                  </div>

                  {vehicle.color && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Couleur:</span>
                      <span className="text-sm">{vehicle.color}</span>
                    </div>
                  )}

                  {vehicle.vin && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">VIN:</span>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {vehicle.vin.slice(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions principales */}
                <div className="pt-2 border-t space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewDetail(vehicle)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewGallery(vehicle)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Galerie photos ({getVehiclePhotoCount(vehicle.id)})
                  </Button>
                </div>

                {vehicle.notes && (
                  <div className="pt-2 border-t">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground">{vehicle.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {customers.length === 0 ? 'Aucun client disponible' : 'Aucun véhicule trouvé'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {customers.length === 0 
                ? 'Vous devez d\'abord ajouter des clients dans la section "Clients" avant de pouvoir ajouter des véhicules.'
                : (searchTerm || selectedCustomer !== 'all'
                  ? 'Aucun véhicule ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter un véhicule.'
                )
              }
            </p>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}