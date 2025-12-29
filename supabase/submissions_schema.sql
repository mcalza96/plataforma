-- TABLA DE ENTREGAS (PORTFOLIO)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS: Los alumnos ven sus propias entregas o las públicas
CREATE POLICY "Los alumnos ven sus propias entregas" 
ON public.submissions FOR SELECT 
USING (
  learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
  OR is_public = TRUE
);

CREATE POLICY "Los padres pueden subir entregas para sus alumnos" 
ON public.submissions FOR INSERT 
WITH CHECK (
  learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
);

CREATE POLICY "Los padres pueden borrar entregas de sus alumnos" 
ON public.submissions FOR DELETE 
USING (
  learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
);

