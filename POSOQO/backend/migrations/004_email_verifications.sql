-- ========================================
-- Migración: Email Verifications
-- ========================================

-- Crear tabla para verificación de emails
CREATE TABLE IF NOT EXISTS email_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_used ON email_verifications(used);

-- Agregar columna email_verified a la tabla users si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Crear función para limpiar tokens expirados automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verifications 
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND used = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger solo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_verifications_updated_at') THEN
        CREATE TRIGGER update_email_verifications_updated_at 
            BEFORE UPDATE ON email_verifications 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Crear vista para tokens activos
CREATE OR REPLACE VIEW active_verifications AS
SELECT 
    ev.id,
    ev.user_id,
    ev.token,
    ev.email,
    ev.expires_at,
    ev.created_at,
    u.name as user_name
FROM email_verifications ev
JOIN users u ON ev.user_id = u.id
WHERE ev.used = FALSE 
AND ev.expires_at > CURRENT_TIMESTAMP;

-- Comentarios para documentación
COMMENT ON TABLE email_verifications IS 'Tabla para almacenar tokens de verificación de email';
COMMENT ON COLUMN email_verifications.token IS 'Token único de 64 caracteres para verificación';
COMMENT ON COLUMN email_verifications.used IS 'Indica si el token ya fue usado';
COMMENT ON COLUMN email_verifications.expires_at IS 'Fecha de expiración del token (24 horas)';
COMMENT ON COLUMN users.email_verified IS 'Indica si el email del usuario ha sido verificado';

-- Insertar datos de ejemplo (solo para desarrollo)
-- INSERT INTO email_verifications (user_id, token, email, expires_at) 
-- VALUES (1, 'example_token_123', 'test@example.com', CURRENT_TIMESTAMP + INTERVAL '24 hours'); 