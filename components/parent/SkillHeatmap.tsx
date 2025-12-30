'use client';

interface SkillHeatmapProps {
    skills: { name: string; percentage: number; color: string }[];
}

export default function SkillHeatmap({ skills }: SkillHeatmapProps) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-neon-violet">insights</span>
                Dominio de Habilidades (Bloom)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {skills.map((skill) => (
                    <div
                        key={skill.name}
                        className="relative group p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                            style={{ backgroundColor: skill.color }}
                        />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{skill.name}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black italic tracking-tighter" style={{ color: skill.color }}>
                                    {skill.percentage}
                                </span>
                                <span className="text-[10px] font-bold text-gray-600">%</span>
                            </div>
                            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-1000 ease-out"
                                    style={{ width: `${skill.percentage}%`, backgroundColor: skill.color }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
