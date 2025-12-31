-- Migration: Security Hardening (UBB Launch)
-- Description: Reinforces RLS for attempts and telemetry, allows instructors to see all, and prevents editing published exams.

-- 1. Helper for Instructor Role
-- Note: 'public.is_admin()' already exists in previous migrations, 
-- but we'll add an 'is_instructor()' or check both for broader coverage.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role IN ('admin', 'instructor'))
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. exam_attempts: Strict Ownership & Staff View
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners can view their own attempts" ON public.exam_attempts;
CREATE POLICY "Learners can view their own attempts"
ON public.exam_attempts FOR SELECT
TO authenticated
USING (auth.uid() = learner_id OR public.is_staff());

DROP POLICY IF EXISTS "Learners can insert their own attempts" ON public.exam_attempts;
CREATE POLICY "Learners can insert their own attempts"
ON public.exam_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = learner_id);

DROP POLICY IF EXISTS "Learners can update their own attempts" ON public.exam_attempts;
CREATE POLICY "Learners can update their own attempts"
ON public.exam_attempts FOR UPDATE
TO authenticated
USING (auth.uid() = learner_id)
WITH CHECK (auth.uid() = learner_id);

-- 3. telemetry_events: Strict Ownership & Staff View
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners can view telemetry of their own attempts" ON public.telemetry_events;
CREATE POLICY "Learners can view telemetry of their own attempts"
ON public.telemetry_events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.exam_attempts 
        WHERE public.exam_attempts.id = telemetry_events.attempt_id 
        AND (public.exam_attempts.learner_id = auth.uid() OR public.is_staff())
    )
);

DROP POLICY IF EXISTS "Learners can insert telemetry for their own attempts" ON public.telemetry_events;
CREATE POLICY "Learners can insert telemetry for their own attempts"
ON public.telemetry_events FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.exam_attempts 
        WHERE public.exam_attempts.id = attempt_id 
        AND public.exam_attempts.learner_id = auth.uid()
    )
);

-- 4. Inmutability: Prevent editing published exams
CREATE OR REPLACE FUNCTION public.check_exam_inmutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'PUBLISHED' AND (NEW.config_json <> OLD.config_json OR NEW.questions <> OLD.questions) THEN
        RAISE EXCEPTION 'Cannot modify a PUBLISHED exam. Create a new version instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exam_inmutability ON public.exams;
CREATE TRIGGER trg_exam_inmutability
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.check_exam_inmutability();

-- 5. Audit logs for critical updates (Optional but recommended)
-- Just adding an index for faster lookups during audit
CREATE INDEX IF NOT EXISTS idx_exam_attempts_finished ON public.exam_attempts(finished_at) WHERE status = 'COMPLETED';
