import { useKV } from '../hooks/useKV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  MagnifyingGlass, 
  CurrencyEur, 
  File as FileText,
  PaperPlaneTilt,
  Eye,
  Download,
  CheckCircle,
  Clock,
  WarningCircle
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useAppSettings, formatCurrency, calculateTax, calculateTotalWithTax } from '../hooks/useAppSettings';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  vehicleModel: string;
  plateNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paidDate?: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useKV<Invoice[]>('invoices', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFunnel, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const settings = useAppSettings();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesMagnifyingGlass = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesMagnifyingGlass && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <PaperPlaneTilt className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <WarningCircle className="w-4 h-4" />;
      case 'cancelled': return <WarningCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyée';
      case 'paid': return 'Payée';
      case 'overdue': return 'En retard';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const updateInvoiceStatus = (invoiceId: string, newStatus: string, paymentMethod?: string) => {
    setInvoices(current =>
      current.map(invoice =>
        invoice.id === invoiceId
          ? { 
              ...invoice, 
              status: newStatus as Invoice['status'],
              paymentMethod: newStatus === 'paid' ? paymentMethod : invoice.paymentMethod,
              paidDate: newStatus === 'paid' ? new Date().toISOString() : invoice.paidDate
            }
          : invoice
      )
    );
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion de la Facturation</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle facture</DialogTitle>
            </DialogHeader>
            <CreateInvoiceForm onAdd={(invoice) => {
              setInvoices(current => [...current, invoice]);
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chiffre d'Affaires
            </CardTitle>
            <CurrencyEur className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalRevenue, settings.currency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
            <Clock className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(pendingAmount, settings.currency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures en Retard
            </CardTitle>
            <WarningCircle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Factures
            </CardTitle>
            <FileText className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro, client ou véhicule..."
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
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead>Date d'émission</TableHead>
                <TableHead>Date d'échéance</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.clientName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.clientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.vehicleModel}</div>
                      <div className="text-sm text-muted-foreground">{invoice.plateNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <span className={invoice.status === 'overdue' ? 'text-destructive font-medium' : ''}>
                      {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total, settings.currency)}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(invoice.status)}
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Simulate PDF download
                          console.log('Télécharger PDF pour facture:', invoice.invoiceNumber);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Marquer payée
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Marquer comme payée</DialogTitle>
                            </DialogHeader>
                            <PaymentForm
                              invoice={invoice}
                              onPayment={(paymentMethod) => {
                                updateInvoiceStatus(invoice.id, 'paid', paymentMethod);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Facture {selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <InvoiceDetail invoice={selectedInvoice} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const CreateInvoiceForm = ({ onAdd }: { onAdd: (invoice: Invoice) => void }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    vehicleModel: '',
    plateNumber: '',
    dueDate: '',
    notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const [taxRate] = useState(20); // TVA 20%

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceNumber = `FACT-${Date.now().toString().slice(-6)}`;
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber,
      ...formData,
      issueDate: new Date().toISOString(),
      items: items.filter(item => item.description && item.quantity > 0),
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft'
    };

    onAdd(newInvoice);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informations client</h3>
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
          <Label htmlFor="clientAddress">Adresse</Label>
          <Textarea
            id="clientAddress"
            value={formData.clientAddress}
            onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
            placeholder="Adresse complète du client"
            required
          />
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informations véhicule</h3>
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
      </div>

      {/* Invoice Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Articles et services</h3>
          <Button type="button" onClick={addItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter ligne
          </Button>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input
                  id={`description-${index}`}
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description du service ou pièce"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`quantity-${index}`}>Quantité</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  min="1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`unitPrice-${index}`}>Prix unitaire</Label>
                <Input
                  id={`unitPrice-${index}`}
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <Label>Total</Label>
                <Input
                  value={item.total.toFixed(2)}
                  disabled
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Totals */}
      <div className="border-t pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{formatCurrency(subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({taxRate}%):</span>
              <span>{formatCurrency(taxAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total, settings.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="dueDate">Date d'échéance</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Notes ou conditions particulières"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Créer la facture</Button>
      </div>
    </form>
  );
};

const PaymentForm = ({ 
  invoice, 
  onPayment 
}: { 
  invoice: Invoice;
  onPayment: (paymentMethod: string) => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPayment(paymentMethod);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">Montant à encaisser</div>
        <div className="text-2xl font-bold">{formatCurrency(invoice.total, settings.currency)}</div>
      </div>

      <div>
        <Label htmlFor="paymentMethod">Mode de paiement</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Espèces</SelectItem>
            <SelectItem value="card">Carte bancaire</SelectItem>
            <SelectItem value="check">Chèque</SelectItem>
            <SelectItem value="transfer">Virement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={!paymentMethod}>
          Confirmer le paiement
        </Button>
      </div>
    </form>
  );
};

const InvoiceDetail = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-2xl font-bold">GARAGE MOHAMMED</h1>
        <p className="text-muted-foreground">Larache - Maroc</p>
        <p className="text-sm text-muted-foreground mt-2">
          Facture N° {invoice.invoiceNumber}
        </p>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Facturé à:</h3>
          <div className="space-y-1 text-sm">
            <div className="font-medium">{invoice.clientName}</div>
            <div className="text-muted-foreground">{invoice.clientAddress}</div>
            <div className="text-muted-foreground">{invoice.clientPhone}</div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Informations facture:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date d'émission:</span>
              <span>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date d'échéance:</span>
              <span>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Véhicule:</span>
              <span>{invoice.vehicleModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plaque:</span>
              <span>{invoice.plateNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice, settings.currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total, settings.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="border-t pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{formatCurrency(invoice.subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total, settings.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status and Payment Info */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge className={getStatusColor(invoice.status)}>
              {getStatusLabel(invoice.status)}
            </Badge>
          </div>
          {invoice.status === 'paid' && (
            <div className="text-sm text-muted-foreground">
              Payé le {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString('fr-FR') : ''} 
              {invoice.paymentMethod && ` par ${invoice.paymentMethod}`}
            </div>
          )}
        </div>
        {invoice.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">Notes:</div>
            <div className="text-sm text-muted-foreground">{invoice.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft': return 'Brouillon';
    case 'sent': return 'Envoyée';
    case 'paid': return 'Payée';
    case 'overdue': return 'En retard';
    case 'cancelled': return 'Annulée';
    default: return 'Inconnu';
  }
}

export default InvoiceManagement;