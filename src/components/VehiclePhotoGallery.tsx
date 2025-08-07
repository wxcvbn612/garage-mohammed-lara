import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Plus, 
  Trash,
  Eye,
  Download,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  ImageSquare
} from '@phosphor-icons/react';
import { useState, useRef, useEffect } from 'react';
import { VehiclePhoto, Vehicle, Repair } from '@/entities';
import { toast } from 'sonner';

interface VehiclePhotoGalleryProps {
  vehicle: Vehicle;
  onClose: () => void;
  onPhotoAdded?: () => void;
}

export default function VehiclePhotoGallery({ vehicle, onClose, onPhotoAdded }: VehiclePhotoGalleryProps) {
  const [photos, setPhotos] = useKV<VehiclePhoto[]>('vehicle-photos', []);
  const [repairs] = useKV<Repair[]>('repairs', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewingPhoto, setViewingPhoto] = useState<VehiclePhoto | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPhoto, setNewPhoto] = useState<Partial<VehiclePhoto>>({
    vehicleId: vehicle.id,
    category: 'general',
    description: '',
    repairId: ''
  });

  // Rafraîchir les photos lors de l'ouverture de la galerie
  useEffect(() => {
    const refreshPhotos = async () => {
      try {
        const currentPhotos = await spark.kv.get<VehiclePhoto[]>('vehicle-photos') || [];
        setPhotos(currentPhotos);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des photos:', error);
      }
    };
    
    refreshPhotos();
  }, [setPhotos]);

  // Filtrer les photos du véhicule actuel
  const vehiclePhotos = photos.filter(photo => photo.vehicleId === vehicle.id);
  
  const filteredPhotos = vehiclePhotos.filter(photo => {
    if (selectedCategory === 'all') return true;
    return photo.category === selectedCategory;
  });

  // Obtenir les réparations liées au véhicule
  const vehicleRepairs = repairs.filter(repair => repair.vehicleId === vehicle.id);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Convertir en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setNewPhoto(prev => ({
        ...prev,
        imageData: base64Data,
        imageUrl: base64Data,
        fileName: file.name,
        fileSize: file.size
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = () => {
    if (!newPhoto.imageData || !newPhoto.category) {
      toast.error('Veuillez sélectionner une image et une catégorie');
      return;
    }

    const photo: VehiclePhoto = {
      id: Date.now().toString(),
      vehicleId: vehicle.id,
      imageUrl: newPhoto.imageData!,
      imageData: newPhoto.imageData!,
      fileName: newPhoto.fileName || 'photo.jpg',
      fileSize: newPhoto.fileSize || 0,
      category: newPhoto.category as VehiclePhoto['category'],
      description: newPhoto.description,
      repairId: newPhoto.repairId || undefined,
      captureDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPhotos(current => [...current, photo]);
    
    // Réinitialiser le formulaire
    setNewPhoto({
      vehicleId: vehicle.id,
      category: 'general',
      description: '',
      repairId: ''
    });
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsAddDialogOpen(false);
    toast.success('Photo ajoutée avec succès');
    
    // Notifier le parent qu'une photo a été ajoutée
    if (onPhotoAdded) {
      onPhotoAdded();
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(current => current.filter(p => p.id !== photoId));
    toast.success('Photo supprimée');
    
    // Notifier le parent qu'une photo a été supprimée
    if (onPhotoAdded) {
      onPhotoAdded();
    }
  };

  const handleViewPhoto = (photo: VehiclePhoto) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
    setViewingPhoto(photo);
    setViewingIndex(index);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!viewingPhoto) return;
    
    let newIndex = viewingIndex;
    if (direction === 'prev') {
      newIndex = viewingIndex > 0 ? viewingIndex - 1 : filteredPhotos.length - 1;
    } else {
      newIndex = viewingIndex < filteredPhotos.length - 1 ? viewingIndex + 1 : 0;
    }
    
    setViewingPhoto(filteredPhotos[newIndex]);
    setViewingIndex(newIndex);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'avant': return 'État avant';
      case 'pendant': return 'En cours de réparation';
      case 'apres': return 'État après';
      case 'general': return 'Photos générales';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'avant': return 'bg-orange-100 text-orange-800';
      case 'pendant': return 'bg-blue-100 text-blue-800';
      case 'apres': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadPhoto = (photo: VehiclePhoto) => {
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = photo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Galerie Photo - {vehicle.brand} {vehicle.model}
            </h2>
            <p className="text-sm text-muted-foreground">
              Plaque: {vehicle.licensePlate} • {vehiclePhotos.length} photo(s)
            </p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sélectionner une image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir un fichier
                  </Button>
                </div>
                {newPhoto.fileName && (
                  <p className="text-sm text-muted-foreground">
                    Fichier sélectionné: {newPhoto.fileName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select 
                  value={newPhoto.category} 
                  onValueChange={(value) => setNewPhoto(prev => ({ ...prev, category: value as VehiclePhoto['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avant">État avant réparation</SelectItem>
                    <SelectItem value="pendant">En cours de réparation</SelectItem>
                    <SelectItem value="apres">État après réparation</SelectItem>
                    <SelectItem value="general">Photo générale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {vehicleRepairs.length > 0 && (
                <div className="space-y-2">
                  <Label>Réparation associée (optionnel)</Label>
                  <Select 
                    value={newPhoto.repairId} 
                    onValueChange={(value) => setNewPhoto(prev => ({ ...prev, repairId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune réparation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune réparation</SelectItem>
                      {vehicleRepairs.map(repair => (
                        <SelectItem key={repair.id} value={repair.id}>
                          {repair.title} ({repair.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la photo..."
                  rows={3}
                />
              </div>

              {newPhoto.imageData && (
                <div className="space-y-2">
                  <Label>Aperçu</Label>
                  <div className="border rounded-lg p-2">
                    <img
                      src={newPhoto.imageData}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddPhoto}>
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="category-filter">Filtrer par catégorie:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les photos</SelectItem>
                <SelectItem value="avant">État avant</SelectItem>
                <SelectItem value="pendant">En cours</SelectItem>
                <SelectItem value="apres">État après</SelectItem>
                <SelectItem value="general">Générales</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredPhotos.length} photo(s) affichée(s)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Galerie de photos */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => {
            const repair = photo.repairId ? repairs.find(r => r.id === photo.repairId) : null;
            return (
              <Card key={photo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={photo.imageData}
                    alt={photo.description || 'Photo véhicule'}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleViewPhoto(photo)}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`text-xs ${getCategoryColor(photo.category)}`}>
                      {getCategoryLabel(photo.category)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleViewPhoto(photo)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => downloadPhoto(photo)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {photo.description && (
                      <p className="text-sm text-foreground">{photo.description}</p>
                    )}
                    {repair && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Réparation:</span>
                        <Badge variant="outline" className="text-xs">
                          {repair.title}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(photo.captureDate).toLocaleDateString()}</span>
                      <span>{(photo.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucune photo trouvée
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedCategory === 'all' 
                ? 'Aucune photo n\'a été ajoutée pour ce véhicule.'
                : `Aucune photo dans la catégorie "${getCategoryLabel(selectedCategory)}".`
              }
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter la première photo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Viewer de photo */}
      {viewingPhoto && (
        <Dialog open={true} onOpenChange={() => setViewingPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadPhoto(viewingPhoto)}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingPhoto(null)}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {filteredPhotos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigatePhoto('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigatePhoto('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              <img
                src={viewingPhoto.imageData}
                alt={viewingPhoto.description || 'Photo véhicule'}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              <div className="p-6 bg-background">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getCategoryColor(viewingPhoto.category)}`}>
                        {getCategoryLabel(viewingPhoto.category)}
                      </Badge>
                      {filteredPhotos.length > 1 && (
                        <span className="text-sm text-muted-foreground">
                          {viewingIndex + 1} / {filteredPhotos.length}
                        </span>
                      )}
                    </div>
                    {viewingPhoto.description && (
                      <p className="text-sm text-foreground">{viewingPhoto.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Prise le {new Date(viewingPhoto.captureDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}