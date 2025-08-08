import { useState, useEffect, useCallback } from 'react';
import { CloudSyncService, SyncStatus } from '@/services/CloudSyncService';
import { toast } from 'sonner';

export function useCloudSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isEnabled: false,
    lastSync: null,
    syncInProgress: false,
    error: null,
    totalRecords: 0,
    syncedRecords: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const cloudSync = CloudSyncService.getInstance();

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const currentStatus = await cloudSync.getSyncStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }, [cloudSync]);

  const toggleSync = useCallback(async (enabled: boolean) => {
    setIsLoading(true);
    try {
      await cloudSync.toggleSync(enabled);
      await loadStatus();
      
      if (enabled) {
        toast.success('Synchronisation cloud activée');
      } else {
        toast.success('Synchronisation cloud désactivée');
      }
    } catch (error) {
      console.error('Failed to toggle sync:', error);
      toast.error('Erreur lors de la configuration de la synchronisation');
    } finally {
      setIsLoading(false);
    }
  }, [cloudSync, loadStatus]);

  const performManualSync = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await cloudSync.performSync();
      await loadStatus();
      
      if (success) {
        toast.success('Synchronisation réussie');
      } else {
        toast.error('Échec de la synchronisation');
      }
      
      return success;
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('Erreur lors de la synchronisation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cloudSync, loadStatus]);

  const restoreFromCloud = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await cloudSync.restoreFromCloud();
      
      if (success) {
        toast.success('Données restaurées depuis le cloud');
        // Reload the page to refresh all data
        window.location.reload();
      } else {
        toast.error('Échec de la restauration');
      }
      
      return success;
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Erreur lors de la restauration');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cloudSync]);

  const exportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await cloudSync.exportData();
      
      // Create download link
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `garage-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Export des données réussi');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsLoading(false);
    }
  }, [cloudSync]);

  const importData = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const success = await cloudSync.importData(text);
      
      if (success) {
        toast.success('Import des données réussi');
        // Reload the page to refresh all data
        window.location.reload();
      } else {
        toast.error('Échec de l\'import');
      }
      
      return success;
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Erreur lors de l\'import - fichier invalide');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cloudSync]);

  const getSyncHistory = useCallback(async () => {
    try {
      return await cloudSync.getSyncHistory();
    } catch (error) {
      console.error('Failed to get sync history:', error);
      return [];
    }
  }, [cloudSync]);

  return {
    status,
    isLoading,
    toggleSync,
    performManualSync,
    restoreFromCloud,
    exportData,
    importData,
    getSyncHistory,
    refreshStatus: loadStatus
  };
}