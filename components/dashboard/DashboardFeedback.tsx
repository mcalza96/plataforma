import { getInstructorFeedback } from '@/lib/parent';
import Link from 'next/link';

interface DashboardFeedbackProps {
    learnerId: string;
}

export default async function DashboardFeedback({ learnerId }: DashboardFeedbackProps) {
    const feedback = await getInstructorFeedback(learnerId);
    const feedbackList = Array.isArray(feedback) ? feedback : [];
    const recentFeedback = feedbackList.slice(0, 1);

    if (recentFeedback.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-primary/20 to-neon-violet/20 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border-2 border-primary/30">
                <span className="material-symbols-outlined text-3xl text-primary">chat_bubble</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Nuevo mensaje de tu Instructor</p>
                <p className="text-white text-lg font-medium leading-tight">
                    "{recentFeedback[0].content}"
                </p>
            </div>
            <Link
                href="/parent-dashboard"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0"
            >
                Ver todo
            </Link>
        </div>
    );
}
