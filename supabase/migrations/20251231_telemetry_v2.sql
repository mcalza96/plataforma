-- Migration: Telemetry V2 (Forensic Log & Results Cache)
-- Description: Adds results_cache to exam_attempts and creates the telemetry_logs table for long-term behavioral analysis.

-- 1. Ensure the exam_attempts table has the results_cache column
ALTER TABLE exam_attempts 
ADD COLUMN IF NOT EXISTS results_cache JSONB DEFAULT '{}'::jsonb;

-- 2. Create telemetry_logs table (The Forensic Log)
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    event_type telemetry_event_type NOT NULL,
    payload JSONB NOT NULL, -- { "time_on_task": 1200, "hesitation": true ... }
    
    CONSTRAINT fk_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
);

-- 3. Performance Indexes for Forensic Analysis
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_attempt ON telemetry_logs(attempt_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_type ON telemetry_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_timestamp ON telemetry_logs(timestamp);

-- 4. Enable RLS
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for telemetry_logs
-- Only the owner of the exam_attempt can insert or view these logs
CREATE POLICY "Learners can view telemetry_logs of their own attempts" 
    ON telemetry_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM exam_attempts 
            WHERE exam_attempts.id = telemetry_logs.attempt_id 
            AND exam_attempts.learner_id = auth.uid()
        )
    );

CREATE POLICY "Learners can insert telemetry_logs for their own attempts" 
    ON telemetry_logs FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_attempts 
            WHERE exam_attempts.id = attempt_id 
            AND exam_attempts.learner_id = auth.uid()
        )
    );

-- 6. Cleanup (Optional: If migrating from telemetry_events)
-- COMMENTED OUT to avoid data loss during the transition.
-- DROP TABLE IF EXISTS telemetry_events;
