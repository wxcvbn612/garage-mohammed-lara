import { useEffect } from 'react';
import { CloudSyncService } from '@/services/CloudSyncService';

/**
 * Hook to initialize cloud sync on app startup
 */
export function useCloudSyncInit() {
  useEffect(() => {
    // Initialize cloud sync service
    const cloudSync = CloudSyncService.getInstance();
    
    // This will start auto-sync if enabled in settings
    cloudSync.getSyncStatus().then(status => {
      if (status.isEnabled) {
        console.log('Cloud sync initialized and enabled');
      }
    }).catch(console.error);
  }, []);
}

export default useCloudSyncInit;