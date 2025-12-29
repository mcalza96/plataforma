'use client';

import { selectLearner } from '@/lib/learner-actions';

interface Learner {
    id: string;
    display_name: string;
    avatar_url: string | null;
    level: number;
}

export default function ProfilesClient({ learners }: { learners: Learner[] }) {
    const handleSelect = async (id: string) => {
        await selectLearner(id);
    };

    return (
        <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">

                {learners.map((learner) => (
                    <div
                        key={learner.id}
                        onClick={() => handleSelect(learner.id)}
                        className="group/avatar flex flex-col items-center gap-4 cursor-pointer"
                    >
                        <div className="relative w-32 h-32 md:w-40 md:h-40 avatar-glow rounded-full border-4 border-surface transition-all duration-300">
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                <div
                                    className="w-full h-full bg-cover bg-center bg-surface-hover"
                                    style={{
                                        backgroundImage: learner.avatar_url
                                            ? `url('${learner.avatar_url}')`
                                            : 'none'
                                    }}
                                >
                                    {!learner.avatar_url && (
                                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                                            <span className="material-symbols-outlined text-6xl">person</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Progress Indicator Ring (Partial) */}
                            <svg className="absolute -inset-[4px] w-[calc(100%+8px)] h-[calc(100%+8px)] rotate-[-90deg]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="48" stroke="#333" stroke-width="2"></circle>
                                <circle
                                    cx="50" cy="50" fill="none" r="48"
                                    stroke={learner.level > 5 ? "#a855f7" : "#0d93f2"}
                                    strokeDasharray="301.59"
                                    strokeDashoffset={301.59 - (301.59 * (learner.level / 10))}
                                    strokeLinecap="round"
                                    strokeWidth="2"
                                ></circle>
                            </svg>
                        </div>
                        <div className="text-center group-hover/avatar:translate-y-1 transition-transform">
                            <p className="text-xl font-bold text-white group-hover/avatar:text-primary transition-colors">
                                {learner.display_name}
                            </p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                Nivel {learner.level}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Add Profile */}
                <div className="group/add flex flex-col items-center gap-4 cursor-pointer">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-transparent group-hover/add:bg-white/5 group-hover/add:border-gray-400 transition-all duration-300">
                        <span className="material-symbols-outlined text-5xl text-gray-500 group-hover/add:text-white transition-colors">add</span>
                    </div>
                    <div className="text-center group-hover/add:translate-y-1 transition-transform">
                        <p className="text-lg font-medium text-gray-400 group-hover/add:text-white transition-colors">Nuevo Artista</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
