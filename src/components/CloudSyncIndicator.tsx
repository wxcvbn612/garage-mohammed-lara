import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Cloud, 
  CloudCheck, 
  CloudX, 
  ArrowsClockwise 
} from '@phosphor-icons/react';
import { useCloudSync } from '../hooks/useCloudSync';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CloudSyncIndicator() {
  const { status, performManualSync, isLoading } = useCloudSync();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSyncIcon = () => {
    if (status.syncInProgress || isLoading) {
      return <ArrowsClockwise className="w-4 h-4 animate-spin" />;
    }
    if (status.error) {
      return <CloudX className="w-4 h-4" />;
    }
    if (status.isEnabled && status.lastSync) {
      return <CloudCheck className="w-4 h-4" />;
    }
    return <Cloud className="w-4 h-4" />;
  };

  const getSyncVariant = () => {
    if (status.syncInProgress || isLoading) return 'secondary';
    if (status.error) return 'destructive';
    if (status.isEnabled && status.lastSync) return 'default';
    return 'outline';
  };

  const getSyncTooltip = () => {
    if (status.syncInProgress || isLoading) {
      return 'Synchronisation en cours...';
    }
    if (status.error) {
      return `Erreur de synchronisation: ${status.error}`;
    }
    if (status.isEnabled && status.lastSync) {
      return `Dernière synchronisation: ${formatDistanceToNow(status.lastSync, { 
        addSuffix: true, 
        locale: fr 
      })}`;
    }
    if (status.isEnabled) {
      return 'En attente de synchronisation...';
    }
    return 'Synchronisation cloud désactivée';
  };

  const handleSyncClick = async () => {
    if (!status.syncInProgress && !isLoading) {
      await performManualSync();
    }
  };

  if (!status.isEnabled) {
    return null; // Don't show indicator if sync is disabled
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncClick}
            disabled={status.syncInProgress || isLoading}
            className="h-8 w-8 p-0"
          >
            <Badge 
              variant={getSyncVariant()}
              className="h-6 w-6 p-0 flex items-center justify-center"
            >
              {getSyncIcon()}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{getSyncTooltip()}</p>
            {status.isEnabled && (
              <p className="text-xs text-muted-foreground mt-1">
                {status.totalRecords} enregistrements • Cliquez pour synchroniser
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}