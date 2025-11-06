-- ========================================
-- Migración: Make DNI Optional
-- ========================================
-- Hace el campo DNI opcional para permitir registro sin DNI
-- El DNI se puede completar después en el perfil del usuario

-- Eliminar el constraint UNIQUE del DNI si existe
DO $$ 
BEGIN
    -- Eliminar índice único si existe
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_dni') THEN
        DROP INDEX IF EXISTS idx_users_dni;
    END IF;
    
    -- Eliminar constraint UNIQUE si existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_dni_key' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_dni_key;
    END IF;
END $$;

-- Hacer el DNI nullable (permitir NULL)
ALTER TABLE users ALTER COLUMN dni DROP NOT NULL;

-- Crear índice único parcial solo para DNIs no vacíos
-- Esto permite múltiples valores NULL/vacíos pero mantiene unicidad para DNIs válidos
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_dni_unique 
ON users(dni) 
WHERE dni IS NOT NULL AND dni != '';

-- Actualizar comentario
COMMENT ON COLUMN users.dni IS 'DNI del usuario (opcional, se puede completar después del registro)';

