-- Migration: Exam Integration (The Bridge)
-- Description: Sets up the exams table and adds results_cache to attempts.

-- 1. exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    config_json JSONB DEFAULT '{}'::jsonb, -- The matrix (concepts/misconceptions)
    questions JSONB DEFAULT '[]'::jsonb,   -- The actual probes (Question[])
    status TEXT DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Update exam_attempts
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='exam_attempts' AND COLUMN_NAME='results_cache') THEN
        ALTER TABLE public.exam_attempts ADD COLUMN results_cache JSONB;
    END IF;
END $$;

-- 3. RLS for exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public exams are readable by anyone" ON public.exams;
CREATE POLICY "Public exams are readable by anyone" 
ON public.exams FOR SELECT 
TO authenticated
USING (status = 'PUBLISHED' OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;
CREATE POLICY "Admins can manage exams" 
ON public.exams FOR ALL
TO authenticated
USING (creator_id = auth.uid() OR public.is_admin());

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_exams_creator ON public.exams(creator_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);
