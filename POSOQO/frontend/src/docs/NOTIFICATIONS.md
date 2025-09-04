# 🔔 Sistema de Notificaciones Completo

## 📋 Resumen

El sistema de notificaciones de POSOQO está diseñado para proporcionar una experiencia completa tanto para usuarios normales como para administradores. Combina notificaciones en tiempo real con notificaciones del sistema persistente.

## 🏗️ Arquitectura

### **Sistemas Integrados:**
1. **NotificationSystem** - Notificaciones temporales (toast)
2. **useNotifications** - Notificaciones persistentes del sistema
3. **NotificationManager** - Gestor centralizado de todas las notificaciones

### **Componentes:**
- `NotificationCenter` - Panel de notificaciones en navbar
- `NotificationSystem` - Sistema de toast notifications
- `notificationUtils.ts` - Utilidades centralizadas

## 👤 Notificaciones para Usuarios Normales

### **🛒 Carrito de Compras**
```typescript
// Agregar producto al carrito
manager.userAddedToCart("Cerveza IPA");

// Remover producto del carrito
manager.userRemovedFromCart("Cerveza IPA");
```

### **❤️ Favoritos**
```typescript
// Agregar a favoritos
manager.userAddedToFavorites("Cerveza IPA");

// Remover de favoritos
manager.userRemovedFromFavorites("Cerveza IPA");
```

### **🛍️ Compras**
```typescript
// Compra completada
manager.userCompletedPurchase("ORD-123", 45.99);

// Estado del pedido cambiado
manager.userOrderStatusChanged("ORD-123", "confirmed");
manager.userOrderStatusChanged("ORD-123", "ready");
manager.userOrderStatusChanged("ORD-123", "delivered");
manager.userOrderStatusChanged("ORD-123", "cancelled");
```

### **🎫 Cupones y Descuentos**
```typescript
// Cupón aplicado
manager.userCouponApplied("DESCUENTO20", 10.50);
```

### **📧 Verificación de Email**
```typescript
// Email verificado
manager.userEmailVerified("usuario@email.com");
```

### **👤 Perfil de Usuario**
```typescript
// Perfil actualizado
manager.userProfileUpdated();
```

## 👑 Notificaciones para Administradores

### **📦 Gestión de Pedidos**
```typescript
// Nuevo pedido recibido
manager.adminNewOrder("ORD-123", "Juan Pérez", 45.99);
```

### **📊 Gestión de Stock**
```typescript
// Stock bajo
manager.adminLowStock("Cerveza IPA", 5);

// Producto agotado
manager.adminOutOfStock("Cerveza IPA");
```

### **👥 Gestión de Usuarios**
```typescript
// Nuevo usuario registrado
manager.adminNewUser("Juan Pérez", "juan@email.com");
```

### **📈 Reportes**
```typescript
// Reporte de ventas
manager.adminSalesReport("Enero 2024", 15420.50, 156);
```

### **🔧 Mantenimiento del Sistema**
```typescript
// Mantenimiento programado
manager.adminSystemMaintenance("Mantenimiento programado para mañana a las 2 AM");
```

## ⚙️ Notificaciones del Sistema

### **🚨 Errores**
```typescript
// Error del sistema
manager.systemError("Error de conexión con la base de datos");
```

### **ℹ️ Información**
```typescript
// Información del sistema
manager.systemInfo("Sistema actualizado correctamente");
```

## 🎯 Estados de Pedidos

### **Tipos de Estado:**
- `pending` - Pendiente
- `confirmed` - Confirmado
- `preparing` - Preparando
- `ready` - Listo
- `delivered` - Entregado
- `cancelled` - Cancelado

### **Prioridades:**
- `1` - Baja prioridad
- `2` - Media prioridad
- `3` - Alta prioridad

## 🔧 Implementación

### **En Componentes:**
```typescript
import { useCombinedNotifications } from '@/lib/notificationUtils';

export default function MyComponent() {
  const { manager } = useCombinedNotifications();
  
  const handleAction = () => {
    manager.userAddedToCart("Producto");
  };
}
```

### **En Páginas:**
```typescript
import { useCombinedNotifications } from '@/lib/notificationUtils';

export default function ProductsPage() {
  const { manager } = useCombinedNotifications();
  
  const addToCart = (product) => {
    // Lógica del carrito...
    manager.userAddedToCart(product.name);
  };
}
```

## 🎨 Personalización

### **Tipos de Notificación:**
- `success` - Verde (✅)
- `error` - Rojo (❌)
- `warning` - Amarillo (⚠️)
- `info` - Azul (ℹ️)

### **Acciones:**
- `action_url` - URL para redirigir
- `action_label` - Texto del botón de acción
- `priority` - Prioridad de la notificación
- `expires_at` - Fecha de expiración

## 📱 Responsive

### **Desktop:**
- Panel desplegable a la derecha del navbar
- Contador de notificaciones no leídas
- Acciones completas (marcar como leída, eliminar)

### **Móvil:**
- Panel desplegable debajo del navbar
- Misma funcionalidad que desktop
- Optimizado para touch

## 🔄 Polling

### **Configuración:**
- **Intervalo:** 30 segundos
- **Solo usuarios autenticados**
- **Verificación automática de autenticación**

### **Optimizaciones:**
- Evita requests innecesarios
- Manejo de errores automático
- Limpieza de intervalos al desmontar

## 🚀 Próximas Funcionalidades

### **Planificadas:**
- [ ] Notificaciones push del navegador
- [ ] Notificaciones por email
- [ ] Notificaciones por WhatsApp
- [ ] Configuración de preferencias
- [ ] Notificaciones programadas
- [ ] Integración con webhooks

### **Mejoras:**
- [ ] Sonidos de notificación
- [ ] Vibración en móvil
- [ ] Modo oscuro/claro
- [ ] Filtros avanzados
- [ ] Exportación de notificaciones

## 🐛 Solución de Problemas

### **Error de Hidratación:**
- Usar `isMounted` para evitar renderizado prematuro
- Verificar autenticación solo en cliente

### **Notificaciones Duplicadas:**
- Verificar que no se llame múltiples veces
- Usar debounce para acciones rápidas

### **Performance:**
- Limpiar intervalos al desmontar
- Evitar re-renders innecesarios
- Optimizar polling

## 📞 Soporte

Para problemas o preguntas sobre el sistema de notificaciones, consultar:
- `notificationUtils.ts` - Lógica principal
- `NotificationCenter.tsx` - Componente de UI
- `useNotifications.ts` - Hook del sistema 