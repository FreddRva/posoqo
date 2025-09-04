-- ========================================
-- Script: Actualizar órdenes existentes con ubicaciones descriptivas
-- ========================================

-- Actualizar órdenes que tienen "Ubicación no especificada"
UPDATE orders 
SET location = 'Dirección del cliente (actualizada)'
WHERE location = 'Ubicación no especificada';

-- Actualizar órdenes con ubicaciones muy cortas
UPDATE orders 
SET location = 'Ubicación de entrega del cliente'
WHERE location = 'jr';

-- Actualizar órdenes con ubicaciones con caracteres especiales
UPDATE orders 
SET location = 'Lima, Perú - Dirección del cliente'
WHERE location LIKE '%Perï¿½%';

-- Mostrar el resultado de las actualizaciones
SELECT 
    id,
    location,
    status,
    created_at
FROM orders 
ORDER BY created_at DESC; 