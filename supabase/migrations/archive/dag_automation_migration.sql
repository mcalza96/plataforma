-- Migración: Automatización del DAG y Lógica de Desbloqueo (Anti-Spoiler)

-- 1. Extender el estado de los nodos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'node_status') THEN
        CREATE TYPE public.node_status AS ENUM ('locked', 'available', 'completed', 'mastered');
    END IF;
END $$;

-- 2. Actualizar tabla path_nodes
ALTER TABLE public.path_nodes 
ADD COLUMN IF NOT EXISTS status public.node_status DEFAULT 'locked';

-- Migrar datos existentes (opcional)
UPDATE public.path_nodes SET status = 'completed' WHERE is_completed = true AND status = 'locked';

-- 3. Función para obtener la Frontera de Aprendizaje (Nodos desbloqueables)
-- Identifica nodos que están locked pero cuyos padres están mastered o completed.
CREATE OR REPLACE FUNCTION public.get_student_frontier(p_learner_id UUID)
RETURNS SETOF public.path_nodes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.path_nodes n
    WHERE n.learner_id = p_learner_id
    AND n.status = 'locked'
    AND (
        n.parent_node_id IS NULL -- Es un nodo raíz
        OR EXISTS (
            SELECT 1 FROM public.path_nodes p
            WHERE p.id = n.parent_node_id
            AND p.status IN ('completed', 'mastered')
        )
    );
END;
$$;

-- 4. Trigger de Desbloqueo Automático
-- Cuando un nodo pasa a 'completed' o 'mastered', sus hijos elegibles pasan a 'available'.
CREATE OR REPLACE FUNCTION public.handle_node_mastery()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el nodo se marca como completado/masterizado
    IF (NEW.status IN ('completed', 'mastered')) THEN
        -- Actualizar hijos que ahora tienen sus prerrequisitos cumplidos
        UPDATE public.path_nodes
        SET status = 'available',
            unlocked_at = NOW()
        WHERE parent_node_id = NEW.id
        AND status = 'locked';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_node_mastery ON public.path_nodes;
CREATE TRIGGER on_node_mastery
    AFTER UPDATE OF status ON public.path_nodes
    FOR EACH ROW
    WHEN (NEW.status != OLD.status)
    EXECUTE PROCEDURE public.handle_node_mastery();

-- 5. Lógica Anti-Spoiler (RLS Reforzado)
-- El alumno solo puede ver nodos que no estén 'locked'.
DROP POLICY IF EXISTS "Learners can only see unlocked nodes" ON public.path_nodes;
CREATE POLICY "Learners can only see unlocked nodes" ON public.path_nodes
FOR SELECT
TO authenticated
USING (
    (status != 'locked') OR 
    public.role_is('instructor'::public.app_role) OR 
    public.is_admin() OR
    -- Los padres pueden ver todo lo de sus hijos para supervisar
    (learner_id IN (SELECT id FROM public.learners WHERE parent_id = auth.uid()))
);

-- 6. Índices para performance en consultas recursivas/frontera
CREATE INDEX IF NOT EXISTS idx_path_nodes_status ON public.path_nodes(status);
CREATE INDEX IF NOT EXISTS idx_path_nodes_learner_status ON public.path_nodes(learner_id, status);
