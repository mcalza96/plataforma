
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const EXAM_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';

async function check() {
    console.log(`Checking answers for exam: ${EXAM_ID}`);

    const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('id, current_state, status, results_cache')
        .eq('exam_config_id', EXAM_ID);

    if (error) {
        console.error("Error fetching attempts:", error);
        return;
    }

    attempts.forEach(a => {
        console.log(`Attempt ${a.id}:`);
        console.log(` - Status: ${a.status}`);
        console.log(` - Answers:`, JSON.stringify(a.current_state));
        console.log(` - Score:`, (a.results_cache as any)?.overallScore);
    });
}

check();
