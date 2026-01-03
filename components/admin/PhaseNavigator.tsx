import Link from 'next/link';
import { Lesson } from '@/lib/domain/course';

interface PhaseNavigatorProps {
    courseId: string;
    adjacent: {
        prev: Lesson | null;
        next: Lesson | null;
    };
}

/**
 * PhaseNavigator: Tactical navigation between adjacent lessons (Wayfinding).
 * SRP: Purely responsible for displaying navigation links.
 * ISP: Receives only the necessary AdjacentPhase data.
 */
export default function PhaseNavigator({ courseId, adjacent }: PhaseNavigatorProps) {
    return (
        <div className="flex items-center justify-between py-4 px-8 bg-white/[0.02] border-b border-white/5 backdrop-blur-md">
            {/* Left: Previous Phase */}
            <div className="flex-1">
                {adjacent.prev ? (
                    <Link
                        href={`/admin/courses/${courseId}/phases/${adjacent.prev.id}`}
                        className="group flex items-center gap-4 text-left transition-all hover:translate-x-[-4px]"
                    >
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Fase Anterior</p>
                            <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors truncate max-w-[150px]">
                                {adjacent.prev.order}. {adjacent.prev.title}
                            </p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center gap-4 opacity-20 grayscale">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-800">
                            <span className="material-symbols-outlined text-[20px]">first_page</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest hidden sm:block">Llegaste al Inicio</p>
                    </div>
                )}
            </div>

            {/* Strategic Divider */}
            <div className="h-8 w-px bg-white/5" />

            {/* Right: Next Phase */}
            <div className="flex-1 flex justify-end text-right">
                {adjacent.next ? (
                    <Link
                        href={`/admin/courses/${courseId}/phases/${adjacent.next.id}`}
                        className="group flex items-center flex-row-reverse gap-4 transition-all hover:translate-x-[4px]"
                    >
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all">
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">Siguiente Fase</p>
                            <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors truncate max-w-[150px]">
                                {adjacent.next.order}. {adjacent.next.title}
                            </p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center flex-row-reverse gap-4 opacity-20 grayscale">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-800">
                            <span className="material-symbols-outlined text-[20px]">last_page</span>
                        </div>
                        <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest hidden sm:block">Diagnóstico Finalizado</p>
                    </div>
                )}
            </div>
        </div>
    );
}
