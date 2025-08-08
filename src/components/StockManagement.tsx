import { useKV } from '../hooks/useKV';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  MagnifyingGlass, 
  Package, 
  Warning,
  Truck,
  ChartBar,
  Funnel as Filter
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useAppSettings, formatCurrency } from '../hooks/useAppSettings';

interface StockItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  partNumber: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  description?: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: string;
  userId: string;
  reference?: string;
}

const StockManagement = () => {
  const [stockItems, setStockItems] = useKV<StockItem[]>('stock-items', []);
  const [movements, setMovements] = useKV<StockMovement[]>('stock-movements', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFunnel, setCategoryFilter] = useState<string>('all');
  const [stockLevelFunnel, setStockLevelFilter] = useState<string>('all');
  const settings = useAppSettings();

  const categories = Array.from(new Set(stockItems.map(item => item.category)));
  
  const filteredItems = stockItems.filter(item => {
    const matchesMagnifyingGlass = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesStockLevel = stockLevelFilter === 'all' || 
                             (stockLevelFilter === 'low' && item.currentStock <= item.minStock) ||
                             (stockLevelFilter === 'normal' && item.currentStock > item.minStock && item.currentStock < item.maxStock) ||
                             (stockLevelFilter === 'high' && item.currentStock >= item.maxStock);
    
    return matchesMagnifyingGlass && matchesCategory && matchesStockLevel;
  });

  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minStock);
  const totalValue = stockItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

  const getStockStatus = (item: StockItem) => {
    if (item.currentStock <= item.minStock) return { status: 'low', color: 'bg-red-100 text-red-800' };
    if (item.currentStock >= item.maxStock) return { status: 'high', color: 'bg-blue-100 text-blue-800' };
    return { status: 'normal', color: 'bg-green-100 text-green-800' };
  };

  const updateStock = (itemId: string, quantity: number, type: 'in' | 'out', reason: string) => {
    setStockItems(current =>
      current.map(item =>
        item.id === itemId
          ? { ...item, currentStock: type === 'in' ? item.currentStock + quantity : item.currentStock - quantity }
          : item
      )
    );

    const movement: StockMovement = {
      id: Date.now().toString(),
      itemId,
      type,
      quantity,
      reason,
      date: new Date().toISOString(),
      userId: 'mohammed'
    };

    setMovements(current => [movement, ...current]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Stocks</h2>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Commander
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Passer une commande</DialogTitle>
              </DialogHeader>
              <OrderForm 
                lowStockItems={lowStockItems}
                onOrder={(items) => {
                  console.log('Commande passée:', items);
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel article</DialogTitle>
              </DialogHeader>
              <AddItemForm onAdd={(item) => {
                setStockItems(current => [...current, item]);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Articles
            </CardTitle>
            <Package className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Faible
            </CardTitle>
            <Warning className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur Totale
            </CardTitle>
            <ChartBar className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue, settings.currency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories
            </CardTitle>
            <Filter className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Warning className="w-5 h-5" />
              Alertes Stock Faible ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.partNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-destructive">
                      {item.currentStock} / {item.minStock}
                    </div>
                    <div className="text-xs text-muted-foreground">min requis</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, référence ou marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockLevelFilter} onValueChange={setStockLevelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Niveau de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
                <SelectItem value="high">Stock élevé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire ({filteredItems.length} articles)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock Actuel</TableHead>
                <TableHead>Stock Min/Max</TableHead>
                <TableHead>Prix Unitaire</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.brand} - {item.partNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.currentStock}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.minStock} / {item.maxStock}
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice, settings.currency)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.currentStock * item.unitPrice, settings.currency)}
                    </TableCell>
                    <TableCell className="text-sm">{item.location}</TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color}>
                        {stockStatus.status === 'low' ? 'Faible' :
                         stockStatus.status === 'high' ? 'Élevé' : 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ajuster
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ajuster le stock - {item.name}</DialogTitle>
                            </DialogHeader>
                            <StockAdjustmentForm
                              item={item}
                              onAdjust={(quantity, type, reason) => {
                                updateStock(item.id, quantity, type, reason);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const AddItemForm = ({ onAdd }: { onAdd: (item: StockItem) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    partNumber: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    location: '',
    supplier: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: StockItem = {
      id: Date.now().toString(),
      ...formData,
      currentStock: Number(formData.currentStock),
      minStock: Number(formData.minStock),
      maxStock: Number(formData.maxStock),
      unitPrice: Number(formData.unitPrice),
      lastRestocked: new Date().toISOString()
    };

    onAdd(newItem);
    setFormData({
      name: '',
      category: '',
      brand: '',
      partNumber: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unitPrice: '',
      location: '',
      supplier: '',
      description: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom de l'article</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="ex: Plaquettes de frein avant"
            required
          />
        </div>
        <div>
          <Label htmlFor="partNumber">Référence</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) => setFormData({...formData, partNumber: e.target.value})}
            placeholder="ex: BRK-001-AV"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Freinage">Freinage</SelectItem>
              <SelectItem value="Moteur">Moteur</SelectItem>
              <SelectItem value="Suspension">Suspension</SelectItem>
              <SelectItem value="Électrique">Électrique</SelectItem>
              <SelectItem value="Carrosserie">Carrosserie</SelectItem>
              <SelectItem value="Pneumatiques">Pneumatiques</SelectItem>
              <SelectItem value="Huiles et Fluides">Huiles et Fluides</SelectItem>
              <SelectItem value="Filtres">Filtres</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="brand">Marque</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
            placeholder="ex: Bosch"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="currentStock">Stock actuel</Label>
          <Input
            id="currentStock"
            type="number"
            value={formData.currentStock}
            onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Stock minimum</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({...formData, minStock: e.target.value})}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="maxStock">Stock maximum</Label>
          <Input
            id="maxStock"
            type="number"
            value={formData.maxStock}
            onChange={(e) => setFormData({...formData, maxStock: e.target.value})}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="unitPrice">Prix unitaire ({settings.currency.symbol})</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Emplacement</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="ex: Étagère A-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="supplier">Fournisseur</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            placeholder="ex: AutoParts Maroc"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (optionnel)</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Description détaillée de l'article..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Ajouter l'article</Button>
      </div>
    </form>
  );
};

const StockAdjustmentForm = ({ 
  item, 
  onAdjust 
}: { 
  item: StockItem;
  onAdjust: (quantity: number, type: 'in' | 'out', reason: string) => void;
}) => {
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjust(Number(quantity), type, reason);
    setQuantity('');
    setReason('');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">Stock actuel</div>
        <div className="text-2xl font-bold">{item.currentStock}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Type d'ajustement</Label>
          <Select value={type} onValueChange={(value: 'in' | 'out') => setType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Entrée (+)</SelectItem>
              <SelectItem value="out">Sortie (-)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantité</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div>
          <Label htmlFor="reason">Motif</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un motif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Réception commande">Réception commande</SelectItem>
              <SelectItem value="Retour client">Retour client</SelectItem>
              <SelectItem value="Utilisation réparation">Utilisation réparation</SelectItem>
              <SelectItem value="Vente comptoir">Vente comptoir</SelectItem>
              <SelectItem value="Perte/Casse">Perte/Casse</SelectItem>
              <SelectItem value="Inventaire">Ajustement inventaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {quantity && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Nouveau stock après ajustement</div>
            <div className="text-xl font-bold text-blue-600">
              {type === 'in' 
                ? item.currentStock + Number(quantity)
                : item.currentStock - Number(quantity)
              }
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={!quantity || !reason}>
            Confirmer l'ajustement
          </Button>
        </div>
      </form>
    </div>
  );
};

const OrderForm = ({ 
  lowStockItems, 
  onOrder 
}: { 
  lowStockItems: StockItem[];
  onOrder: (items: { itemId: string; quantity: number }[]) => void;
}) => {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity > 0) {
      setSelectedItems(prev => ({ ...prev, [itemId]: quantity }));
    } else {
      setSelectedItems(prev => {
        const newItems = { ...prev };
        delete newItems[itemId];
        return newItems;
      });
    }
  };

  const handleSubmit = () => {
    const orderItems = Object.entries(selectedItems).map(([itemId, quantity]) => ({
      itemId,
      quantity
    }));
    onOrder(orderItems);
    setSelectedItems({});
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Articles en stock faible nécessitant une commande
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {lowStockItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                Stock: {item.currentStock} / Min: {item.minStock}
              </div>
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Qté"
                value={selectedItems[item.id] || ''}
                onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                min="1"
              />
            </div>
          </div>
        ))}
      </div>

      {Object.keys(selectedItems).length > 0 && (
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">
            Résumé de la commande ({Object.keys(selectedItems).length} articles)
          </div>
          <div className="space-y-1 text-sm text-muted-foreground mb-4">
            {Object.entries(selectedItems).map(([itemId, quantity]) => {
              const item = lowStockItems.find(i => i.id === itemId);
              return (
                <div key={itemId} className="flex justify-between">
                  <span>{item?.name}</span>
                  <span>{quantity} unités</span>
                </div>
              );
            })}
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Passer la commande
          </Button>
        </div>
      )}
    </div>
  );
};

export default StockManagement;