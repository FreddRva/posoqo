import { useNotifications } from '@/hooks/useNotifications';
import { useNotifications as useSystemNotifications } from '@/components/NotificationSystem';

// Tipos de notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Interfaz para notificaciones del sistema
export interface SystemNotification {
  title: string;
  message?: string;
  type: NotificationType;
  priority?: number;
  expires_at?: string;
  action_url?: string;
  action_label?: string;
}

// Clase para manejar notificaciones
export class NotificationManager {
  private static instance: NotificationManager;
  private useNotificationsHook: any;
  private addNotificationFunc: any;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Inicializar con hooks
  init(useNotificationsHook: any, addNotificationFunc: any) {
    this.useNotificationsHook = useNotificationsHook;
    this.addNotificationFunc = addNotificationFunc;
  }

  // Notificaciones para usuarios normales
  userAddedToCart(productName: string) {
    // userAddedToCart called
    
    this.createSystemNotification({
      title: "Producto agregado al carrito",
      message: `${productName} se agregó correctamente`,
      type: "success"
    });
    
    if (this.addNotificationFunc) {
      // Adding notification to system
      this.addNotificationFunc({
        id: Date.now().toString(),
        type: 'success',
        title: "Producto agregado",
        message: `${productName} se ha añadido al carrito.`
      });
    } else {
      // addNotificationFunc is not available
    }
    
    // Forzar actualización de notificaciones después de un breve delay
    if (this.useNotificationsHook?.loadNotifications) {
      setTimeout(() => {
        // Forcing notification refresh
        this.useNotificationsHook.loadNotifications();
      }, 500);
    }
  }

  userRemovedFromCart(productName: string) {
    this.createSystemNotification({
      title: "Producto removido del carrito",
      message: `${productName} se removió del carrito`,
      type: "info"
    });
  }

  userAddedToFavorites(productName: string) {
    this.createSystemNotification({
      title: "Agregado a favoritos",
      message: `${productName} se agregó a favoritos`,
      type: "success"
    });
    
    this.addNotificationFunc({
      id: Date.now().toString(),
      type: 'success',
      title: "Favorito añadido",
      message: `${productName} se ha añadido a favoritos.`
    });
  }

  userRemovedFromFavorites(productName: string) {
    this.createSystemNotification({
      title: "Removido de favoritos",
      message: `${productName} se removió de favoritos`,
      type: "info"
    });
    
    this.addNotificationFunc({
      id: Date.now().toString(),
      type: 'info',
      title: "Favorito removido",
      message: `${productName} se ha removido de favoritos.`
    });
  }

  userCompletedPurchase(orderId: string, total: number) {
    this.createSystemNotification({
      title: "Compra completada",
      message: `Pedido #${orderId} por $${total} completado exitosamente`,
      type: "success",
      action_url: `/orders/${orderId}`,
      action_label: "Ver pedido"
    });
    
    this.addNotificationFunc({
      id: Date.now().toString(),
      type: 'success',
      title: "¡Compra exitosa!",
      message: `Tu pedido #${orderId} ha sido procesado.`
    });
  }

  userOrderStatusChanged(orderId: string, status: string) {
    const statusMessages = {
      'pending': 'Tu pedido está siendo procesado',
      'confirmed': 'Tu pedido ha sido confirmado',
      'preparing': 'Tu pedido está siendo preparado',
      'ready': '¡Tu pedido está listo!',
      'delivered': 'Tu pedido ha sido entregado',
      'cancelled': 'Tu pedido ha sido cancelado'
    };

    this.createSystemNotification({
      title: "Estado del pedido actualizado",
      message: `${statusMessages[status as keyof typeof statusMessages]} - Pedido #${orderId}`,
      type: status === 'cancelled' ? 'error' : 'info',
      action_url: `/orders/${orderId}`,
      action_label: "Ver detalles"
    });
  }

  userCouponApplied(couponCode: string, discount: number) {
    this.createSystemNotification({
      title: "Cupón aplicado",
      message: `Cupón "${couponCode}" aplicado. Descuento: $${discount}`,
      type: "success"
    });
    
    this.addNotificationFunc({
      id: Date.now().toString(),
      type: 'success',
      title: "Cupón aplicado",
      message: `Descuento de $${discount} aplicado con éxito.`
    });
  }

  userEmailVerified(email: string) {
    this.createSystemNotification({
      title: "Email verificado",
      message: `Tu email ${email} ha sido verificado correctamente`,
      type: "success"
    });
  }

  userProfileUpdated() {
    this.createSystemNotification({
      title: "Perfil actualizado",
      message: "Tu información de perfil se actualizó correctamente",
      type: "success"
    });
    
    this.addNotificationFunc({
      id: Date.now().toString(),
      type: 'success',
      title: "Perfil actualizado",
      message: "Tu información se guardó correctamente."
    });
  }

  // Notificaciones para administradores
  adminNewOrder(orderId: string, customerName: string, total: number) {
    this.createSystemNotification({
      title: "Nuevo pedido recibido",
      message: `Pedido #${orderId} de ${customerName} por $${total}`,
      type: "info",
      priority: 2,
      action_url: `/dashboard/orders/${orderId}`,
      action_label: "Ver pedido"
    });
  }

  adminLowStock(productName: string, currentStock: number) {
    this.createSystemNotification({
      title: "Stock bajo",
      message: `${productName} tiene solo ${currentStock} unidades disponibles`,
      type: "warning",
      priority: 2,
      action_url: `/dashboard/products`,
      action_label: "Gestionar stock"
    });
  }

  adminOutOfStock(productName: string) {
    this.createSystemNotification({
      title: "Producto agotado",
      message: `${productName} se ha agotado completamente`,
      type: "error",
      priority: 3,
      action_url: `/dashboard/products`,
      action_label: "Reabastecer"
    });
  }

  adminNewUser(userName: string, userEmail: string) {
    this.createSystemNotification({
      title: "Nuevo usuario registrado",
      message: `${userName} (${userEmail}) se registró en la plataforma`,
      type: "info",
      priority: 1,
      action_url: `/dashboard/users`,
      action_label: "Ver usuarios"
    });
  }

  adminSalesReport(period: string, totalSales: number, orderCount: number) {
    this.createSystemNotification({
      title: "Reporte de ventas",
      message: `${period}: $${totalSales} en ${orderCount} pedidos`,
      type: "info",
      priority: 1,
      action_url: `/dashboard/reports`,
      action_label: "Ver reporte"
    });
  }

  adminSystemMaintenance(message: string) {
    this.createSystemNotification({
      title: "Mantenimiento del sistema",
      message: message,
      type: "warning",
      priority: 3
    });
  }

  // Notificaciones del sistema
  systemError(error: string) {
    this.createSystemNotification({
      title: "Error del sistema",
      message: error,
      type: "error",
      priority: 3
    });
  }

  systemInfo(message: string) {
    this.createSystemNotification({
      title: "Información del sistema",
      message: message,
      type: "info"
    });
  }

  // Método privado para crear notificaciones del sistema
  private async createSystemNotification(notification: SystemNotification) {
    if (this.useNotificationsHook?.createNotification) {
      try {
        await this.useNotificationsHook.createNotification({
          type: notification.type,
          title: notification.title,
          message: notification.message || '',
        });
      } catch (error) {
        // Error silencioso para evitar logs innecesarios en producción
      }
    }
  }


}

// Hook para usar el NotificationManager
export const useNotificationManager = () => {
  const systemNotifications = useNotifications();
  
  // Inicializar el manager
  const manager = NotificationManager.getInstance();
  manager.init(systemNotifications, null); // addNotificationFunc se pasará cuando esté disponible
  
  return manager;
};

// Hook combinado para usar ambos sistemas
export const useCombinedNotifications = () => {
  const systemNotifications = useNotifications();
  const { showSuccess, showError, showWarning, showInfo } = useSystemNotifications();
  
  const manager = NotificationManager.getInstance();
  manager.init(systemNotifications, showSuccess);
  
  return {
    manager,
    systemNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}; 