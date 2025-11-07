-- ========================================
-- Migración: Add Stock Column to Products
-- ========================================

-- Agregar columna stock si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'stock'
    ) THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- Crear índice para stock
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Comentario
COMMENT ON COLUMN products.stock IS 'Cantidad disponible en stock del producto';

