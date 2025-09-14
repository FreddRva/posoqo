-- Agregar columna stock a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Crear índice para mejorar consultas de stock
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock) WHERE stock < 10 AND is_active = true;
