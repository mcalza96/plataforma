
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- Exam Attempts Columns ---");
    const { data: cols, error } = await supabase.from('exam_attempts').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else if (cols && cols.length > 0) {
        console.log(Object.keys(cols[0]));
    } else {
        console.log("No data in exam_attempts to inspect columns.");
        // Try getting it from a question or something else
    }
}

inspect();
