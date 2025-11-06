-- ========================================
-- Migración: Raffle Subscriptions (Suscripciones al Sorteo)
-- ========================================
-- Tabla para almacenar las suscripciones al sorteo mensual de "Chela Gratis"

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de suscripciones al sorteo
CREATE TABLE IF NOT EXISTS raffle_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    edad INTEGER NOT NULL CHECK (edad >= 18),
    numero_participacion INTEGER NOT NULL,
    mes_sorteo VARCHAR(7) NOT NULL, -- Formato: YYYY-MM (ej: 2025-11)
    is_winner BOOLEAN DEFAULT FALSE,
    prize_level VARCHAR(20), -- 'first', 'second', 'third', 'consolation'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Evitar duplicados por email en el mismo mes
    UNIQUE(email, mes_sorteo)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_raffle_subscriptions_mes_sorteo ON raffle_subscriptions(mes_sorteo);
CREATE INDEX IF NOT EXISTS idx_raffle_subscriptions_email ON raffle_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_raffle_subscriptions_is_winner ON raffle_subscriptions(is_winner);
CREATE INDEX IF NOT EXISTS idx_raffle_subscriptions_numero_participacion ON raffle_subscriptions(numero_participacion);

-- Crear trigger para actualizar updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_raffle_subscriptions_updated_at') THEN
        CREATE TRIGGER update_raffle_subscriptions_updated_at 
            BEFORE UPDATE ON raffle_subscriptions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Comentarios
COMMENT ON TABLE raffle_subscriptions IS 'Suscripciones al sorteo mensual de cervezas gratis';
COMMENT ON COLUMN raffle_subscriptions.numero_participacion IS 'Número único de participación generado automáticamente';
COMMENT ON COLUMN raffle_subscriptions.mes_sorteo IS 'Mes del sorteo en formato YYYY-MM';
COMMENT ON COLUMN raffle_subscriptions.is_winner IS 'Indica si el participante es ganador';
COMMENT ON COLUMN raffle_subscriptions.prize_level IS 'Nivel del premio: first, second, third, consolation';

-- ========================================
-- Tabla de Configuración de Sorteos
-- ========================================
-- Tabla para configurar los sorteos mensuales (premios, fechas, descripciones)

-- Crear tabla de configuración de sorteos
CREATE TABLE IF NOT EXISTS raffles_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mes_sorteo VARCHAR(7) NOT NULL UNIQUE, -- Formato: YYYY-MM (ej: 2025-11)
    titulo VARCHAR(200) NOT NULL DEFAULT 'Sorteo Mensual POSOQO',
    descripcion TEXT,
    fecha_sorteo DATE NOT NULL, -- Fecha del sorteo
    hora_sorteo TIME DEFAULT '20:00:00', -- Hora del sorteo
    is_active BOOLEAN DEFAULT TRUE, -- Si el sorteo está activo
    premio_primero VARCHAR(200) DEFAULT 'Caja de 12 Cervezas',
    premio_segundo VARCHAR(200) DEFAULT 'Pack de 6 Cervezas',
    premio_tercero VARCHAR(200) DEFAULT 'Pack de 3 Cervezas',
    premio_consuelo VARCHAR(200) DEFAULT '1 Cerveza + Descuento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para configuración
CREATE INDEX IF NOT EXISTS idx_raffles_config_mes_sorteo ON raffles_config(mes_sorteo);
CREATE INDEX IF NOT EXISTS idx_raffles_config_is_active ON raffles_config(is_active);
CREATE INDEX IF NOT EXISTS idx_raffles_config_fecha_sorteo ON raffles_config(fecha_sorteo);

-- Crear trigger para actualizar updated_at en configuración
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_raffles_config_updated_at') THEN
        CREATE TRIGGER update_raffles_config_updated_at 
            BEFORE UPDATE ON raffles_config 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insertar configuración por defecto para el mes actual
INSERT INTO raffles_config (mes_sorteo, titulo, descripcion, fecha_sorteo, hora_sorteo, is_active)
SELECT 
    TO_CHAR(CURRENT_DATE, 'YYYY-MM') as mes_sorteo,
    'Sorteo Mensual POSOQO - ' || TO_CHAR(CURRENT_DATE, 'Month YYYY') as titulo,
    'Participa en nuestro sorteo mensual de cervezas artesanales POSOQO. La participación es completamente gratuita.' as descripcion,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE as fecha_sorteo,
    '20:00:00'::TIME as hora_sorteo,
    TRUE as is_active
WHERE NOT EXISTS (
    SELECT 1 FROM raffles_config WHERE mes_sorteo = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
);

-- Comentarios para configuración
COMMENT ON TABLE raffles_config IS 'Configuración de sorteos mensuales';
COMMENT ON COLUMN raffles_config.mes_sorteo IS 'Mes del sorteo en formato YYYY-MM';
COMMENT ON COLUMN raffles_config.fecha_sorteo IS 'Fecha específica del sorteo';
COMMENT ON COLUMN raffles_config.is_active IS 'Indica si el sorteo está activo y acepta suscripciones';

