import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Envelope, 
  MapPin, 
  Car, 
  CurrencyEur, 
  Calendar,
  File as FileText,
  CreditCard,
  ArrowLeft,
  Gear,
  CheckCircle,
  XCircle,
  Clock
} from '@phosphor-icons/react';
import { Customer, Vehicle, Invoice, Payment, Repair } from '@/entities';
import { useKV } from '../hooks/useKV';
import { useAppGear, formatCurrency } from '../hooks/useAppSettings';
import { useVehicles } from '../hooks/useDatabase';

interface CustomerDetailPageProps {
  customer: Customer;
  onBack: () => void;
}

export default function CustomerDetailPage({ customer, onBack }: CustomerDetailPageProps) {
  const settings = useAppSettings();
  const { vehicles, refreshVehicles } = useVehicles();
  const [invoices] = useKV<Invoice[]>('invoices', []);
  const [payments] = useKV<Payment[]>('payments', []);
  const [repairs] = useKV<Repair[]>('repairs', []);
  const [activeTab, setActiveTab] = useState('overview');

  // Forcer le rechargement des véhicules quand le composant se monte
  useEffect(() => {
    refreshVehicles();
  }, [customer.id, refreshVehicles]);

  // Filtrer les données du client
  const customerVehicles = vehicles.filter(vehicle => vehicle.customerId === customer.id);
  const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
  const customerPayments = payments.filter(payment => payment.customerId === customer.id);
  const customerRepairs = repairs.filter(repair => {
    const vehicle = vehicles.find(v => v.id === repair.vehicleId);
    return vehicle?.customerId === customer.id;
  });

  // Debug: Afficher les véhicules du client dans la console
  useEffect(() => {
    console.log('Customer vehicles for', customer.firstName, customer.lastName, ':', customerVehicles);
    console.log('All vehicles:', vehicles);
    console.log('Customer ID:', customer.id);
  }, [customerVehicles, vehicles, customer]);

  // Calculer les statistiques
  const totalInvoices = customerInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalPaid = customerInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const unpaidAmount = totalInvoices - totalPaid;
  const activeRepairs = customerRepairs.filter(repair => repair.status === 'en_cours').length;

  const getPaymentStatusBadge = (invoice: Invoice) => {
    const paidAmount = invoice.paidAmount;
    
    if (paidAmount >= invoice.totalAmount) {
      return <Badge className="bg-accent text-accent-foreground">Payé</Badge>;
    } else if (paidAmount > 0) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Partiel</Badge>;
    } else {
      return <Badge variant="destructive">Impayé</Badge>;
    }
  };

  const getRepairStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>;
      case 'en_cours':
        return <Badge className="bg-primary text-primary-foreground">En cours</Badge>;
      case 'termine':
        return <Badge className="bg-accent text-accent-foreground">Terminé</Badge>;
      case 'annule':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            {customer.firstName} {customer.lastName}
          </h1>
          <div className="flex items-center gap-6 mt-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Envelope className="w-4 h-4" />
              {customer.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {customer.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {customer.city}
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Gear className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="vehicles">Véhicules ({customerVehicles.length})</TabsTrigger>
          <TabsTrigger value="invoices">Factures ({customerInvoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Règlements ({customerPayments.length})</TabsTrigger>
          <TabsTrigger value="repairs">Réparations ({customerRepairs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Véhicules</p>
                    <p className="text-2xl font-bold">{customerVehicles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <CurrencyEur className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total facturé</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalInvoices, settings.currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total payé</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPaid, settings.currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${unpaidAmount > 0 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
                    {unpaidAmount > 0 ? 
                      <XCircle className="w-6 h-6 text-destructive" /> : 
                      <CheckCircle className="w-6 h-6 text-accent" />
                    }
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impayé</p>
                    <p className={`text-2xl font-bold ${unpaidAmount > 0 ? 'text-destructive' : 'text-accent'}`}>
                      {formatCurrency(unpaidAmount, settings.currency)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Envelope className="w-4 h-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Adresse</h4>
                <div className="space-y-2">
                  <div>{customer.address}</div>
                  <div>{customer.city} {customer.postalCode}</div>
                </div>
              </div>
              {customer.notes && (
                <div className="col-span-2">
                  <h4 className="font-semibold mb-3">Notes</h4>
                  <p className="text-muted-foreground">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerRepairs.slice(0, 5).map((repair) => {
                  const vehicle = vehicles.find(v => v.id === repair.vehicleId);
                  return (
                    <div key={repair.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Réparation - {vehicle?.brand} {vehicle?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {repair.title} • {new Date(repair.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getRepairStatusBadge(repair.status)}
                    </div>
                  );
                })}
                {customerRepairs.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune activité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <div className="space-y-4">
            {/* Debug info */}
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p><strong>Debug:</strong> Client ID: {customer.id}</p>
              <p><strong>Total véhicules:</strong> {vehicles.length}</p>
              <p><strong>Véhicules du client:</strong> {customerVehicles.length}</p>
              <p><strong>IDs des véhicules du client:</strong> {customerVehicles.map(v => v.id).join(', ')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customerVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Car className="w-6 h-6 text-primary" />
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Année:</span>
                        <div className="font-medium">{vehicle.year}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Immatriculation:</span>
                        <div className="font-medium">{vehicle.licensePlate}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">VIN:</span>
                        <div className="font-medium text-xs">{vehicle.vin}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Couleur:</span>
                        <div className="font-medium">{vehicle.color}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant="outline">
                        {customerRepairs.filter(r => r.vehicleId === vehicle.id).length} réparation(s)
                      </Badge>
                      <Button size="sm" variant="outline">
                        Voir détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {customerVehicles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun véhicule enregistré</h3>
                <p>Ce client n'a pas encore de véhicule dans le système.</p>
                <div className="mt-4 text-sm bg-muted/50 p-4 rounded-lg">
                  <p><strong>Debug:</strong> {vehicles.length} véhicules total, 0 pour ce client (ID: {customer.id})</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="space-y-4">
            {customerInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Facture #{invoice.invoiceNumber}</p>
                        <p className="text-muted-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(invoice.totalAmount, settings.currency)}</p>
                        {getPaymentStatusBadge(invoice)}
                      </div>
                      <Button variant="outline">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {customerInvoices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucune facture</h3>
                <p>Ce client n'a pas encore de facture.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-4">
            {customerPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <CreditCard className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Règlement #{payment.id.slice(-6)}</p>
                        <p className="text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">{formatCurrency(payment.amount, settings.currency)}</p>
                      {payment.invoiceId && (
                        <p className="text-sm text-muted-foreground">
                          Facture #{customerInvoices.find(i => i.id === payment.invoiceId)?.invoiceNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {customerPayments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun règlement</h3>
                <p>Ce client n'a pas encore effectué de règlement.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="repairs">
          <div className="space-y-4">
            {customerRepairs.map((repair) => {
              const vehicle = vehicles.find(v => v.id === repair.vehicleId);
              return (
                <Card key={repair.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Gear className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{repair.title}</p>
                          <p className="text-muted-foreground">
                            {vehicle?.brand} {vehicle?.model} • {new Date(repair.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency((repair.actualCost || repair.estimatedCost), settings.currency)}</p>
                          {getRepairStatusBadge(repair.status)}
                        </div>
                        <Button variant="outline">
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {customerRepairs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Gear className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucune réparation</h3>
                <p>Ce client n'a pas encore de réparation enregistrée.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}