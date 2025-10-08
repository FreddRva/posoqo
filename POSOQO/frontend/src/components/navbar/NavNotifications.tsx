// components/navbar/NavNotifications.tsx
import React from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface NavNotificationsProps {
  notifications: Notification[];
  stats: { unread: number; total: number };
  showNotifications: boolean;
  onToggle: () => void;
  onMarkAsRead: (id: string) => void | Promise<void>;
  onMarkAllAsRead: () => void | Promise<void>;
}

export const NavNotifications: React.FC<NavNotificationsProps> = ({
  notifications,
  stats,
  showNotifications,
  onToggle,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const getNotificationIcon = (type: string) => {
    if (!type || typeof type !== 'string') return '📢';
    
    const icons: { [key: string]: string } = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      order: '🛒',
      user: '👤',
      product: '🍺',
      system: '⚙️',
      admin: '👑',
      order_status: '🛒',
      service: '🔧',
    };
    
    const sanitizedType = type.toLowerCase().replace(/[^a-z_]/g, '');
    return icons[sanitizedType] || '📢';
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative p-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-yellow-400" />
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
            {stats.unread}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-yellow-400/20 bg-[rgba(15,15,15,0.75)] backdrop-blur-xl shadow-[0_10px_40px_rgba(255,215,0,0.12)] py-3 z-50 notifications-content">
          <div className="px-4 py-3 border-b border-gray-800/50">
            <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#FFD700]" />
              Notificaciones
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              {stats.unread} sin leer de {stats.total} total
            </p>
          </div>
          
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-gray-400 text-4xl mb-2">🔔</div>
              <p className="text-gray-400 text-sm">No hay notificaciones</p>
              <p className="text-gray-500 text-xs mt-1">Te notificaremos cuando haya novedades</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {stats.unread > 0 && (
                <div className="px-4 py-2 border-b border-gray-800/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAllAsRead();
                    }}
                    className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">📋</span>
                    Marcar todas como leídas ({stats.unread})
                  </button>
                </div>
              )}
              
              <div className="space-y-1 p-2">
                {notifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:scale-[1.02] ${
                      !notification.is_read ? 'bg-gray-700/30 border-l-4 border-yellow-400 shadow-lg' : 'bg-gray-700/10'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#FFD700] text-sm font-medium leading-tight">
                          {notification.title ? notification.title.substring(0, 100) : 'Sin título'}
                        </div>
                        {notification.message && notification.message !== notification.title && (
                          <div className="text-gray-400 text-xs mt-1 leading-relaxed">
                            {notification.message.substring(0, 150)}
                          </div>
                        )}
                        <div className="text-gray-400 text-xs mt-2 flex items-center">
                          <span className="mr-2">🕒</span>
                          {notification.created_at ? new Date(notification.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Fecha no disponible'}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="flex flex-col items-center space-y-1">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 animate-pulse"></span>
                          <span className="text-xs text-[#FFD700] font-medium">Nueva</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {notifications.length > 8 && (
            <div className="px-4 py-2 border-t border-gray-800/50">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="text-lg">📋</span>
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};