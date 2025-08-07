import { useKV } from '@github/spark/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  entityType?: 'repair' | 'appointment' | 'invoice' | 'stock';
  entityId?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useKV<Notification[]>('notifications', []);
  const [isOpen, setIsOpen] = useState(false);

  // Simuler les notifications en temps réel (remplacer par WebSocket en production)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simuler une notification aléatoire
      if (Math.random() < 0.1) { // 10% de chance chaque 30 secondes
        generateRandomNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateRandomNotification = () => {
    const notificationTemplates = [
      {
        type: 'info' as const,
        title: 'Nouveau rendez-vous',
        message: 'Un nouveau rendez-vous a été programmé pour demain.',
        entityType: 'appointment' as const
      },
      {
        type: 'warning' as const,
        title: 'Stock faible',
        message: 'Les plaquettes de frein sont en rupture de stock.',
        entityType: 'stock' as const
      },
      {
        type: 'success' as const,
        title: 'Réparation terminée',
        message: 'La réparation de la Peugeot 308 a été terminée avec succès.',
        entityType: 'repair' as const
      },
      {
        type: 'error' as const,
        title: 'Facture impayée',
        message: 'La facture #2024-001 est en retard de paiement.',
        entityType: 'invoice' as const
      }
    ];

    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    
    const notification: Notification = {
      id: Date.now().toString(),
      ...template,
      timestamp: new Date(),
      read: false,
      entityId: Math.random().toString(36).substr(2, 9)
    };

    setNotifications(current => [notification, ...current].slice(0, 50)); // Garder max 50 notifications
    
    // Afficher une toast
    toast(notification.title, {
      description: notification.message,
      action: {
        label: 'Voir',
        onClick: () => setIsOpen(true)
      }
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(current => 
      current.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(current => 
      current.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(current => 
      current.filter(n => n.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    const opacity = read ? '50' : '100';
    switch (type) {
      case 'success':
        return `bg-green-${opacity}`;
      case 'warning':
        return `bg-yellow-${opacity}`;
      case 'error':
        return `bg-red-${opacity}`;
      default:
        return `bg-blue-${opacity}`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Ajouter quelques notifications d'exemple au premier chargement
  useEffect(() => {
    if (notifications.length === 0) {
      const exampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Système initialisé',
          message: 'Le système de gestion du garage est maintenant opérationnel.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Bienvenue dans votre garage',
          message: 'Vous pouvez maintenant gérer vos clients, véhicules et réparations.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          read: true
        }
      ];
      setNotifications(exampleNotifications);
    }
  }, []);

  return (
    <div className="relative">
      {/* Icône de notification avec badge */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notifications */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden bg-card border rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Tout marquer lu
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune notification</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRandomNotification}
                  className="mt-3"
                >
                  Générer une notification test
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {notification.entityType && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.entityType}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Tout effacer
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}