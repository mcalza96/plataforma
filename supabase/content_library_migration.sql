-- Migración: Cantera de Ladrillos (Content Library) con Búsqueda Vectorial

-- 1. Activar la extensión pgvector para el esquema public
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Crear el tipo ENUM para la Taxonomía de Bloom
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bloom_level') THEN
        CREATE TYPE bloom_level AS ENUM (
            'Recordar', 
            'Comprender', 
            'Aplicar', 
            'Analizar', 
            'Evaluar', 
            'Crear'
        );
    END IF;
END $$;

-- 3. Crear la tabla Content Library
CREATE TABLE IF NOT EXISTS public.content_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'quiz', 'text')),
    payload JSONB NOT NULL, -- Datos específicos según tipo (url, questions, content)
    metadata JSONB DEFAULT '{}'::jsonb, -- Taxonomía de Bloom, duración, etc.
    embedding vector(1536), -- Para búsqueda semántica con OpenAI o similar
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS

-- Los usuarios autenticados pueden leer contenido público
DROP POLICY IF EXISTS "Public content is visible to everyone" ON public.content_library;
CREATE POLICY "Public content is visible to everyone" ON public.content_library
FOR SELECT
TO authenticated
USING (is_public = true OR created_by = auth.uid() OR public.is_admin());

-- Los instructores y admins pueden crear contenido
DROP POLICY IF EXISTS "Instructors can create content" ON public.content_library;
CREATE POLICY "Instructors can create content" ON public.content_library
FOR INSERT
TO authenticated
WITH CHECK (
    public.role_is('instructor'::public.app_role) OR 
    public.is_admin()
);

-- Los creadores y admins pueden actualizar/eliminar su contenido
DROP POLICY IF EXISTS "Creators can manage their own content" ON public.content_library;
CREATE POLICY "Creators can manage their own content" ON public.content_library
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR public.is_admin())
WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- 6. Índices para búsqueda vectorial
-- Usamos el índice HNSW para mayor velocidad en búsquedas de proximidad
CREATE INDEX IF NOT EXISTS content_library_embedding_idx ON public.content_library 
USING hnsw (embedding vector_cosine_ops);

-- 7. Función RPC para búsqueda por proximidad
CREATE OR REPLACE FUNCTION match_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  payload JSONB,
  metadata JSONB,
  is_public BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    content_library.id,
    content_library.title,
    content_library.description,
    content_library.type,
    content_library.payload,
    content_library.metadata,
    content_library.is_public,
    content_library.created_by,
    content_library.created_at,
    1 - (content_library.embedding <=> query_embedding) AS similarity
  FROM content_library
  WHERE matches_threshold(1 - (content_library.embedding <=> query_embedding), match_threshold)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Función auxiliar para el umbral (opcional, simplifica el WHERE)
CREATE OR REPLACE FUNCTION matches_threshold(similarity float, threshold float)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN similarity >= threshold;
END;
$$ LANGUAGE plpgsql;
