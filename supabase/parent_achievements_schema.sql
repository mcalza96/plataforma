-- TABLA DE LOGROS (INSIGNIAS)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL, -- Material Symbols name
  level_required INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELACIÓN ALUMNO-LOGROS
CREATE TABLE IF NOT EXISTS public.learner_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, achievement_id)
);

-- TABLA DE FEEDBACK / MENSAJES DEL PROFESOR
CREATE TABLE IF NOT EXISTS public.feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL, -- e.g., 'Instructor Sarah'
  content TEXT NOT NULL,
  is_read_by_parent BOOLEAN DEFAULT FALSE,
  is_read_by_learner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver logros" ON public.achievements FOR SELECT USING (TRUE);

CREATE POLICY "Padres ven logros de sus alumnos" ON public.learner_achievements FOR SELECT 
USING (learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid()));

CREATE POLICY "Padres ven mensajes de sus alumnos" ON public.feedback_messages FOR SELECT 
USING (parent_id = auth.uid());

-- Insertar algunos logros iniciales
INSERT INTO public.achievements (title, description, icon_name, level_required) VALUES
('Primer Trazo', 'Has completado tu primera lección', 'draw', 1),
('Explorador de Capas', 'Dominas el uso de capas en Procreate', 'layers', 3),
('Maestro del Color', 'Has completado 5 lecciones de teoría del color', 'palette', 5),
('Artista Veloz', 'Has subido 3 videos time-lapse a tu galería', 'auto_awesome', 4)
ON CONFLICT DO NOTHING;

