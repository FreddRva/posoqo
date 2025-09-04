-- Script para agregar campos de dirección a la tabla users
-- Ejecutar este script en la base de datos posoqo

-- Agregar columna address si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
END $$;

-- Agregar columna address_ref si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address_ref') THEN
        ALTER TABLE users ADD COLUMN address_ref TEXT;
    END IF;
END $$;

-- Agregar columna street_number si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'street_number') THEN
        ALTER TABLE users ADD COLUMN street_number TEXT;
    END IF;
END $$;

-- Agregar columna lat si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lat') THEN
        ALTER TABLE users ADD COLUMN lat DOUBLE PRECISION;
    END IF;
END $$;

-- Agregar columna lng si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lng') THEN
        ALTER TABLE users ADD COLUMN lng DOUBLE PRECISION;
    END IF;
END $$;

-- Mostrar la estructura actualizada de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 