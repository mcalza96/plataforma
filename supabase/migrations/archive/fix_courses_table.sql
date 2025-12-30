-- 1. Añadir columna 'category' si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='courses' AND COLUMN_NAME='category') THEN
        ALTER TABLE public.courses ADD COLUMN category TEXT;
    END IF;
END $$;

-- 2. Añadir columna 'is_published' si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='courses' AND COLUMN_NAME='is_published') THEN
        ALTER TABLE public.courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Recargar el esquema de cache (esto ocurre automáticamente al alterar tablas, 
-- pero este comentario es un recordatorio por si el error persiste unos segundos)
COMMENT ON TABLE public.courses IS 'Tabla de cursos para la academia de arte';
