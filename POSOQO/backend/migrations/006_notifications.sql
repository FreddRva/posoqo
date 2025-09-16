-- ========================================
-- Migración: Notifications System
-- ========================================

-- Crear tabla para notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
    order_id VARCHAR(255)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Crear trigger para actualizar updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
        CREATE TRIGGER update_notifications_updated_at 
            BEFORE UPDATE ON notifications 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Crear función para limpiar notificaciones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Crear función para marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id BIGINT, user_id_param BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP 
    WHERE id = notification_id 
    AND user_id = user_id_param;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Crear función para marcar todas las notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP 
    WHERE user_id = user_id_param 
    AND read_at IS NULL;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Crear vista para notificaciones no leídas
CREATE OR REPLACE VIEW unread_notifications AS
SELECT 
    n.id,
    n.user_id,
    n.title,
    n.message,
    n.type,
    n.created_at,
    n.expires_at,
    n.action_url,
    n.action_label,
    n.metadata,
    n.priority,
    u.name as user_name,
    u.email as user_email
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.read_at IS NULL
AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
ORDER BY n.priority DESC, n.created_at DESC;

-- Crear vista para estadísticas de notificaciones
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read_at IS NULL) as unread_count,
    COUNT(*) FILTER (WHERE type = 'success') as success_count,
    COUNT(*) FILTER (WHERE type = 'error') as error_count,
    COUNT(*) FILTER (WHERE type = 'warning') as warning_count,
    COUNT(*) FILTER (WHERE type = 'info') as info_count,
    MAX(created_at) as last_notification_at
FROM notifications
GROUP BY user_id;

-- Comentarios para documentación
COMMENT ON TABLE notifications IS 'Tabla para almacenar notificaciones del sistema';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: success, error, warning, info';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp cuando la notificación fue leída (NULL = no leída)';
COMMENT ON COLUMN notifications.expires_at IS 'Fecha de expiración de la notificación (NULL = no expira)';
COMMENT ON COLUMN notifications.action_url IS 'URL opcional para acción asociada a la notificación';
COMMENT ON COLUMN notifications.action_label IS 'Etiqueta del botón de acción';
COMMENT ON COLUMN notifications.metadata IS 'Datos adicionales en formato JSON';
COMMENT ON COLUMN notifications.priority IS 'Prioridad de la notificación (0-5, donde 5 es más alta)';
COMMENT ON COLUMN notifications.order_id IS 'ID del pedido asociado a la notificación (opcional)';

-- Insertar datos de ejemplo (solo para desarrollo)
-- INSERT INTO notifications (user_id, title, message, type, priority) VALUES 
-- (1, 'Bienvenido a POSOQO', 'Gracias por registrarte en nuestra plataforma', 'info', 1),
-- (1, 'Pedido confirmado', 'Tu pedido #12345 ha sido confirmado', 'success', 2),
-- (1, 'Stock bajo', 'El producto "Cerveza Artesanal" tiene stock limitado', 'warning', 3); 