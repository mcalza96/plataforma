-- ========================================================
-- JIT DATA ANALYTICS - SCHEMA MAESTRO CONSOLIDADO
-- ========================================================

-- 1. EXTENSIONES Y FUNCIONES AUXILIARES
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. ROLES Y SEGURIDAD BASE
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

-- 3. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'family',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or admins all" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own or admins all" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. TABLA DE ALUMNOS (LEARNERS)
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

CREATE POLICY "Los padres pueden ver sus propios alumnos" 
ON public.learners FOR SELECT 
USING (auth.uid() = parent_id OR public.is_admin());

CREATE POLICY "Los padres pueden gestionar sus propios alumnos" 
ON public.learners FOR ALL
USING (auth.uid() = parent_id OR public.is_admin());

-- 5. MOTOR DE COMPETENCIAS (KNOWLEDGE GRAPH)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'node_type_enum') THEN
        CREATE TYPE node_type_enum AS ENUM ('competency', 'misconception', 'bridge');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relation_type_enum') THEN
        CREATE TYPE relation_type_enum AS ENUM ('prerequisite', 'misconception_of', 'remedies');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'path_node_status_enum') THEN
        CREATE TYPE path_node_status_enum AS ENUM ('locked', 'available', 'completed', 'infected');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.competency_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    embedding vector(1536),
    node_type node_type_enum NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.competency_edges (
    source_id UUID REFERENCES public.competency_nodes(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.competency_nodes(id) ON DELETE CASCADE,
    relation_type relation_type_enum NOT NULL,
    weight FLOAT DEFAULT 1.0,
    PRIMARY KEY (source_id, target_id, relation_type)
);

ALTER TABLE public.competency_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public nodes are readable by all"
ON public.competency_nodes FOR SELECT
TO authenticated, anon
USING (created_by IS NULL OR public.is_admin());

CREATE POLICY "Users can manage their own private nodes"
ON public.competency_nodes FOR ALL
TO authenticated
USING (auth.uid() = created_by OR public.is_admin())
WITH CHECK (auth.uid() = created_by OR public.is_admin());

-- 6. MOTOR DE EVALUACIÓN DIAGNÓSTICA
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'probe_type_enum') THEN
        CREATE TYPE probe_type_enum AS ENUM ('multiple_choice_rationale', 'phenomenological_checklist');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.diagnostic_probes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES public.competency_nodes(id) ON DELETE CASCADE,
    type probe_type_enum NOT NULL,
    stem TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.probe_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    probe_id UUID NOT NULL REFERENCES public.diagnostic_probes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    diagnoses_misconception_id UUID REFERENCES public.competency_nodes(id) ON DELETE SET NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.diagnostic_probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.probe_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Probes are readable by everyone authenticated"
ON public.diagnostic_probes FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage probes"
ON public.diagnostic_probes FOR ALL TO authenticated USING (public.is_admin());

-- 7. TABLA DE CURSOS Y LECCIONES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  level_required INT DEFAULT 1,
  category TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  teacher_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  download_url TEXT,
  "order" INT NOT NULL DEFAULT 0,
  total_steps INT NOT NULL DEFAULT 5,
  parent_node_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier usuario puede ver cursos" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Cualquier usuario puede ver lecciones" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL TO authenticated USING (public.is_admin());

-- 8. PROGRESO Y LOGS
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

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    model TEXT NOT NULL,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost_estimated NUMERIC(10, 6),
    feature_used TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestion de progreso" 
ON public.learner_progress FOR ALL 
USING (learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid() OR public.is_admin()));

CREATE POLICY "Admins can view all logs" ON public.ai_usage_logs 
FOR SELECT USING (public.is_admin());

-- 9. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'family')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
