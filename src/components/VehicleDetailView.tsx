import { useKV } from '@/lib/spark-mocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  ArrowLeft,
  User,
  Calendar,
  Wrench,
  CurrencyEur,
  Camera,
  File as FileText,
  Clock,
  Gear,
  TrendUp,
  Warning,
  CheckCircle,
  Phone,
  Envelope,
  MapPin
} from '@phosphor-icons/react';
import { Vehicle, Customer, Repair, Invoice, VehiclePhoto, Appointment, Payment } from '@/entities';
import VehiclePhotoGallery from './VehiclePhotoGallery';
import { useState } from 'react';
import { useAppGear, formatCurrency } from '../hooks/useAppSettings';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailView({ vehicle, onClose }: VehicleDetailViewProps) {
  const settings = useAppSettings();
  const [customers] = useKV<Customer[]>('customers', []);
  const [repairs] = useKV<Repair[]>('repairs', []);
  const [invoices] = useKV<Invoice[]>('invoices', []);
  const [photos] = useKV<VehiclePhoto[]>('vehicle-photos', []);
  const [appointments] = useKV<Appointment[]>('appointments', []);
  const [payments] = useKV<Payment[]>('payments', []);
  const [viewingGallery, setViewingGallery] = useState(false);

  // Données liées au véhicule
  const customer = customers.find(c => c.id === vehicle.customerId);
  const vehicleRepairs = repairs.filter(r => r.vehicleId === vehicle.id);
  const vehicleInvoices = invoices.filter(i => 
    vehicleRepairs.some(r => r.id === i.repairId)
  );
  const vehiclePhotos = photos.filter(p => p.vehicleId === vehicle.id);
  const vehicleAppointments = appointments.filter(a => a.vehicleId === vehicle.id);
  
  // Calculs statistiques
  const totalRepairs = vehicleRepairs.length;
  const activeRepairs = vehicleRepairs.filter(r => r.status === 'en_cours').length;
  const completedRepairs = vehicleRepairs.filter(r => r.status === 'termine').length;
  const totalSpent = vehicleInvoices
    .filter(i => i.status === 'payee')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const pendingAmount = vehicleInvoices
    .filter(i => i.status === 'envoyee')
    .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);

  const getFuelTypeIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'essence': return '⛽';
      case 'diesel': return '🛢️';
      case 'hybride': return '🔋';
      case 'electrique': return '⚡';
      default: return '⛽';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'termine': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'annule': return 'bg-red-100 text-red-800';
      case 'payee': return 'bg-green-100 text-green-800';
      case 'envoyee': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_cours': return <Clock className="w-4 h-4" />;
      case 'termine': return <CheckCircle className="w-4 h-4" />;
      case 'en_attente': return <Warning className="w-4 h-4" />;
      default: return <Gear className="w-4 h-4" />;
    }
  };

  if (viewingGallery) {
    return (
      <VehiclePhotoGallery 
        vehicle={vehicle} 
        onClose={() => setViewingGallery(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </h1>
            <p className="text-sm text-muted-foreground">
              Plaque: {vehicle.licensePlate} • VIN: {vehicle.vin || 'Non renseigné'}
            </p>
          </div>
        </div>
        <Button onClick={() => setViewingGallery(true)}>
          <Camera className="w-4 h-4 mr-2" />
          Galerie ({vehiclePhotos.length})
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Réparations</p>
                <p className="text-2xl font-bold">{totalRepairs}</p>
              </div>
              <Wrench className="w-8 h-8 text-primary/70" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-blue-600">{activeRepairs}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total dépensé</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSpent, settings.currency)}</p>
              </div>
              <CurrencyEur className="w-8 h-8 text-green-600/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount, settings.currency)}</p>
              </div>
              <Warning className="w-8 h-8 text-orange-600/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="repairs">Réparations</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="invoices">Facturation</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations véhicule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Informations véhicule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marque</p>
                    <p className="font-medium">{vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modèle</p>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Année</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carburant</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {getFuelTypeIcon(vehicle.fuelType)} {vehicle.fuelType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilométrage</p>
                    <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                  </div>
                  {vehicle.color && (
                    <div>
                      <p className="text-sm text-muted-foreground">Couleur</p>
                      <p className="font-medium">{vehicle.color}</p>
                    </div>
                  )}
                </div>
                {vehicle.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1">{vehicle.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations propriétaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-lg">
                        {customer.firstName} {customer.lastName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Envelope className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <div>{customer.address}</div>
                          <div>{customer.postalCode} {customer.city}</div>
                        </div>
                      </div>
                    </div>
                    {customer.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Notes client</p>
                        <p className="text-sm mt-1">{customer.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Client non trouvé</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dernières activités */}
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicleRepairs.slice(0, 5).map(repair => (
                  <div key={repair.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {getStatusIcon(repair.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{repair.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(repair.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(repair.status)}`}>
                      {repair.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {vehicleRepairs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune réparation enregistrée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des réparations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicleRepairs.map(repair => (
                  <div key={repair.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{repair.title}</h3>
                        <p className="text-sm text-muted-foreground">{repair.description}</p>
                      </div>
                      <Badge className={getStatusColor(repair.status)}>
                        {repair.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Coût estimé</p>
                        <p className="font-medium">{formatCurrency(repair.estimatedCost, settings.currency)}</p>
                      </div>
                      {repair.actualCost && (
                        <div>
                          <p className="text-muted-foreground">Coût réel</p>
                          <p className="font-medium">{formatCurrency(repair.actualCost, settings.currency)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Date début</p>
                        <p className="font-medium">
                          {repair.startDate ? new Date(repair.startDate).toLocaleDateString() : 'Non définie'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date fin</p>
                        <p className="font-medium">
                          {repair.endDate ? new Date(repair.endDate).toLocaleDateString() : 'En cours'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {vehicleRepairs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune réparation enregistrée pour ce véhicule
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicleAppointments.map(appointment => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{appointment.title}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.description}</p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date & heure</p>
                        <p className="font-medium">
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-medium">{appointment.duration} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{appointment.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {vehicleAppointments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun rendez-vous programmé pour ce véhicule
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facturation et paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicleInvoices.map(invoice => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">Facture #{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Émise le {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Montant HT</p>
                        <p className="font-medium">{formatCurrency(invoice.subtotal, settings.currency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">TVA</p>
                        <p className="font-medium">{formatCurrency(invoice.taxAmount, settings.currency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total TTC</p>
                        <p className="font-medium">{formatCurrency(invoice.totalAmount, settings.currency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payé</p>
                        <p className="font-medium">{formatCurrency(invoice.paidAmount, settings.currency)}</p>
                      </div>
                    </div>
                    {invoice.paymentDate && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-green-600">
                          Payé le {new Date(invoice.paymentDate).toLocaleDateString()} 
                          ({invoice.paymentMethod})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {vehicleInvoices.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune facture pour ce véhicule
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Galerie photos</span>
                <Button onClick={() => setViewingGallery(true)}>
                  Voir toutes les photos
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclePhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehiclePhotos.slice(0, 8).map(photo => (
                    <div key={photo.id} className="relative group cursor-pointer">
                      <img
                        src={photo.imageData}
                        alt={photo.description || 'Photo véhicule'}
                        className="w-full h-24 object-cover rounded-lg"
                        onClick={() => setViewingGallery(true)}
                      />
                      <Badge className="absolute top-1 left-1 text-xs">
                        {photo.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune photo ajoutée</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setViewingGallery(true)}
                  >
                    Ajouter des photos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}