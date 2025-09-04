-- ========================================
-- Migración: Add User Active Field
-- ========================================

-- Agregar columna is_active a la tabla users existente
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Crear índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Actualizar comentario de la columna
COMMENT ON COLUMN users.is_active IS 'Indica si la cuenta del usuario está activa';

-- Crear tabla de sesiones si no existe
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- Crear índices para la tabla de sesiones
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Comentario para la tabla de sesiones
COMMENT ON TABLE user_sessions IS 'Tabla para manejar sesiones y logout'; 