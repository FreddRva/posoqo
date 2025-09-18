-- ========================================
-- Migración: Add is_read column to notifications table
-- ========================================

-- Agregar columna is_read como BOOLEAN
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Actualizar is_read basado en read_at existente
UPDATE notifications 
SET is_read = (read_at IS NOT NULL)
WHERE is_read IS NULL OR is_read = FALSE;

-- Crear índice para is_read
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Crear trigger para mantener sincronizado is_read con read_at
CREATE OR REPLACE FUNCTION sync_notification_read_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza read_at, actualizar is_read
    IF TG_OP = 'UPDATE' THEN
        IF OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
            NEW.is_read = TRUE;
        ELSIF OLD.read_at IS NOT NULL AND NEW.read_at IS NULL THEN
            NEW.is_read = FALSE;
        END IF;
    END IF;
    
    -- Si se actualiza is_read, actualizar read_at
    IF TG_OP = 'UPDATE' THEN
        IF OLD.is_read = FALSE AND NEW.is_read = TRUE AND NEW.read_at IS NULL THEN
            NEW.read_at = CURRENT_TIMESTAMP;
        ELSIF OLD.is_read = TRUE AND NEW.is_read = FALSE THEN
            NEW.read_at = NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_notification_read_status_trigger') THEN
        CREATE TRIGGER sync_notification_read_status_trigger
            BEFORE UPDATE ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION sync_notification_read_status();
    END IF;
END $$;

COMMENT ON COLUMN notifications.is_read IS 'Estado de lectura de la notificación (sincronizado con read_at)';
