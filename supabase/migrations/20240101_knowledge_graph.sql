-- Migración: Motor de Competencias (Knowledge Graph)
-- Fecha: 2024-01-01

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Enums
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

-- 3. Tabla competency_nodes
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

-- 4. Tabla competency_edges (Relaciones)
CREATE TABLE IF NOT EXISTS public.competency_edges (
    source_id UUID REFERENCES public.competency_nodes(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.competency_nodes(id) ON DELETE CASCADE,
    relation_type relation_type_enum NOT NULL,
    weight FLOAT DEFAULT 1.0,
    PRIMARY KEY (source_id, target_id, relation_type)
);

-- 5. Actualización de path_nodes
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'path_nodes' AND table_schema = 'public') THEN
        -- Add column status if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'path_nodes' AND column_name = 'status') THEN
            ALTER TABLE public.path_nodes ADD COLUMN status path_node_status_enum DEFAULT 'locked';
            
            -- Migrate is_completed to status
            UPDATE public.path_nodes SET status = 'completed' WHERE is_completed = TRUE;
            UPDATE public.path_nodes SET status = 'available' WHERE is_completed = FALSE;
        END IF;
    END IF;
END $$;

-- 6. Row Level Security (RLS)
ALTER TABLE public.competency_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_edges ENABLE ROW LEVEL SECURITY;

-- Políticas para competency_nodes
DROP POLICY IF EXISTS "Public nodes are readable by all" ON public.competency_nodes;
CREATE POLICY "Public nodes are readable by all"
ON public.competency_nodes FOR SELECT
TO authenticated, anon
USING (created_by IS NULL);

DROP POLICY IF EXISTS "Users can manage their own private nodes" ON public.competency_nodes;
CREATE POLICY "Users can manage their own private nodes"
ON public.competency_nodes FOR ALL
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Políticas para competency_edges
DROP POLICY IF EXISTS "Edges are readable if source node is accessible" ON public.competency_edges;
CREATE POLICY "Edges are readable if source node is accessible"
ON public.competency_edges FOR SELECT
TO authenticated, anon
USING (
    EXISTS (
        SELECT 1 FROM public.competency_nodes 
        WHERE id = source_id 
        AND (created_by IS NULL OR created_by = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage edges for their own nodes" ON public.competency_edges;
CREATE POLICY "Users can manage edges for their own nodes"
ON public.competency_edges FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.competency_nodes 
        WHERE id = source_id AND created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.competency_nodes 
        WHERE id = source_id AND created_by = auth.uid()
    )
);

-- 7. Índices
CREATE INDEX IF NOT EXISTS competency_nodes_embedding_idx ON public.competency_nodes USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS competency_edges_source_target_idx ON public.competency_edges(source_id, target_id);
