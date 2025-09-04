-- Notificaciones de prueba para el sistema

-- Notificaciones para admin (user_id = NULL)
INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) VALUES
('11111111-1111-1111-1111-111111111111', NULL, 'order', 'Nuevo pedido recibido', 'Pedido #12345 ha sido recibido', false, NOW() - INTERVAL '5 minutes'),
('22222222-2222-2222-2222-222222222222', NULL, 'user', 'Nuevo usuario registrado', 'Juan Pérez se ha registrado', false, NOW() - INTERVAL '10 minutes'),
('33333333-3333-3333-3333-333333333333', NULL, 'product', 'Stock bajo', 'Cerveza IPA tiene stock bajo', false, NOW() - INTERVAL '15 minutes'),
('44444444-4444-4444-4444-444444444444', NULL, 'system', 'Mantenimiento programado', 'Sistema en mantenimiento mañana', false, NOW() - INTERVAL '20 minutes'),
('55555555-5555-5555-5555-555555555555', NULL, 'order', 'Pedido entregado', 'Pedido #12340 ha sido entregado', true, NOW() - INTERVAL '1 hour');

-- Notificaciones para usuarios normales (reemplaza USER_ID con IDs reales de usuarios)
-- INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) VALUES
-- ('66666666-6666-6666-6666-666666666666', 'USER_ID_1', 'order', 'Tu pedido está listo', 'Tu pedido #12345 está listo para recoger', false, NOW() - INTERVAL '5 minutes'),
-- ('77777777-7777-7777-7777-777777777777', 'USER_ID_1', 'system', 'Bienvenido a POSOQO', 'Gracias por registrarte en POSOQO', false, NOW() - INTERVAL '1 day'),
-- ('88888888-8888-8888-8888-888888888888', 'USER_ID_2', 'order', 'Pedido en camino', 'Tu pedido #12346 está en camino', false, NOW() - INTERVAL '30 minutes'); 