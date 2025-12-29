import { createClient } from '@/lib/supabase-server';
import SubmissionsList from './submissions-list';

export default async function AdminSubmissionsPage() {
    const supabase = await createClient();
    const { data: submissions } = await supabase
        .from('submissions')
        .select(`
            *,
            learners (display_name, avatar_url),
            lessons (title)
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Galería de Talento</p>
                <h1 className="text-3xl font-black tracking-tighter">Entregas y Feedback</h1>
                <p className="text-gray-400">Revisa las obras de los alumnos y envíales feedback motivador.</p>
            </div>

            <SubmissionsList initialSubmissions={submissions || []} />
        </div>
    );
}
