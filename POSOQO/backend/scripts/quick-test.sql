-- Script rápido para agregar un producto de prueba
INSERT INTO categories (id, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cervezas', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, description, price, category_id, is_active, is_featured, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Cerveza de Prueba', 'Una cerveza de prueba para testing', 5.50, '550e8400-e29b-41d4-a716-446655440001', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_categories FROM categories;
