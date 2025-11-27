import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  dateEnvoi: string;
  lu: boolean;
  type: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tchopmate-notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        updateUnreadCount(parsed);
      } catch (e) {
        console.error('Erreur chargement notifications:', e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('tchopmate-notifications', JSON.stringify(notifications));
      updateUnreadCount(notifications);
    }
  }, [notifications]);

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.lu).length;
    setUnreadCount(count);
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'dateEnvoi' | 'lu'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      dateEnvoi: new Date().toISOString(),
      lu: false,
    };
    
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, lu: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, lu: true }))
    );
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
}