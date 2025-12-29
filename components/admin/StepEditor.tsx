'use client';

interface StepEditorProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    label?: string;
}

export default function StepEditor({ value, onChange, max = 20, label = "Pasos de la Misión" }: StepEditorProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">{label}</label>
                    <p className="text-gray-400 text-[10px] uppercase tracking-tighter mt-1">Complejidad Visual LEGO</p>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black italic text-amber-500">{value}</span>
                    <span className="text-xs font-black text-amber-500/50 uppercase">Steps</span>
                </div>
            </div>

            <div className="flex gap-1.5 h-8">
                {Array.from({ length: max }).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(i + 1)}
                        className={`group relative flex-1 rounded-sm transition-all duration-300 transform active:scale-90 ${i < value
                                ? 'bg-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.2)]'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        {/* LEGO Stud */}
                        <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-t-full transition-colors ${i < value ? 'bg-amber-600/80' : 'bg-white/10 group-hover:bg-white/20'
                            }`} />

                        {/* Subtle Glow for Active */}
                        {i < value && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
