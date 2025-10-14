-- Agregar columna stock a la tabla products si no existe
DO $$
BEGIN
    -- Verificar si la columna stock existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'stock'
    ) THEN
        -- Agregar la columna stock
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
        
        -- Actualizar todos los productos existentes con stock = 0
        UPDATE products SET stock = 0 WHERE stock IS NULL;
        
        RAISE NOTICE 'Columna stock agregada exitosamente a la tabla products';
    ELSE
        RAISE NOTICE 'La columna stock ya existe en la tabla products';
    END IF;
END
$$;
