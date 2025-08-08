import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Cloud, 
  CloudCheck, 
  CloudX, 
  Download, 
  Upload, 
  ArrowClockwise as RefreshCw, 
  ClockCounterClockwise as History,
  WarningCircle,
  CheckCircle,
  Clock,
  Desktop as Server,
  Database,
  FileText
} from '@phosphor-icons/react';
import { useCloudSync } from '../hooks/useCloudSync';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CloudSyncSettings() {
  const { 
    status, 
    isLoading, 
    toggleSync, 
    performManualSync, 
    restoreFromCloud, 
    exportData, 
    importData,
    refreshStatus 
  } = useCloudSync();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importData(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getSyncStatusIcon = () => {
    if (status.syncInProgress) {
      return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
    }
    if (status.error) {
      return <CloudX className="w-5 h-5 text-destructive" />;
    }
    if (status.isEnabled && status.lastSync) {
      return <CloudCheck className="w-5 h-5 text-accent" />;
    }
    return <Cloud className="w-5 h-5 text-muted-foreground" />;
  };

  const getSyncStatusText = () => {
    if (status.syncInProgress) {
      return 'Synchronisation en cours...';
    }
    if (status.error) {
      return `Erreur: ${status.error}`;
    }
    if (status.isEnabled && status.lastSync) {
      return `Dernière sync: ${formatDistanceToNow(status.lastSync, { 
        addSuffix: true, 
        locale: fr 
      })}`;
    }
    if (status.isEnabled) {
      return 'En attente de synchronisation...';
    }
    return 'Synchronisation désactivée';
  };

  const getSyncStatusVariant = () => {
    if (status.syncInProgress) return 'secondary';
    if (status.error) return 'destructive';
    if (status.isEnabled && status.lastSync) return 'default';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Synchronisation Cloud</h2>
        <p className="text-muted-foreground">
          Sauvegarde automatique de vos données vers le cloud Netlify
        </p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getSyncStatusIcon()}
            État de la synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sync-toggle">Synchronisation automatique</Label>
              <p className="text-sm text-muted-foreground">
                Sauvegarder automatiquement toutes les 5 minutes
              </p>
            </div>
            <Switch
              id="sync-toggle"
              checked={status.isEnabled}
              onCheckedChange={toggleSync}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <Badge variant={getSyncStatusVariant()} className="flex items-center gap-2">
                {getSyncStatusIcon()}
                {status.isEnabled ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total des enregistrements</p>
              <p className="text-lg font-semibold text-foreground">{status.totalRecords}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Synchronisés</p>
              <p className="text-lg font-semibold text-foreground">{status.syncedRecords}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dernière sync</p>
              <p className="text-sm text-foreground">
                {status.lastSync ? formatDistanceToNow(status.lastSync, { 
                  addSuffix: true, 
                  locale: fr 
                }) : 'Jamais'}
              </p>
            </div>
          </div>

          {status.error && (
            <Alert variant="destructive">
              <WarningCircle className="w-4 h-4" />
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}

          {status.isEnabled && !status.error && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Synchronisation active. Vos données sont automatiquement sauvegardées.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Manual Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Server className="w-5 h-5" />
            Actions manuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={performManualSync}
              disabled={isLoading || status.syncInProgress}
              className="flex items-center gap-2"
            >
              {status.syncInProgress ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Synchroniser maintenant
            </Button>

            <Button
              variant="outline"
              onClick={restoreFromCloud}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Restaurer du cloud
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="w-5 h-5" />
            Sauvegarde manuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={exportData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter les données
              </Button>

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full"
                >
                  <Upload className="w-4 h-4" />
                  Importer les données
                </Button>
              </div>
            </div>

            <Alert>
              <FileText className="w-4 h-4" />
              <AlertDescription>
                L'export crée un fichier JSON contenant toutes vos données. 
                L'import remplace complètement les données actuelles.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Gear */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <History className="w-5 h-5" />
            Paramètres avancés
            <Badge variant="outline" className="ml-auto">
              {showAdvanced ? 'Masquer' : 'Afficher'}
            </Badge>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endpoint de sauvegarde</Label>
                  <Input 
                    value="/.netlify/functions/backup-data" 
                    disabled 
                    className="font-mono text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Intervalle de synchronisation</Label>
                  <Input 
                    value="5 minutes" 
                    disabled 
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshStatus}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser le statut
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Dernière vérification: {new Date().toLocaleTimeString('fr-FR')}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}