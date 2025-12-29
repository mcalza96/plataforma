-- ========================================================
-- SCRIPT DE REPARACIÓN INTEGRAL V2 (COLUMNAS + RLS + RECURSIÓN)
-- ========================================================

-- 1. FUNCIÓN AUXILIAR PARA EVITAR RECURSIÓN EN RLS
-- Esta función chequea si el usuario es admin sin disparar políticas RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. REPARACIÓN DE TABLA 'COURSES'
DO $$ 
BEGIN 
    -- Columnas de contenido
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='courses' AND COLUMN_NAME='category') THEN
        ALTER TABLE public.courses ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='courses' AND COLUMN_NAME='is_published') THEN
        ALTER TABLE public.courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Columnas de auditoría (Faltantes según el último error)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='courses' AND COLUMN_NAME='created_at') THEN
        ALTER TABLE public.courses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='courses' AND COLUMN_NAME='updated_at') THEN
        ALTER TABLE public.courses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- RLS para 'courses' (Usando la nueva función is_admin)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Cualquier usuario puede ver cursos" ON public.courses;

CREATE POLICY "Cualquier usuario puede ver cursos" 
ON public.courses FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage courses" 
ON public.courses FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3. REPARACIÓN DE TABLA 'LESSONS'
DO $$ 
BEGIN 
    -- Columnas de contenido
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='lessons' AND COLUMN_NAME='description') THEN
        ALTER TABLE public.lessons ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='lessons' AND COLUMN_NAME='thumbnail_url') THEN
        ALTER TABLE public.lessons ADD COLUMN thumbnail_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='lessons' AND COLUMN_NAME='download_url') THEN
        ALTER TABLE public.lessons ADD COLUMN download_url TEXT;
    END IF;

    -- Columnas de auditoría
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='lessons' AND COLUMN_NAME='created_at') THEN
        ALTER TABLE public.lessons ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='lessons' AND COLUMN_NAME='updated_at') THEN
        ALTER TABLE public.lessons ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- RLS para 'lessons'
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Cualquier usuario puede ver lecciones" ON public.lessons;

CREATE POLICY "Cualquier usuario puede ver lecciones" 
ON public.lessons FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage lessons" 
ON public.lessons FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 4. REPARACIÓN DE TABLA 'LEARNER_PROGRESS'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='learner_progress' AND COLUMN_NAME='last_watched_at') THEN
        ALTER TABLE public.learner_progress ADD COLUMN last_watched_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 5. FIX DE RECURSIÓN INFINITA EN 'PROFILES'
-- Reemplazamos las políticas que causaban recursión con la función is_admin()
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own or admins all" ON public.profiles;
CREATE POLICY "Users can view own or admins all" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Los padres pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own or admins all" ON public.profiles;

CREATE POLICY "Users can update own or admins all" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());


-- 5. RECARGA DE CACHÉ
COMMENT ON TABLE public.courses IS 'v2_fix_final';
COMMENT ON TABLE public.lessons IS 'v2_fix_final';
COMMENT ON TABLE public.profiles IS 'v2_fix_final';
