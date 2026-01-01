
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function list() {
    const { data: profiles, error } = await supabase.from('profiles').select('id, email, role');
    console.log("Profiles:", profiles);

    const { data: learners } = await supabase.from('learners').select('id, display_name');
    console.log("Learners:", learners);
}

list();
