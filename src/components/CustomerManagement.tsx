import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User, Phone, Envelope, MapPin, PencilSimple, Trash, MagnifyingGlass, Eye, ArrowLeft, Shield } from '@phosphor-icons/react';
import { Customer, Vehicle } from '@/entities';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useCustomers, useVehicles } from '../hooks/useDatabase';
import CustomerDetailPage from './CustomerDetailPage';

interface CustomerManagementProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomerManagement({ isOpen, onOpenChange }: CustomerManagementProps) {
  const { 
    customers, 
    loading, 
    error, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer, 
    searchCustomers,
    getCustomerWithVehicles,
    refreshCustomers
  } = useCustomers();
  const { vehicles, refreshVehicles } = useVehicles();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = useAuth();

  // Rafraîchir les données au chargement du composant
  useEffect(() => {
    refreshCustomers();
    refreshVehicles();
  }, [refreshCustomers, refreshVehicles]);

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

  const validateCustomerForm = () => {
    if (!customerForm.firstName.trim()) {
      toast.error('Le prénom est requis');
      return false;
    }
    if (!customerForm.lastName.trim()) {
      toast.error('Le nom est requis');
      return false;
    }
    if (!customerForm.email.trim()) {
      toast.error('L\'email est requis');
      return false;
    }
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerForm.email)) {
      toast.error('L\'adresse email n\'est pas valide');
      return false;
    }
    if (!customerForm.phone.trim()) {
      toast.error('Le téléphone est requis');
      return false;
    }
    if (!customerForm.address.trim()) {
      toast.error('L\'adresse est requise');
      return false;
    }
    if (!customerForm.city.trim()) {
      toast.error('La ville est requise');
      return false;
    }
    return true;
  };

  const resetForm = () => {
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
  };

  const handleAddCustomer = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!validateCustomerForm()) return;

      await createCustomer(customerForm);
      resetForm();
      setIsAddCustomerOpen(false);
      toast.success('Client ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast.error(`Erreur lors de l'ajout du client: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = async () => {
    if (isSubmitting || !selectedCustomer) return;
    
    try {
      setIsSubmitting(true);
      
      if (!validateCustomerForm()) return;

      await updateCustomer(selectedCustomer.id, customerForm);
      resetForm();
      setIsEditCustomerOpen(false);
      setSelectedCustomer(null);
      toast.success('Client modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification du client:', error);
      toast.error(`Erreur lors de la modification du client: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerVehicles = (customerId: string) => {
    const vehicleCount = vehicles.filter(vehicle => vehicle.customerId === customerId);
    console.log(`Client ${customerId} a ${vehicleCount.length} véhicule(s):`, vehicleCount);
    return vehicleCount;
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setViewMode('list');
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode || '',
      notes: customer.notes || ''
    });
    setIsEditCustomerOpen(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteCustomer(customerId);
        toast.success('Client supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleMagnifyingGlass = async () => {
    if (searchTerm.trim()) {
      try {
        await searchCustomers(searchTerm);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        toast.error('Erreur lors de la recherche');
      }
    }
  };

  // Afficher la page de détail du client si un client est sélectionné
  if (viewMode === 'detail' && selectedCustomer) {
    return (
      <CustomerDetailPage 
        customer={selectedCustomer}
        onBack={handleBackToList}
      />
    );
  }

  // Check permissions
  if (!hasPermission('customers.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Accès refusé</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des clients.
          </p>
        </div>
      </div>
    );
  }

  const canCreateCustomer = hasPermission('customers.create');
  const canUpdateCustomer = hasPermission('customers.update');
  const canDeleteCustomer = hasPermission('customers.delete');

  // Gérer les erreurs de chargement
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Erreur lors du chargement des données</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
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
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 w-64"
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <MagnifyingGlass className="w-4 h-4" />
            </Button>
          </div>
          {canCreateCustomer && (
            <Button onClick={() => setIsAddCustomerOpen(true)} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          )}
        </div>
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      )}

      {/* Liste des clients */}
      {!loading && (
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
                  <Button size="sm" variant="ghost" onClick={() => handleViewCustomer(customer)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {canUpdateCustomer && (
                    <Button size="sm" variant="ghost" onClick={() => handleEditClick(customer)} title="Modifier">
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                  )}
                  {canDeleteCustomer && (
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteCustomer(customer.id)} title="Supprimer">
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Envelope className="w-4 h-4" />
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
              <div className="pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </Button>
              </div>
            </CardContent>
          </Card>
            ))}
        </div>
      )}

      {/* Message si aucun client */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `Aucun client ne correspond à "${searchTerm}"`
              : 'Commencez par ajouter votre premier client'
            }
          </p>
          {!searchTerm && canCreateCustomer && (
            <Button onClick={() => setIsAddCustomerOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un client
            </Button>
          )}
        </div>
      )}

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? 'Aucun client ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter un client.'
              }
            </p>
          </CardContent>
        </Card>
      )}

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

      {/* Dialog pour modifier un client */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier Client</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Prénom *</Label>
              <Input
                id="edit-firstName"
                required
                value={customerForm.firstName}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Nom *</Label>
              <Input
                id="edit-lastName"
                required
                value={customerForm.lastName}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={customerForm.email}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone *</Label>
              <Input
                id="edit-phone"
                required
                value={customerForm.phone}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Adresse *</Label>
              <Input
                id="edit-address"
                required
                value={customerForm.address}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ville *</Label>
              <Input
                id="edit-city"
                required
                value={customerForm.city}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postalCode">Code Postal</Label>
              <Input
                id="edit-postalCode"
                value={customerForm.postalCode}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, postalCode: e.target.value }))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditCustomerOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleEditCustomer} disabled={isSubmitting}>
              {isSubmitting ? 'Modification en cours...' : 'Modifier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}