'use client';

import { useState } from 'react';

interface CopilotSidebarProps {
    onApplyStructure: (steps: { title: string }[]) => void;
}

export default function CopilotSidebar({ onApplyStructure }: CopilotSidebarProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<{ id: string, title: string }[]>([]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        // Simulación de generación por IA
        setTimeout(() => {
            const mockSuggestions = [
                { id: 's1', title: 'Fundamentos: Observación de Formas' },
                { id: 's2', title: 'Técnica: El trazo dinámico' },
                { id: 's3', title: 'Práctica: Luces y Sombras Atómicas' },
                { id: 's4', title: 'Desafío: Aplicación en Personaje' },
                { id: 's5', title: 'Refinamiento: Texturas y Detalles' }
            ];
            setSuggestions(mockSuggestions);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <aside className={`fixed right-0 top-0 h-screen bg-[#1A1A1A] border-l border-white/5 transition-all duration-500 flex flex-col z-[100] ${isOpen ? 'w-80' : 'w-12'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -left-6 top-1/2 -translate-y-1/2 size-12 bg-[#1A1A1A] border border-white/5 rounded-full flex items-center justify-center text-amber-500 shadow-xl z-50 hover:scale-110 active:scale-90 transition-all"
            >
                <span className="material-symbols-outlined font-black">
                    {isOpen ? 'chevron_right' : 'smart_toy'}
                </span>
            </button>

            {isOpen && (
                <div className="flex-1 flex flex-col p-6 overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-10 rounded-xl bg-amber-500 flex items-center justify-center text-black">
                            <span className="material-symbols-outlined font-black">smart_toy</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white italic tracking-tight">COPILOT IA</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Asistente de Diseño</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 flex flex-col">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">¿Qué quieres enseñar?</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs text-white placeholder:text-gray-700 focus:ring-1 ring-amber-500 outline-none transition-all min-h-[100px] leading-relaxed resize-none"
                                placeholder="Ej: Pasos para colorear piel en estilo digital painting..."
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                )}
                                GENERAR ESTRUCTURA
                            </button>
                        </div>

                        {suggestions.length > 0 && (
                            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sugerencias de la IA</h4>
                                    <button
                                        onClick={() => onApplyStructure(suggestions)}
                                        className="text-[10px] font-black text-amber-500 hover:underline px-2"
                                    >
                                        APLICAR TODO
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {suggestions.map((s) => (
                                        <div
                                            key={s.id}
                                            className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all cursor-move group"
                                            draggable
                                        >
                                            <p className="text-[11px] font-bold text-gray-300 group-hover:text-amber-500 transition-colors leading-tight">
                                                {s.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <p className="text-[9px] text-gray-600 font-medium italic text-center">
                            "La IA es tu pincel asistente, tú eres el Maestro Artista."
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}
