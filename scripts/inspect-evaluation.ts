
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const ATTEMPT_ID = 'feff7f95-7714-4dfb-a453-1e92a1bea588'; // Use one from previous log

async function inspect() {
    console.log(`Deep Inspection of Attempt: ${ATTEMPT_ID}`);

    const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('id', ATTEMPT_ID)
        .single();

    if (error) {
        console.error("Error fetching attempt:", error);
        return;
    }

    const { data: exam } = await supabase
        .from('exams')
        .select('*')
        .eq('id', attempt.exam_config_id)
        .single();

    console.log("--- RESULTS CACHE ---");
    console.log(JSON.stringify(attempt.results_cache, null, 2));

    console.log("\n--- CURRENT STATE (Answers) ---");
    console.log(JSON.stringify(attempt.current_state, null, 2));

    console.log("\n--- QUESTION STRUCTURE (First one) ---");
    const questions = attempt.config_snapshot?.questions || (attempt.exams as any)?.questions;
    if (questions && questions.length > 0) {
        console.log(JSON.stringify(questions[0], null, 2));
    } else {
        console.log("No questions found in snapshot or exam.");
    }
}

inspect();
