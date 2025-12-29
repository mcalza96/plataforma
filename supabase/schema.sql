-- TABLA DE PERFILES (PADRES)
-- Vinculada a auth.users para extender la información básica
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Los padres solo pueden ver y editar su propio perfil
CREATE POLICY "Los padres pueden ver su propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los padres pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- TABLA DE ALUMNOS (NIÑOS)
CREATE TABLE IF NOT EXISTS public.learners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  level INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;

-- RLS: Un padre solo puede ver y gestionar sus propios niños
CREATE POLICY "Los padres pueden ver sus propios alumnos" 
ON public.learners FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Los padres pueden crear sus propios alumnos" 
ON public.learners FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Los padres pueden actualizar sus propios alumnos" 
ON public.learners FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Los padres pueden eliminar sus propios alumnos" 
ON public.learners FOR DELETE 
USING (auth.uid() = parent_id);

-- TRIGGER PARA CREAR PERFIL AUTOMATICAMENTE
-- Opcional pero recomendado para que al registrarse el padre ya tenga su perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TABLA DE CURSOS
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  level_required INT DEFAULT 1,
  category TEXT, -- Personajes, Paisajes, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Cualquiera (autenticado) puede ver los cursos
CREATE POLICY "Cualquier usuario puede ver cursos" 
ON public.courses FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- TABLA DE LECCIONES
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  "order" INT NOT NULL DEFAULT 0,
  total_steps INT NOT NULL DEFAULT 5, -- Concepto LEGO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Cualquiera (autenticado) puede ver las lecciones
CREATE POLICY "Cualquier usuario puede ver lecciones" 
ON public.lessons FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- TABLA DE PROGRESO DEL ALUMNO
CREATE TABLE IF NOT EXISTS public.learner_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_steps INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, lesson_id)
);

ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;

-- RLS: Los padres pueden ver/gestionar el progreso de sus propios niños
CREATE POLICY "Los padres pueden ver el progreso de sus alumnos" 
ON public.learner_progress FOR SELECT 
USING (
  learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
);

CREATE POLICY "Los padres pueden gestionar el progreso de sus alumnos" 
ON public.learner_progress FOR ALL 
USING (
  learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
)
WITH CHECK (
  learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
);
