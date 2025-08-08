import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Download, 
  Upload, 
  ArrowClockwise as RefreshCw, 
  HardDrive,
  Users,
  Car,
  Wrench,
  Calendar,
  File as FileText,
  Warning,
  CheckCircle,
  Info
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useDatabaseStats } from '@/hooks/useDatabase';
import { db, DatabaseService } from '@/lib/database';

export default function DatabaseManagement() {
  const { stats, isLoading, refreshStats } = useDatabaseStats();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = {
        customers: await db.customers.toArray(),
        vehicles: await db.vehicles.toArray(),
        repairs: await db.repairs.toArray(),
        appointments: await db.appointments.toArray(),
        invoices: await db.invoices.toArray(),
        users: await db.users.toArray(),
        settings: await db.settings.toArray(),
        keyValue: await db.keyValue.toArray(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `garage-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup exporté avec succès');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.customers || !Array.isArray(data.customers)) {
        throw new Error('Format de fichier invalide');
      }

      // Clear existing data and import
      await db.transaction('rw', [
        db.customers,
        db.vehicles,
        db.repairs,
        db.appointments,
        db.invoices,
        db.users,
        db.settings,
        db.keyValue
      ], async () => {
        // Clear all tables
        await Promise.all([
          db.customers.clear(),
          db.vehicles.clear(),
          db.repairs.clear(),
          db.appointments.clear(),
          db.invoices.clear(),
          db.users.clear(),
          db.settings.clear(),
          db.keyValue.clear()
        ]);

        // Import data
        if (data.customers?.length > 0) {
          await db.customers.bulkAdd(data.customers.map((c: any) => ({ ...c, id: undefined })));
        }
        if (data.vehicles?.length > 0) {
          await db.vehicles.bulkAdd(data.vehicles.map((v: any) => ({ ...v, id: undefined })));
        }
        if (data.repairs?.length > 0) {
          await db.repairs.bulkAdd(data.repairs.map((r: any) => ({ ...r, id: undefined })));
        }
        if (data.appointments?.length > 0) {
          await db.appointments.bulkAdd(data.appointments.map((a: any) => ({ ...a, id: undefined })));
        }
        if (data.invoices?.length > 0) {
          await db.invoices.bulkAdd(data.invoices.map((i: any) => ({ ...i, id: undefined })));
        }
        if (data.users?.length > 0) {
          await db.users.bulkAdd(data.users.map((u: any) => ({ ...u, id: undefined })));
        }
        if (data.settings?.length > 0) {
          await db.settings.bulkAdd(data.settings.map((s: any) => ({ ...s, id: undefined })));
        }
        if (data.keyValue?.length > 0) {
          await db.keyValue.bulkAdd(data.keyValue);
        }
      });

      await refreshStats();
      toast.success('Données importées avec succès');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Erreur lors de l\'import : ' + (error as Error).message);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleForceMigration = async () => {
    setMigrationStatus('running');
    try {
      await db.migrateFromLocalStorage();
      setMigrationStatus('complete');
      await refreshStats();
      toast.success('Migration terminée avec succès');
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('error');
      toast.error('Erreur lors de la migration');
    }
  };

  const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

  const storageItems = [
    { label: 'Clients', count: stats.customers, icon: Users, color: 'text-blue-600' },
    { label: 'Véhicules', count: stats.vehicles, icon: Car, color: 'text-green-600' },
    { label: 'Réparations', count: stats.repairs, icon: Wrench, color: 'text-orange-600' },
    { label: 'Rendez-vous', count: stats.appointments, icon: Calendar, color: 'text-purple-600' },
    { label: 'Factures', count: stats.invoices, icon: File as FileText, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion de la Base de Données</h2>
          <p className="text-muted-foreground">Administration et maintenance de la base de données IndexedDB</p>
        </div>
        <Button
          variant="outline"
          onClick={refreshStats}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            État de la Base de Données
          </CardTitle>
          <CardDescription>
            Informations sur le stockage et les performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total d'enregistrements</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">IndexedDB</div>
              <div className="text-sm text-muted-foreground">Type de stockage</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                <CheckCircle className="w-8 h-8 mx-auto" />
              </div>
              <div className="text-sm text-muted-foreground">Statut : Opérationnel</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Répartition des Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageItems.map((item) => {
              const Icon = item.icon;
              const percentage = totalRecords > 0 ? (item.count / totalRecords) * 100 : 0;
              
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Progress value={percentage} className="flex-1 h-2" />
                    <Badge variant="secondary" className="min-w-[50px] justify-center">
                      {item.count}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Migration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Migration des Données
          </CardTitle>
          <CardDescription>
            Migration depuis localStorage vers IndexedDB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                La migration des données localStorage vers IndexedDB s'effectue automatiquement au premier démarrage.
                Vous pouvez forcer une nouvelle migration si nécessaire.
              </AlertDescription>
            </Alert>
            
            {migrationStatus === 'running' && (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Migration en cours...</span>
              </div>
            )}
            
            {migrationStatus === 'complete' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Migration terminée avec succès</span>
              </div>
            )}
            
            {migrationStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <Warning className="w-4 h-4" />
                <span>Erreur durant la migration</span>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={handleForceMigration}
              disabled={migrationStatus === 'running'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${migrationStatus === 'running' ? 'animate-spin' : ''}`} />
              Forcer la Migration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Sauvegarde et Restauration
          </CardTitle>
          <CardDescription>
            Exportez et importez vos données pour la sauvegarde ou la migration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                L'export génère un fichier JSON contenant toutes vos données. L'import remplace toutes les données existantes.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleExportData}
                disabled={isExporting || totalRecords === 0}
                className="flex items-center gap-2 flex-1"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                {isExporting ? 'Export en cours...' : 'Exporter les Données'}
              </Button>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="hidden"
                  id="import-input"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-input')?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-2 w-full"
                >
                  <Upload className={`w-4 h-4 ${isImporting ? 'animate-pulse' : ''}`} />
                  {isImporting ? 'Import en cours...' : 'Importer les Données'}
                </Button>
              </div>
            </div>
            
            {totalRecords === 0 && (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Aucune donnée à exporter. Ajoutez des clients, véhicules ou réparations d'abord.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type de base de données :</span>
                <span className="font-mono">IndexedDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version du schéma :</span>
                <span className="font-mono">1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nom de la base :</span>
                <span className="font-mono">GarageManagementDB</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Support des transactions :</span>
                <span className="text-green-600 font-medium">Oui</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Index automatiques :</span>
                <span className="text-green-600 font-medium">Oui</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recherche optimisée :</span>
                <span className="text-green-600 font-medium">Oui</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}