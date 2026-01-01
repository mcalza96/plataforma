
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const EXAM_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';

async function debug() {
    console.log(`Checking attempts for exam: ${EXAM_ID}`);

    const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('id, learner_id, status, started_at, finished_at')
        .eq('exam_config_id', EXAM_ID);

    if (error) {
        console.error("Error fetching attempts:", error);
        return;
    }

    if (!attempts || attempts.length === 0) {
        console.log("No attempts found for this exam ID.");

        // Let's check if the exam even exists
        const { data: exam } = await supabase.from('exams').select('id, title').eq('id', EXAM_ID).single();
        if (exam) {
            console.log(`Exam exists: ${exam.title}`);
        } else {
            console.log("Exam NOT found.");
        }
        return;
    }

    console.log(`Found ${attempts.length} attempts:`);
    console.table(attempts);
}

debug();
