import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, Car, Phone, Mail, MapPin, Edit, Trash2, Search } from '@phosphor-icons/react';
import { Customer, Vehicle } from '@/entities';
import { customerService, vehicleService } from '@/services';
import { toast } from 'sonner';
import { useSparkReady } from '@/hooks/useSparkReady';

interface CustomerManagementProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomerManagement({ isOpen, onOpenChange }: CustomerManagementProps) {
  const { isReady: sparkReady, error: sparkError } = useSparkReady();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire client
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  // Formulaire véhicule
  const [vehicleForm, setVehicleForm] = useState({
    customerId: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    mileage: 0,
    fuelType: 'essence' as const,
    color: '',
    notes: ''
  });

  useEffect(() => {
    if (sparkReady) {
      loadData();
    } else if (sparkError) {
      setError(sparkError);
      setIsLoading(false);
    }
  }, [sparkReady, sparkError]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [customersData, vehiclesData] = await Promise.all([
        customerService.getAllCustomers(),
        vehicleService.getAllVehicles()
      ]);
      
      setCustomers(customersData);
      setVehicles(vehiclesData);
      
      console.log('Données chargées:', { customers: customersData.length, vehicles: vehiclesData.length });
    } catch (error) {
      console.error('Erreur de chargement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement';
      setError(errorMessage);
      toast.error(`Erreur lors du chargement des données: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Vérification que spark est disponible
      if (typeof window.spark === 'undefined') {
        toast.error('Erreur: Service de stockage non disponible');
        return;
      }
      
      // Validation côté client
      if (!customerForm.firstName.trim()) {
        toast.error('Le prénom est requis');
        return;
      }
      if (!customerForm.lastName.trim()) {
        toast.error('Le nom est requis');
        return;
      }
      if (!customerForm.email.trim()) {
        toast.error('L\'email est requis');
        return;
      }
      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerForm.email)) {
        toast.error('L\'adresse email n\'est pas valide');
        return;
      }
      if (!customerForm.phone.trim()) {
        toast.error('Le téléphone est requis');
        return;
      }
      if (!customerForm.address.trim()) {
        toast.error('L\'adresse est requise');
        return;
      }
      if (!customerForm.city.trim()) {
        toast.error('La ville est requise');
        return;
      }

      console.log('Tentative de création du client:', customerForm);
      const newCustomer = await customerService.createCustomer(customerForm);
      console.log('Client créé avec succès:', newCustomer);
      
      setCustomers(prev => [...prev, newCustomer]);
      setCustomerForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        notes: ''
      });
      setIsAddCustomerOpen(false);
      toast.success('Client ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast.error(`Erreur lors de l'ajout du client: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVehicle = async () => {
    try {
      const newVehicle = await vehicleService.createVehicle(vehicleForm);
      setVehicles(prev => [...prev, newVehicle]);
      setVehicleForm({
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
      setIsAddVehicleOpen(false);
      toast.success('Véhicule ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du véhicule');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await customerService.deleteCustomer(customerId);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        toast.success('Client supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(vehicle => vehicle.customerId === customerId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">Chargement des données...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">
            Erreur lors du chargement
          </div>
          <div className="text-muted-foreground">
            {error}
          </div>
          <Button onClick={loadData} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Clients</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {customer.firstName} {customer.lastName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedCustomer(customer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCustomer(customer.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {customer.city}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {getCustomerVehicles(customer.id).length} véhicule(s)
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Client depuis {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddVehicleOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Véhicule
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const customer = customers.find(c => c.id === vehicle.customerId);
              return (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Car className="w-5 h-5 text-primary" />
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Année:</span>
                        <span>{vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plaque:</span>
                        <Badge variant="outline">{vehicle.licensePlate}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kilométrage:</span>
                        <span>{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carburant:</span>
                        <Badge variant="secondary">{vehicle.fuelType}</Badge>
                      </div>
                    </div>
                    {customer && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Propriétaire: {customer.firstName} {customer.lastName}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour ajouter un client */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Client</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                required
                value={customerForm.firstName}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                required
                value={customerForm.lastName}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={customerForm.email}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                required
                value={customerForm.phone}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                required
                value={customerForm.address}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                required
                value={customerForm.city}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code Postal</Label>
              <Input
                id="postalCode"
                value={customerForm.postalCode}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, postalCode: e.target.value }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleAddCustomer} disabled={isSubmitting}>
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un véhicule */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Véhicule</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="customerId">Client</Label>
              <Select value={vehicleForm.customerId} onValueChange={(value) => setVehicleForm(prev => ({ ...prev, customerId: value }))}>
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
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={vehicleForm.brand}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                value={vehicleForm.model}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                type="number"
                value={vehicleForm.year}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plaque d'immatriculation</Label>
              <Input
                id="licensePlate"
                value={vehicleForm.licensePlate}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN (optionnel)</Label>
              <Input
                id="vin"
                value={vehicleForm.vin}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, vin: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilométrage</Label>
              <Input
                id="mileage"
                type="number"
                value={vehicleForm.mileage}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelType">Type de carburant</Label>
              <Select value={vehicleForm.fuelType} onValueChange={(value) => setVehicleForm(prev => ({ ...prev, fuelType: value as any }))}>
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
              <Label htmlFor="color">Couleur (optionnel)</Label>
              <Input
                id="color"
                value={vehicleForm.color}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddVehicle}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}