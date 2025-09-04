"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";

// Tipos de notificación
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Interfaz de notificación
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Contexto de notificaciones
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook personalizado para usar notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

// Componente de notificación individual
const NotificationItem = ({ notification, onRemove }: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss
  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(notification.id), 300);
      }, notification.duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  // Configuración por tipo
  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-green-500',
          borderColor: 'border-green-400',
          textColor: 'text-green-100',
          iconColor: 'text-green-400'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-400',
          textColor: 'text-red-100',
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-100',
          iconColor: 'text-yellow-400'
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-100',
          iconColor: 'text-blue-400'
        };
    }
  };

  const config = getNotificationConfig(notification.type);
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`
        relative bg-stone-900/95 backdrop-blur-sm border rounded-xl shadow-2xl 
        border-yellow-400/20 p-4 min-w-[320px] max-w-[400px]
        ${config.borderColor} border-opacity-30
      `}
    >
      {/* Barra de progreso */}
      {notification.duration !== 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-stone-700 rounded-t-xl overflow-hidden">
          <motion.div
            className={`h-full ${config.bgColor}`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ 
              duration: (notification.duration || 5000) / 1000, 
              ease: "linear" 
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-white mb-1 ${config.textColor}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-stone-300 text-sm leading-relaxed">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(notification.id), 300);
          }}
          className="flex-shrink-0 text-stone-400 hover:text-white transition-colors p-1"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Componente principal del sistema de notificaciones
export const NotificationSystem = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Provider del contexto
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...(prev || []), newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => (prev || []).filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationSystem />
    </NotificationContext.Provider>
  );
};

// Funciones helper para crear notificaciones rápidamente
export const createNotification = {
  success: (title: string, message?: string, options?: Partial<Notification>) => ({
    type: 'success' as const,
    title,
    message,
    duration: 4000,
    ...options
  }),
  
  error: (title: string, message?: string, options?: Partial<Notification>) => ({
    type: 'error' as const,
    title,
    message,
    duration: 6000,
    ...options
  }),
  
  warning: (title: string, message?: string, options?: Partial<Notification>) => ({
    type: 'warning' as const,
    title,
    message,
    duration: 5000,
    ...options
  }),
  
  info: (title: string, message?: string, options?: Partial<Notification>) => ({
    type: 'info' as const,
    title,
    message,
    duration: 4000,
    ...options
  })
}; 