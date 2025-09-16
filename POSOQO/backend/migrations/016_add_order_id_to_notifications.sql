-- ========================================
-- Migración: Add order_id to existing notifications table
-- ========================================

-- Agregar columna order_id a la tabla notifications existente
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);

-- Crear índice para order_id
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

-- Agregar comentario para documentación
COMMENT ON COLUMN notifications.order_id IS 'ID del pedido asociado a la notificación (opcional)';
