-- Agregar campo is_featured a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
 
-- Crear índice para mejorar consultas de productos destacados
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category_featured ON products(category_id, is_featured); 