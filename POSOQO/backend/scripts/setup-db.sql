-- ========================================
-- Script de configuración de base de datos
-- ========================================

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE posoqo'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'posoqo')\gexec

-- Conectar a la base de datos posoqo
\c posoqo;

-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de verificación de emails
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

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_used ON email_verifications(used);

-- Crear función para limpiar tokens expirados
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

CREATE TRIGGER update_email_verifications_updated_at 
    BEFORE UPDATE ON email_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- Insertar usuario admin de prueba
INSERT INTO users (name, last_name, dni, phone, email, password, role, email_verified) 
VALUES ('Admin', 'POSOQO', '12345678', '999888777', 'admin@posoqo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Mostrar mensaje de éxito
SELECT 'Base de datos POSOQO configurada correctamente' as status; 