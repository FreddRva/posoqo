-- ========================================
-- Migración: Password Reset Codes
-- ========================================

-- Crear tabla para códigos de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_used ON password_reset_codes(used);

-- Crear índice compuesto para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_code ON password_reset_codes(email, code, used, expires_at);

-- Crear trigger para actualizar updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_password_reset_codes_updated_at') THEN
        CREATE TRIGGER update_password_reset_codes_updated_at 
            BEFORE UPDATE ON password_reset_codes 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON TABLE password_reset_codes IS 'Tabla para almacenar códigos de recuperación de contraseña (6 dígitos)';
COMMENT ON COLUMN password_reset_codes.code IS 'Código de 6 dígitos para recuperación de contraseña';
COMMENT ON COLUMN password_reset_codes.used IS 'Indica si el código ya fue usado';
COMMENT ON COLUMN password_reset_codes.expires_at IS 'Fecha de expiración del código (15 minutos)';

