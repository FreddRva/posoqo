-- Script para agregar datos de prueba a POSOQO
-- ========================================

-- Agregar categorías
INSERT INTO categories (id, name, parent_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cervezas', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Comidas', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Bebidas', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Agregar subcategorías
INSERT INTO categories (id, name, parent_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Cervezas Artesanales', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Cervezas Importadas', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'Platos Principales', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'Entradas', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440031', 'Cócteles', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440032', 'Refrescos', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Agregar productos de cerveza
INSERT INTO products (id, name, description, price, image_url, category_id, subcategory, estilo, abv, ibu, color, is_active, is_featured, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Cerveza Artesanal IPA', 'Cerveza India Pale Ale con notas cítricas y amargas, perfecta para los amantes de las cervezas intensas.', 8.50, '/uploads/cerveza-ipa.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Cervezas Artesanales', 'IPA', '6.5%', '65', 'Dorado', true, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Cerveza Stout Negra', 'Cerveza stout con sabor a café y chocolate, cremosa y robusta.', 9.00, '/uploads/cerveza-stout.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Cervezas Artesanales', 'Stout', '7.2%', '45', 'Negro', true, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Cerveza Lager Dorada', 'Cerveza lager suave y refrescante, ideal para cualquier ocasión.', 6.50, '/uploads/cerveza-lager.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Cervezas Artesanales', 'Lager', '4.8%', '25', 'Dorado Claro', true, false, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Cerveza Wheat Ale', 'Cerveza de trigo con notas de plátano y clavo, suave y refrescante.', 7.50, '/uploads/cerveza-wheat.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Cervezas Artesanales', 'Wheat Ale', '5.2%', '15', 'Dorado Turbio', true, false, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Cerveza Porter', 'Cerveza porter con sabor a chocolate y café, perfecta para el invierno.', 8.00, '/uploads/cerveza-porter.jpg', '550e8400-e29b-41d4-a716-446655440001', 'Cervezas Artesanales', 'Porter', '6.8%', '35', 'Marrón Oscuro', true, false, NOW(), NOW());

-- Agregar productos de comida
INSERT INTO products (id, name, description, price, image_url, category_id, subcategory, estilo, abv, ibu, color, is_active, is_featured, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440011', 'Hamburguesa Artesanal', 'Hamburguesa con carne de res, queso cheddar, lechuga, tomate y salsa especial.', 12.50, '/uploads/hamburguesa.jpg', '550e8400-e29b-41d4-a716-446655440002', 'Platos Principales', 'Comida', '0%', '0', 'Marrón', true, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440012', 'Alitas de Pollo BBQ', 'Alitas de pollo marinadas en salsa BBQ, servidas con papas fritas.', 10.00, '/uploads/alitas.jpg', '550e8400-e29b-41d4-a716-446655440002', 'Platos Principales', 'Comida', '0%', '0', 'Marrón', true, false, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440013', 'Nachos con Queso', 'Tortillas de maíz con queso fundido, jalapeños y guacamole.', 8.50, '/uploads/nachos.jpg', '550e8400-e29b-41d4-a716-446655440002', 'Entradas', 'Comida', '0%', '0', 'Amarillo', true, false, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440014', 'Pizza Margherita', 'Pizza con tomate, mozzarella y albahaca fresca.', 15.00, '/uploads/pizza.jpg', '550e8400-e29b-41d4-a716-446655440002', 'Platos Principales', 'Comida', '0%', '0', 'Rojo', true, true, NOW(), NOW());

-- Agregar productos de bebidas
INSERT INTO products (id, name, description, price, image_url, category_id, subcategory, estilo, abv, ibu, color, is_active, is_featured, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440021', 'Cóctel Mojito', 'Cóctel refrescante con ron, menta, lima y soda.', 9.50, '/uploads/mojito.jpg', '550e8400-e29b-41d4-a716-446655440003', 'Cócteles', 'Bebida', '15%', '0', 'Verde', true, true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440022', 'Cóctel Margarita', 'Cóctel clásico con tequila, triple sec y lima.', 10.00, '/uploads/margarita.jpg', '550e8400-e29b-41d4-a716-446655440003', 'Cócteles', 'Bebida', '20%', '0', 'Amarillo', true, false, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440023', 'Coca Cola', 'Refresco de cola clásico.', 3.50, '/uploads/coca-cola.jpg', '550e8400-e29b-41d4-a716-446655440003', 'Refrescos', 'Bebida', '0%', '0', 'Negro', true, false, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440024', 'Agua Mineral', 'Agua mineral natural.', 2.00, '/uploads/agua.jpg', '550e8400-e29b-41d4-a716-446655440003', 'Refrescos', 'Bebida', '0%', '0', 'Transparente', true, false, NOW(), NOW());

-- Mostrar resumen
SELECT 
    'Categorías creadas:' as tipo, 
    COUNT(*) as cantidad 
FROM categories
UNION ALL
SELECT 
    'Productos creados:' as tipo, 
    COUNT(*) as cantidad 
FROM products;
