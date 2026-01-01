
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const EXAM_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';

async function check() {
    console.log(`Checking results_cache for exam: ${EXAM_ID}`);

    const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('id, status, results_cache')
        .eq('exam_config_id', EXAM_ID);

    if (error) {
        console.error("Error fetching attempts:", error);
        return;
    }

    attempts.forEach(a => {
        console.log(`Attempt ${a.id}:`);
        console.log(` - Status: ${a.status}`);
        console.log(` - Has Cache: ${!!a.results_cache}`);
        if (a.results_cache) {
            console.log(` - Competency Diagnoses: ${!!(a.results_cache as any).competencyDiagnoses}`);
            if (!(a.results_cache as any).competencyDiagnoses) {
                console.log(" - Cache Content:", JSON.stringify(a.results_cache, null, 2));
            }
        }
    });
}

check();
