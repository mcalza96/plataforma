-- Migración: Laboratorio de Copiloto - Tabla de Path Nodes (Caminos Personalizados)

-- 1. Crear la tabla path_nodes
-- Esta tabla almacena la ruta de aprendizaje específica "instanciada" para un alumno
CREATE TABLE IF NOT EXISTS public.path_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content_library(id) ON DELETE RESTRICT,
    
    -- Overrides para personalización (CoW)
    title_override TEXT,
    description_override TEXT,
    
    -- Posicionamiento en el Grafo (DAG)
    "order" INT NOT NULL DEFAULT 0,
    parent_node_id UUID REFERENCES public.path_nodes(id) ON DELETE SET NULL,
    
    -- Metadatos de estado
    is_completed BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.path_nodes ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
-- Los padres pueden ver los nodos de sus hijos
CREATE POLICY "Parents can view their children path nodes" ON public.path_nodes
FOR SELECT
TO authenticated
USING (
    learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid())
);

-- Los maestros y admins pueden gestionar los nodos
CREATE POLICY "Instructors and admins can manage path nodes" ON public.path_nodes
FOR ALL
TO authenticated
USING (
    public.role_is('instructor'::public.app_role) OR 
    public.is_admin()
)
WITH CHECK (
    public.role_is('instructor'::public.app_role) OR 
    public.is_admin()
);

-- 4. Índices para rendimiento
CREATE INDEX IF NOT EXISTS path_nodes_learner_id_idx ON public.path_nodes(learner_id);
CREATE INDEX IF NOT EXISTS path_nodes_parent_node_id_idx ON public.path_nodes(parent_node_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_path_nodes_updated_at
    BEFORE UPDATE ON public.path_nodes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
