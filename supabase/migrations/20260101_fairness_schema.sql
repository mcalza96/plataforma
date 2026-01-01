-- 1. Enriquecer Perfil de Estudiante con Metadata de Equidad
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS demographic_group TEXT DEFAULT 'generic', -- e.g. 'Group A', 'Group B'
ADD COLUMN IF NOT EXISTS primary_language TEXT DEFAULT 'es',
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'desktop'; -- 'mobile', 'desktop', 'mixed'

-- 2. Crear Vista de Paridad de Remediación
-- Cruza los intentos de examen con los perfiles para analizar si la remediación es equitativa.
CREATE OR REPLACE VIEW vw_remediation_fairness AS
SELECT 
    p.demographic_group,
    p.access_type,
    ea.exam_config_id,
    -- Contar cuántas mutaciones de 'INSERT_NODE' (Refutación) se aplicaron
    COUNT(CASE WHEN m.value->>'action' = 'INSERT_NODE' THEN 1 END) as refutation_count,
    -- Contar total de intentos
    COUNT(DISTINCT ea.id) as total_attempts,
    -- Tasa de Refutación por Grupo
    ROUND(
        COUNT(CASE WHEN m.value->>'action' = 'INSERT_NODE' THEN 1 END)::numeric / 
        GREATEST(COUNT(DISTINCT ea.id), 1), 2
    ) as refutation_rate
FROM 
    public.exam_attempts ea
JOIN 
    public.profiles p ON ea.learner_id = p.id
LEFT JOIN 
    jsonb_array_elements(ea.applied_mutations) m ON true
GROUP BY 
    p.demographic_group, 
    p.access_type, 
    ea.exam_config_id;

-- 3. Políticas de Seguridad (RLS) para proteger datos demográficos
-- Solo el usuario puede ver su propia demografía, o un admin.
-- (Asumiendo que profiles ya tiene RLS, solo reforzamos si es necesario o si demographic_group es sensible)
-- En general, las policies de profiles existentes cubren SELECT para el dueño y admin.
