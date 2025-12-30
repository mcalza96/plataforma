-- Migration: Create ai_usage_logs table
-- Timestamp: 20251230163000

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    model TEXT NOT NULL, -- e.g., 'gemini-1.5-pro', 'gpt-4'
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost_estimated NUMERIC(10, 6), -- Store with high precision
    feature_used TEXT NOT NULL, -- e.g., 'diagnostic', 'chat'
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Index for faster querying by user and date
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_timestamp ON public.ai_usage_logs(user_id, timestamp);

-- RLS Policies
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all logs" ON public.ai_usage_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() 
            AND public.profiles.role = 'admin'
        )
    );

-- System can insert logs (Service Role usually bypasses RLS, but just in case)
-- or if authenticated users trigger it directly (security risk? better via server action which uses service role or admin context)
-- We'll assume inserts happen via server actions with appropriate permissions.
