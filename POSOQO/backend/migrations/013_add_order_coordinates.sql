-- ========================================
-- Migración: Agregar coordenadas a pedidos
-- ========================================

-- Agregar campos de coordenadas a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);

-- Crear índices para las coordenadas
CREATE INDEX IF NOT EXISTS idx_orders_coordinates ON orders(lat, lng);

-- Comentarios para documentación
COMMENT ON COLUMN orders.lat IS 'Latitud de la ubicación de entrega';
COMMENT ON COLUMN orders.lng IS 'Longitud de la ubicación de entrega'; 