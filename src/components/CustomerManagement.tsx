import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User, Phone, Mail, MapPin, Edit, Trash2, Search } from '@phosphor-icons/react';
import { Customer, Vehicle } from '@/entities';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface CustomerManagementProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomerManagement({ isOpen, onOpenChange }: CustomerManagementProps) {
  const [customers, setCustomers] = useKV<Customer[]>('customers', []);
  const [vehicles] = useKV<Vehicle[]>('vehicles', []);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddCustomer = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
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

      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...customerForm,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
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

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(vehicle => vehicle.customerId === customerId);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        toast.success('Client supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

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

      {/* Liste des clients */}
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
    </div>
  );
}