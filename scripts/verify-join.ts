
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const EXAM_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';

async function verify() {
    console.log("Verifying join query...");
    const { data: attempts, error } = await supabase
        .from("exam_attempts")
        .select("*, exams(title, config_json)")
        .eq("exam_config_id", EXAM_ID)
        .limit(1);

    if (error) {
        console.error("Join query failed:", error);

        console.log("Trying alternative relationship name 'exam'...");
        const { data: attempts2, error: error2 } = await supabase
            .from("exam_attempts")
            .select("*, exam:exams(title, config_json)")
            .eq("exam_config_id", EXAM_ID)
            .limit(1);

        if (error2) {
            console.error("Alternative failed too:", error2);
        } else {
            console.log("Found with 'exam:exams'!");
        }
    } else {
        console.log("Join query successful! Found:", attempts?.length);
    }
}

verify();
