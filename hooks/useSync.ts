
import { useState, useEffect } from 'react';
import { syncService, SyncStatus } from '../services/syncService';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: null,
    isSyncing: false,
    pendingChanges: 0,
  });

  useEffect(() => {
    console.log('Setting up sync status listener');
    
    const unsubscribe = syncService.onStatusChange((status) => {
      console.log('Sync status updated:', status);
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  const performSync = async (force: boolean = false) => {
    console.log('Performing sync via hook, force:', force);
    return syncService.performSync(force);
  };

  const forceSyncTontine = async (tontineId: string) => {
    console.log('Force syncing tontine via hook:', tontineId);
    return syncService.forceSyncTontine(tontineId);
  };

  const getOfflineData = async () => {
    console.log('Getting offline data via hook');
    return syncService.getOfflineData();
  };

  return {
    ...syncStatus,
    performSync,
    forceSyncTontine,
    getOfflineData,
  };
}
