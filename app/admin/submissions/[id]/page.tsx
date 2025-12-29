import { getSubmissionDetail, getAvailableBadges, getLearnerFeedback } from '@/lib/feedback-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReviewPanel from './review-panel';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: PageProps) {
    const { id } = await params;

    try {
        const submission = await getSubmissionDetail(id);
        const badges = await getAvailableBadges();
        const history = await getLearnerFeedback(submission.learner_id);

        if (!submission) return notFound();

        return (
            <div className="min-h-screen bg-[#0F0F0F] text-white overflow-hidden flex flex-col -m-8 relative">
                {/* Cinema Header */}
                <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
                    <Link href="/admin/submissions" className="w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-2xl border border-white/5 transition-all active:scale-95 group">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-amber-500 transition-colors">arrow_back</span>
                    </Link>
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Misión</p>
                        <h2 className="text-sm font-black tracking-tight">{submission.lessons?.title || 'Obra Personal'}</h2>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row">
                    {/* Cinema Player Section */}
                    <div className="flex-1 relative flex items-center justify-center bg-black group">
                        <video
                            src={submission.file_url}
                            className="max-h-[85vh] w-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                            controls
                            autoPlay
                        />

                        {/* Artwork Info Overlay (Floating) */}
                        <div className="absolute bottom-12 left-12 p-8 max-w-xl bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <span className="material-symbols-outlined text-black text-3xl font-black italic">palette</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tighter italic uppercase">{submission.title}</h1>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        Por <span className="text-amber-500">{submission.learners?.display_name}</span> • Nivel {submission.learners?.level}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-amber-500/30 pl-4">
                                {submission.category || 'Exploración artística libre a través de Procreate.'}
                            </p>
                        </div>
                    </div>

                    {/* Review Control Panel */}
                    <ReviewPanel
                        submissionId={submission.id}
                        learnerId={submission.learner_id}
                        badges={badges}
                        history={history}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error loading submission:', error);
        return notFound();
    }
}
