-- Migration: Exam Pipeline (Snapshot & Log)
-- Description: Creates the infrastructure for 'Double Writing' exam state and telemetry logs.

-- 1. ENUMs
DO $$ BEGIN
    CREATE TYPE exam_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE telemetry_event_type AS ENUM ('ANSWER_UPDATE', 'HESITATION', 'FOCUS_LOST', 'NAVIGATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. exam_attempts (The Snapshot - Fast Lane)
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL, -- References auth.users or a profiles table
    exam_config_id UUID NOT NULL, -- Reference to the exam definition
    current_state JSONB DEFAULT '{}'::jsonb, -- Snapshot: { "q1": "A", "q2": "SKIP" }
    status exam_status DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMPTZ DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now(),
    finished_at TIMESTAMPTZ,
    
    CONSTRAINT fk_learner FOREIGN KEY (learner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. telemetry_events (The Log - Slow Lane)
CREATE TABLE IF NOT EXISTS telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    event_type telemetry_event_type NOT NULL,
    payload JSONB NOT NULL, -- Details: { "qId": "q1", "value": "A", "time": 1200 }
    
    CONSTRAINT fk_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_exam_attempts_learner ON exam_attempts(learner_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_attempt ON telemetry_events(attempt_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_timestamp ON telemetry_events(timestamp);

-- 5. Row Level Security (RLS)
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policies for exam_attempts
CREATE POLICY "Learners can view their own attempts" 
    ON exam_attempts FOR SELECT 
    USING (auth.uid() = learner_id);

CREATE POLICY "Learners can insert their own attempts" 
    ON exam_attempts FOR INSERT 
    WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Learners can update their own attempts" 
    ON exam_attempts FOR UPDATE 
    USING (auth.uid() = learner_id);

-- Policies for telemetry_events
CREATE POLICY "Learners can view telemetry of their own attempts" 
    ON telemetry_events FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM exam_attempts 
            WHERE exam_attempts.id = telemetry_events.attempt_id 
            AND exam_attempts.learner_id = auth.uid()
        )
    );

CREATE POLICY "Learners can insert telemetry for their own attempts" 
    ON telemetry_events FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_attempts 
            WHERE exam_attempts.id = attempt_id 
            AND exam_attempts.learner_id = auth.uid()
        )
    );
