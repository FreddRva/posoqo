-- Agregar columnas de coordenadas a la tabla orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Agregar índice para búsquedas por ubicación (opcional, mejora el rendimiento)
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders (lat, lng);

