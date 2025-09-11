-- Script para actualizar el email del admin a tu correo personal
-- Reemplaza 'tu_email@ejemplo.com' con tu email real

-- Opción 1: Actualizar el usuario admin existente
UPDATE users 
SET email = 'tu_email@ejemplo.com' 
WHERE email = 'admin@posoqo.com';

-- Opción 2: Si quieres mantener ambos, crear un nuevo usuario admin con tu email
-- INSERT INTO users (name, last_name, dni, phone, email, password, role, email_verified) 
-- VALUES ('Admin', 'POSOQO', '12345679', '999888777', 'tu_email@ejemplo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true)
-- ON CONFLICT (email) DO NOTHING;

-- Verificar que el cambio se hizo correctamente
SELECT id, name, last_name, email, role, email_verified 
FROM users 
WHERE role = 'admin';
