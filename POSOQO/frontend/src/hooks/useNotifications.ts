import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  order_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  orders: number;
  users: number;
  products: number;
  system: number;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    orders: 0,
    users: 0,
    products: 0,
    system: 0
  });
  const [loading, setLoading] = useState(true);
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set());

  const isAdmin = (session?.user as any)?.role === 'admin';
  const userID = (session?.user as any)?.id;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar del backend
      try {
        const endpoint = isAdmin ? '/admin/notifications/stats' : '/notifications/stats';
        const params = isAdmin ? '' : `?user_id=${userID}`;
        
        const statsResponse = await apiFetch(`${endpoint}${params}`);
        
        if ((statsResponse as any).success) {
          setStats({
            total: (statsResponse as any).stats.total || 0,
            unread: (statsResponse as any).stats.unread || 0,
            orders: (statsResponse as any).stats.orders || 0,
            users: (statsResponse as any).stats.users || 0,
            products: (statsResponse as any).stats.products || 0,
            system: (statsResponse as any).stats.system || 0,
          });
          
          // Cargar notificaciones del backend
          const notificationsEndpoint = isAdmin ? '/admin/notifications' : '/notifications';
          const notificationsParams = isAdmin ? '' : `?user_id=${userID}`;
          
          const response = await apiFetch(`${notificationsEndpoint}${notificationsParams}`);
          
          if ((response as any).success) {
            setNotifications((response as any).data || []);
          } else {
            throw new Error('No se pudieron cargar las notificaciones del backend');
          }
        } else {
          throw new Error('No se pudieron cargar las estadísticas del backend');
        }
      } catch (backendError) {
        // Si el backend no está disponible, usar datos vacíos
        setNotifications([]);
        setStats({
          total: 0,
          unread: 0,
          orders: 0,
          users: 0,
          products: 0,
          system: 0,
        });
      }
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('🔔 Marcando notificación como leída:', notificationId);
      console.log('👤 User ID:', userID);
      console.log('👑 Is Admin:', isAdmin);
      
      const endpoint = isAdmin ? `/admin/notifications/${notificationId}/read` : `/notifications/${notificationId}/read`;
      const params = isAdmin ? '' : `?user_id=${userID}`;
      
      console.log('🌐 Endpoint:', `${endpoint}${params}`);
      
      const response = await apiFetch(`${endpoint}${params}`, {
        method: 'PUT'
      });
      
      console.log('✅ Respuesta del servidor:', response);
      
      // Actualizar estado local inmediatamente
      setNotifications(prevNotifications => 
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      // Actualizar estadísticas inmediatamente desde el backend
      try {
        const statsEndpoint = isAdmin ? '/admin/notifications/stats' : '/notifications/stats';
        const statsParams = isAdmin ? '' : `?user_id=${userID}`;
        
        console.log('📊 Actualizando estadísticas:', `${statsEndpoint}${statsParams}`);
        
        const statsResponse = await apiFetch(`${statsEndpoint}${statsParams}`);
        
        console.log('📊 Respuesta de estadísticas:', statsResponse);
        
        if ((statsResponse as any).success) {
          setStats({
            total: (statsResponse as any).stats.total || 0,
            unread: (statsResponse as any).stats.unread || 0,
            orders: (statsResponse as any).stats.orders || 0,
            users: (statsResponse as any).stats.users || 0,
            products: (statsResponse as any).stats.products || 0,
            system: (statsResponse as any).stats.system || 0,
          });
        }
      } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
      }
      
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
      console.error('🔍 Detalles del error:', {
        notificationId,
        userID,
        isAdmin,
        error: error instanceof Error ? error.message : error
      });
    }
  };

  const markAllAsReadByType = async (type: string) => {
    try {
      // Por ahora, usar markAllAsRead en lugar de markAllAsReadByType
      // para evitar errores con tipos de notificación no soportados
      console.log(`⚠️ markAllAsReadByType('${type}') no soportado, usando markAllAsRead`);
      await markAllAsRead();
    } catch (error) {
      console.error('Error marcando notificaciones como leídas:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('🔔 Marcando todas las notificaciones como leídas');
      console.log('👤 User ID:', userID);
      console.log('👑 Is Admin:', isAdmin);
      
      // Marcar todas las notificaciones no leídas como leídas en el backend
      const endpoint = isAdmin ? '/admin/notifications/read-all' : '/notifications/read-all';
      const params = isAdmin ? '' : `?user_id=${userID}`;
      
      console.log('🌐 Endpoint:', `${endpoint}${params}`);
      
      const response = await apiFetch(`${endpoint}${params}`, {
        method: 'PUT'
      });
      
      console.log('✅ Respuesta del servidor:', response);
      
      // Actualizar estado local
      setNotifications(notifications.map(n =>
        !n.is_read ? { ...n, is_read: true } : n
      ));
      
      // Actualizar estadísticas inmediatamente
      try {
        const statsEndpoint = isAdmin ? '/admin/notifications/stats' : '/notifications/stats';
        const statsParams = isAdmin ? '' : `?user_id=${userID}`;
        
        console.log('📊 Actualizando estadísticas:', `${statsEndpoint}${statsParams}`);
        
        const statsResponse = await apiFetch(`${statsEndpoint}${statsParams}`);
        
        console.log('📊 Respuesta de estadísticas:', statsResponse);
        
        if ((statsResponse as any).success) {
          setStats({
            total: (statsResponse as any).stats.total || 0,
            unread: 0, // Todas marcadas como leídas
            orders: (statsResponse as any).stats.orders || 0,
            users: (statsResponse as any).stats.users || 0,
            products: (statsResponse as any).stats.products || 0,
            system: (statsResponse as any).stats.system || 0,
          });
        }
      } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
      }
    } catch (error) {
      console.error('❌ Error marcando todas las notificaciones como leídas:', error);
      console.error('🔍 Detalles del error:', {
        userID,
        isAdmin,
        error: error instanceof Error ? error.message : error
      });
    }
  };

  const visitSection = (section: string) => {
    setVisitedSections(prev => new Set([...prev, section]));
    
    // Marcar notificaciones como leídas según el tipo de sección
    // Usar markAllAsRead en lugar de markAllAsReadByType para evitar errores
    switch (section) {
      case 'orders':
      case 'users':
      case 'products':
      case 'system':
        // Marcar todas como leídas en lugar de por tipo
        markAllAsRead();
        break;
    }
  };

  const getSectionNotificationCount = (section: string): number => {
    if (visitedSections.has(section)) {
      return 0; // Si ya visitó la sección, no mostrar contador
    }
    
    switch (section) {
      case 'orders':
        return stats.orders;
      case 'users':
        return stats.users;
      case 'products':
        return stats.products;
      case 'system':
        return stats.system;
      default:
        return 0;
    }
  };

  const createNotification = async (notification: {
    type: string;
    title: string;
    message: string;
    user_id?: string;
    order_id?: string;
  }) => {
    try {
      const endpoint = isAdmin ? '/admin/notifications' : '/notifications';
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(notification)
      });
      
      // Recargar notificaciones inmediatamente
      await loadNotifications();
      
      // También disparar evento para otros componentes
      window.dispatchEvent(new CustomEvent('notification-update'));
    } catch (error) {
      console.error('Error creando notificación:', error);
    }
  };

  useEffect(() => {
    if (session) {
      loadNotifications();
      
      // Polling cada 30 segundos para reducir recargues (era cada 5 segundos)
      const interval = setInterval(loadNotifications, 30000);
      
      // Escuchar eventos de actualización de notificaciones
      const handleNotificationUpdate = () => {
        console.log('🔄 Actualizando notificaciones por evento...');
        loadNotifications();
      };
      
      window.addEventListener('notification-update', handleNotificationUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notification-update', handleNotificationUpdate);
      };
    }
  }, [session, isAdmin, userID]);

  // Función para actualizar notificaciones manualmente
  const refreshNotifications = () => {
    loadNotifications();
  };

  return {
    notifications,
    stats,
    loading,
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    visitSection,
    getSectionNotificationCount,
    visitedSections,
    isAdmin
  };
} 