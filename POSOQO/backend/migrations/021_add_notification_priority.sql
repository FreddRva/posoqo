-- Agregar columna de prioridad a notificaciones
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;

-- Crear índice para prioridad
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority DESC);

-- Actualizar prioridades existentes basadas en tipo
UPDATE notifications 
SET priority = CASE 
    WHEN type = 'error' OR type = 'warning' THEN 3
    WHEN type = 'success' THEN 2
    ELSE 1
END
WHERE priority = 1;

-- Comentarios
COMMENT ON COLUMN notifications.priority IS 'Prioridad de la notificación: 1=Baja, 2=Media, 3=Alta';

