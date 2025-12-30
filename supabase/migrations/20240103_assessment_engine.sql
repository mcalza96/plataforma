-- Migración: Motor de Evaluación Diagnóstica
-- Fecha: 2024-01-03

-- 1. Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'probe_type_enum') THEN
        CREATE TYPE probe_type_enum AS ENUM ('multiple_choice_rationale', 'phenomenological_checklist');
    END IF;
END $$;

-- 2. Tabla diagnostic_probes
CREATE TABLE IF NOT EXISTS public.diagnostic_probes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES public.competency_nodes(id) ON DELETE CASCADE,
    type probe_type_enum NOT NULL,
    stem TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla probe_options
CREATE TABLE IF NOT EXISTS public.probe_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    probe_id UUID NOT NULL REFERENCES public.diagnostic_probes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    diagnoses_misconception_id UUID REFERENCES public.competency_nodes(id) ON DELETE SET NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.diagnostic_probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.probe_options ENABLE ROW LEVEL SECURITY;

-- Políticas para diagnostic_probes
DROP POLICY IF EXISTS "Probes are readable by everyone authenticated" ON public.diagnostic_probes;
CREATE POLICY "Probes are readable by everyone authenticated"
ON public.diagnostic_probes FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Admins and instructors can manage probes" ON public.diagnostic_probes;
CREATE POLICY "Admins and instructors can manage probes"
ON public.diagnostic_probes FOR ALL
TO authenticated
USING (
    public.role_is('admin'::public.app_role) OR 
    public.role_is('instructor'::public.app_role)
);

-- Políticas para probe_options
DROP POLICY IF EXISTS "Options are readable by everyone authenticated" ON public.probe_options;
CREATE POLICY "Options are readable by everyone authenticated"
ON public.probe_options FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Admins and instructors can manage options" ON public.probe_options;
CREATE POLICY "Admins and instructors can manage options"
ON public.probe_options FOR ALL
TO authenticated
USING (
    public.role_is('admin'::public.app_role) OR 
    public.role_is('instructor'::public.app_role)
);

-- 5. Índices
CREATE INDEX IF NOT EXISTS diagnostic_probes_competency_id_idx ON public.diagnostic_probes(competency_id);
CREATE INDEX IF NOT EXISTS probe_options_probe_id_idx ON public.probe_options(probe_id);
