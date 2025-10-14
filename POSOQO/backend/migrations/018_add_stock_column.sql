-- ========================================
-- Migración: Agregar columna stock a products
-- ========================================

-- Agregar columna stock a la tabla products si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- Actualizar todos los productos existentes con stock = 100 por defecto
UPDATE products SET stock = 100 WHERE stock IS NULL OR stock = 0;

-- Crear índice para mejor rendimiento en consultas de stock
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Comentario para documentación
COMMENT ON COLUMN products.stock IS 'Cantidad disponible en stock del producto';
