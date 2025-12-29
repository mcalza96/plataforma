import Link from 'next/link';
import { getLearnerById } from '@/lib/data/courses';
import { cookies } from 'next/headers';

interface LessonHeaderProps {
    courseTitle: string;
}

export default async function LessonHeader({ courseTitle }: LessonHeaderProps) {
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;
    const learner = learnerId ? await getLearnerById(learnerId) : null;

    return (
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 lg:px-10 shrink-0 bg-[#1A1A1A] z-20">
            <div className="flex items-center gap-4">
                <Link
                    className="flex items-center justify-center bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors"
                    href="/dashboard"
                >
                    <span className="material-symbols-outlined text-white">arrow_back</span>
                </Link>
                <div className="flex flex-col">
                    <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Teatro de Arte</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Link href="/dashboard" className="hover:text-primary transition-colors cursor-pointer">Cursos</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-gray-200">{courseTitle}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 bg-neutral-800 rounded-full px-4 py-1.5 border border-white/5">
                    <span className="material-symbols-outlined text-primary text-[18px]">trophy</span>
                    <span className="text-sm font-medium text-white">Nivel {learner?.level || 1}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">{learner?.display_name || 'Artista'}</p>
                        <p className="text-xs text-gray-400">Estudiante</p>
                    </div>
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border-2 border-primary/30"
                        style={{
                            backgroundImage: learner?.avatar_url
                                ? `url("${learner.avatar_url}")`
                                : `url("https://api.dicebear.com/7.x/avataaars/svg?seed=${learner?.display_name || 'Art'}")`
                        }}
                    ></div>
                </div>
            </div>
        </header>
    );
}
