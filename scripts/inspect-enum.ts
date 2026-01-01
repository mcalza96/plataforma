
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data: realAttempts } = await supabase.from('exam_attempts').select('*').limit(1);
    const attempt = realAttempts?.[0];
    console.log("Attempt columns:", Object.keys(attempt || {}));
    console.log("Attempt content:", JSON.stringify(attempt, null, 2));

    if (!attempt) {
        console.log("No attempts found to test.");
        return;
    }

    const testValues = ['PUBLISHED', 'published', 'DRAFT', 'draft'];
    for (const val of testValues) {
        const { error } = await supabase.from('exams').update({ status: val }).eq('id', attempt.id);
        if (error) {
            console.log(`Value '${val}' got error: ${error.message}`);
        } else {
            console.log(`Value '${val}' is VALID.`);
        }
    }
}

inspect();
