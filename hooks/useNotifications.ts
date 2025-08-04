import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationHook {
  notifications: Notification[];
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, persistent?: boolean) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export function useNotifications(): NotificationHook {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover notificação após o tempo especificado (se não for persistente)
    if (!notification.persistent) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [generateId]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration = 4000) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, persistent = false) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? undefined : 6000,
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, duration = 5000) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, duration = 4000) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
  };
}

// Hook para notificações globais (usando Context se necessário)
let globalNotificationHandler: NotificationHook | null = null;

export function setGlobalNotificationHandler(handler: NotificationHook) {
  globalNotificationHandler = handler;
}

export function useGlobalNotifications() {
  if (!globalNotificationHandler) {
    console.warn('Global notification handler não foi configurado');
    return {
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
    };
  }

  return {
    showSuccess: globalNotificationHandler.showSuccess,
    showError: globalNotificationHandler.showError,
    showWarning: globalNotificationHandler.showWarning,
    showInfo: globalNotificationHandler.showInfo,
  };
}