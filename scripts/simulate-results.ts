
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const EXAM_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';

async function simulate() {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Current Auth User ID:", user?.id);

    // In a real browser, targetLearnerId comes from cookie or user.id
    // Since I'm in a script, I don't have cookies.
    // Let's see what happens if I query with the ID I found in the DB.

    const TARGET_LEARNER_ID = 'a111c7c6-df45-4c7b-a3b6-1a77466449ed';

    const { data: attempt, error } = await supabase
        .from("exam_attempts")
        .select("id, status")
        .eq("exam_config_id", EXAM_ID)
        .eq("learner_id", TARGET_LEARNER_ID)
        .eq("status", "COMPLETED")
        .single();

    if (error) {
        console.log("Query failed:", error.message);
    } else {
        console.log("Found attempt:", attempt.id);
    }
}

simulate();
