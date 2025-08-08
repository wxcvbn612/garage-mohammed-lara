import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Euro, 
  Calendar,
  FileText,
  CreditCard,
  ArrowLeft,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from '@phosphor-icons/react';
import { Customer, Vehicle, Invoice, Payment, Repair } from '@/entities';
import { useKV } from '@github/spark/hooks';
import { useAppSettings, formatCurrency } from '../hooks/useAppSettings';

interface CustomerDetailViewProps {
  customer: Customer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerDetailView({ customer, isOpen, onOpenChange }: CustomerDetailViewProps) {
  const settings = useAppSettings();
  const [vehicles] = useKV<Vehicle[]>('vehicles', []);
  const [invoices] = useKV<Invoice[]>('invoices', []);
  const [payments] = useKV<Payment[]>('payments', []);
  const [repairs] = useKV<Repair[]>('repairs', []);
  const [activeTab, setActiveTab] = useState('overview');

  if (!customer) return null;

  // Filtrer les données du client
  const customerVehicles = vehicles.filter(vehicle => vehicle.customerId === customer.id);
  const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
  const customerPayments = payments.filter(payment => payment.customerId === customer.id);
  const customerRepairs = repairs.filter(repair => {
    const vehicle = vehicles.find(v => v.id === repair.vehicleId);
    return vehicle?.customerId === customer.id;
  });

  // Calculer les statistiques
  const totalInvoices = customerInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const unpaidAmount = totalInvoices - totalPaid;
  const activeRepairs = customerRepairs.filter(repair => repair.status === 'in-progress').length;

  const getPaymentStatusBadge = (invoice: Invoice) => {
    const paidAmount = customerPayments
      .filter(payment => payment.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    if (paidAmount >= invoice.total) {
      return <Badge className="bg-accent text-accent-foreground">Payé</Badge>;
    } else if (paidAmount > 0) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Partiel</Badge>;
    } else {
      return <Badge variant="destructive">Impayé</Badge>;
    }
  };

  const getRepairStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary text-primary-foreground">En cours</Badge>;
      case 'completed':
        return <Badge className="bg-accent text-accent-foreground">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                {customer.firstName} {customer.lastName}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {customer.city}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="vehicles">Véhicules ({customerVehicles.length})</TabsTrigger>
              <TabsTrigger value="invoices">Factures ({customerInvoices.length})</TabsTrigger>
              <TabsTrigger value="payments">Règlements ({customerPayments.length})</TabsTrigger>
              <TabsTrigger value="repairs">Réparations ({customerRepairs.length})</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[calc(100%-3rem)] overflow-auto">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Car className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Véhicules</p>
                          <p className="text-xl font-bold">{customerVehicles.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Euro className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total facturé</p>
                          <p className="text-xl font-bold">{formatCurrency(totalInvoices, settings.currency)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total payé</p>
                          <p className="text-xl font-bold">{formatCurrency(totalPaid, settings.currency)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${unpaidAmount > 0 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
                          {unpaidAmount > 0 ? 
                            <XCircle className="w-5 h-5 text-destructive" /> : 
                            <CheckCircle className="w-5 h-5 text-accent" />
                          }
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Impayé</p>
                          <p className={`text-xl font-bold ${unpaidAmount > 0 ? 'text-destructive' : 'text-accent'}`}>
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
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact</h4>
                      <div className="space-y-2 text-sm">
                        <div>Email: {customer.email}</div>
                        <div>Téléphone: {customer.phone}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Adresse</h4>
                      <div className="space-y-1 text-sm">
                        <div>{customer.address}</div>
                        <div>{customer.city} {customer.postalCode}</div>
                      </div>
                    </div>
                    {customer.notes && (
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{customer.notes}</p>
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
                    <div className="space-y-3">
                      {customerRepairs.slice(0, 5).map((repair) => {
                        const vehicle = vehicles.find(v => v.id === repair.vehicleId);
                        return (
                          <div key={repair.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Réparation - {vehicle?.brand} {vehicle?.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {repair.description} • {new Date(repair.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {getRepairStatusBadge(repair.status)}
                          </div>
                        );
                      })}
                      {customerRepairs.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Aucune activité récente
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerVehicles.map((vehicle) => (
                    <Card key={vehicle.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-primary" />
                          {vehicle.brand} {vehicle.model}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Année: {vehicle.year}</div>
                          <div>Immatriculation: {vehicle.licensePlate}</div>
                          <div>VIN: {vehicle.vin}</div>
                          <div>Couleur: {vehicle.color}</div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
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
                  {customerVehicles.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      Aucun véhicule enregistré
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="invoices" className="mt-0">
                <div className="space-y-4">
                  {customerInvoices.map((invoice) => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">Facture #{invoice.number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(invoice.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(invoice.total, settings.currency)}</p>
                              {getPaymentStatusBadge(invoice)}
                            </div>
                            <Button size="sm" variant="outline">
                              Voir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {customerInvoices.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune facture
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <div className="space-y-4">
                  {customerPayments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CreditCard className="w-5 h-5 text-accent" />
                            <div>
                              <p className="font-medium">Règlement #{payment.id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.date).toLocaleDateString()} • {payment.method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent">{formatCurrency(payment.amount, settings.currency)}</p>
                            {payment.invoiceId && (
                              <p className="text-xs text-muted-foreground">
                                Facture #{customerInvoices.find(i => i.id === payment.invoiceId)?.number}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {customerPayments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun règlement
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="repairs" className="mt-0">
                <div className="space-y-4">
                  {customerRepairs.map((repair) => {
                    const vehicle = vehicles.find(v => v.id === repair.vehicleId);
                    return (
                      <Card key={repair.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Settings className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{repair.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle?.brand} {vehicle?.model} • {new Date(repair.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold">{formatCurrency(repair.cost, settings.currency)}</p>
                                {getRepairStatusBadge(repair.status)}
                              </div>
                              <Button size="sm" variant="outline">
                                Voir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {customerRepairs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune réparation
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}