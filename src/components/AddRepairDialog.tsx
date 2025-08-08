import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useAppGear } from '../hooks/useAppSettings';

interface Repair {
  id: string;
  vehicleModel: string;
  plateNumber: string;
  clientName: string;
  clientPhone: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  estimatedCost: number;
  actualCost?: number;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  mechanic: string;
  priority: 'low' | 'medium' | 'high';
}

interface AddRepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (repair: Repair) => void;
}

const AddRepairDialog = ({ open, onOpenChange, onAdd }: AddRepairDialogProps) => {
  const settings = useAppSettings();
  const [formData, setFormData] = useState({
    vehicleModel: '',
    plateNumber: '',
    clientName: '',
    clientPhone: '',
    description: '',
    estimatedCost: '',
    estimatedEndDate: '',
    mechanic: '',
    priority: 'medium' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRepair: Repair = {
      id: Date.now().toString(),
      ...formData,
      estimatedCost: Number(formData.estimatedCost),
      status: 'pending',
      startDate: new Date().toISOString()
    };

    onAdd(newRepair);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      vehicleModel: '',
      plateNumber: '',
      clientName: '',
      clientPhone: '',
      description: '',
      estimatedCost: '',
      estimatedEndDate: '',
      mechanic: '',
      priority: 'medium'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle réparation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="description">Description du problème</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez le problème ou la réparation nécessaire..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimatedCost">Coût estimé ({settings.currency.symbol})</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="estimatedEndDate">Date de fin estimée</Label>
              <Input
                id="estimatedEndDate"
                type="date"
                value={formData.estimatedEndDate}
                onChange={(e) => setFormData({...formData, estimatedEndDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as 'low' | 'medium' | 'high'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mechanic">Mécanicien assigné</Label>
            <Select value={formData.mechanic} onValueChange={(value) => setFormData({...formData, mechanic: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un mécanicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mohammed">Mohammed</SelectItem>
                <SelectItem value="hassan">Hassan</SelectItem>
                <SelectItem value="omar">Omar</SelectItem>
                <SelectItem value="youssef">Youssef</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter la réparation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRepairDialog;