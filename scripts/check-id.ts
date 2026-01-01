
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_ID = 'a111c7c6-df45-4c7b-a3b6-1a77466449ed';

async function check() {
    const { data: profile } = await supabase.from('profiles').select('id, email, role').eq('id', TARGET_ID).single();
    if (profile) {
        console.log("ID is a PROFILE:", profile);
    } else {
        console.log("ID is NOT a profile.");
    }

    const { data: learner } = await supabase.from('learners').select('id, display_name, parent_id').eq('id', TARGET_ID).single();
    if (learner) {
        console.log("ID is a LEARNER:", learner);
    } else {
        console.log("ID is NOT a learner.");
    }
}

check();
