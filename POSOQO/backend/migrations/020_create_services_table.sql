-- ========================================
-- Migración: Create services table
-- ========================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de servicios (si no existe)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Si la tabla ya existe con columna price, agregar precio por defecto a los inserts
-- Verificar si existe la columna price y eliminarla si es necesario
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'price'
    ) THEN
        ALTER TABLE services DROP COLUMN price;
    END IF;
END $$;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);

-- Crear trigger para actualizar updated_at en services
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
        CREATE TRIGGER update_services_updated_at 
            BEFORE UPDATE ON services 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON TABLE services IS 'Tabla de servicios ofrecidos por POSOQO';
COMMENT ON COLUMN services.name IS 'Nombre del servicio';
COMMENT ON COLUMN services.description IS 'Descripción detallada del servicio (puede incluir viñetas)';
COMMENT ON COLUMN services.image_url IS 'URL de la imagen del servicio';
COMMENT ON COLUMN services.is_active IS 'Indica si el servicio está activo y disponible';

-- Insertar algunos servicios de ejemplo
INSERT INTO services (name, description, is_active) VALUES 
('Delivery Express', '• Entrega en 30 minutos o menos\n• Cobertura en toda la ciudad\n• Empaque ecológico\n• Seguimiento en tiempo real', true),
('Servicio Premium', '• Atención personalizada\n• Productos exclusivos\n• Empaque de lujo\n• Entrega programada', true),
('Catering Empresarial', '• Menús personalizados\n• Servicio completo\n• Personal especializado\n• Cobertura de eventos', true)
ON CONFLICT DO NOTHING;
