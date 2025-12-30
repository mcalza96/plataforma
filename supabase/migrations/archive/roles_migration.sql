-- 1. Crear el tipo ENUM para roles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'instructor', 'user');
    END IF;
END $$;

-- 2. Añadir la columna de rol a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'user' NOT NULL;

-- 3. Establecer el primer Super Administrador
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'marcelo.calzadilla@jitdata.cl';

-- 4. Actualizar Políticas RLS para la tabla profiles
-- Eliminar políticas antiguas si es necesario o simplemente añadir la nueva
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Asegurar que los instructores también tengan permisos de lectura si es necesario
-- (Opcional, según requerimientos futuros)
