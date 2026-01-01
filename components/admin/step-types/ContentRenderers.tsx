'use client';

import { StepData, StepType } from '../StepCard';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';


interface StepContentTypeProps {
    step: StepData;
    onUpdate: (updates: Partial<StepData>) => void;
    liveContext?: PartialKnowledgeMap;
}

export function StepContentVideo({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Configuración de Video Master
                </p>
                <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    Este paso presentará una lección en video. Asegúrate de que el título sea descriptivo para que el alumno sepa qué esperar.
                </p>
            </div>
        </div>
    );
}

export function StepContentQuiz({ step, onUpdate, liveContext }: StepContentTypeProps) {
    const quiz = step.quizData || {
        stem: '',
        options: [
            { id: '1', content: '', isCorrect: true },
            { id: '2', content: '', isCorrect: false }
        ]
    };

    const updateQuiz = (updates: Partial<typeof quiz>) => {
        onUpdate({
            quizData: { ...quiz, ...updates }
        });
    };

    const handleOptionUpdate = (idx: number, updates: Partial<typeof quiz.options[0]>) => {
        const newOptions = [...quiz.options];
        newOptions[idx] = { ...newOptions[idx], ...updates };
        updateQuiz({ options: newOptions });
    };

    const addOption = () => {
        updateQuiz({
            options: [...quiz.options, { id: Date.now().toString(), content: '', isCorrect: false }]
        });
    };

    const removeOption = (idx: number) => {
        if (quiz.options.length <= 2) return;
        const newOptions = quiz.options.filter((_, i) => i !== idx);
        updateQuiz({ options: newOptions });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">quiz</span>
                        Mapeo de Inteligencia Forense
                    </p>
                    {step.metadata?.isDiagnostic && (
                        <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[8px] uppercase font-black tracking-widest">
                            Modo Diagnóstico
                        </Badge>
                    )}
                </div>
                <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    Vincula los distractores a malentendido específicos para habilitar el motor de inferencia.
                </p>
            </div>

            {/* Stem Input */}
            <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Enunciado (Stem)</label>
                <textarea
                    value={quiz.stem}
                    onChange={(e) => updateQuiz({ stem: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-white placeholder:text-gray-700 outline-none focus:ring-1 ring-emerald-500 min-h-[80px] resize-none"
                    placeholder="Escribe la pregunta psicométrica aquí..."
                />
            </div>

            {/* Time Identity Section */}
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-xs text-indigo-400">timer</span>
                    <span className="text-[9px] font-black text-indigo-400/80 uppercase tracking-widest">Identidad Temporal</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[8px] text-gray-500 uppercase font-bold">Dificultad</label>
                        <select
                            value={quiz.difficulty_tier || 'medium'}
                            onChange={(e) => updateQuiz({ difficulty_tier: e.target.value as 'easy' | 'medium' | 'hard' })}
                            className="w-full bg-black/20 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:ring-1 ring-indigo-500/50"
                        >
                            <option value="easy">Easy (45s)</option>
                            <option value="medium">Medium (120s)</option>
                            <option value="hard">Hard (300s)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[8px] text-gray-500 uppercase font-bold">Tiempo Esperado (s)</label>
                        <input
                            type="number"
                            value={quiz.expected_time_seconds || 60}
                            onChange={(e) => updateQuiz({ expected_time_seconds: parseInt(e.target.value) || 0 })}
                            className="w-full bg-black/20 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:ring-1 ring-indigo-500/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[8px] text-gray-500 uppercase font-bold">Mínimo Viable (s)</label>
                        <div className="flex gap-1">
                            <input
                                type="number"
                                value={quiz.min_viable_time || 0}
                                onChange={(e) => updateQuiz({ min_viable_time: parseInt(e.target.value) || 0 })}
                                className="w-full bg-black/20 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-amber-500/80 font-mono outline-none focus:ring-1 ring-indigo-500/50"
                            />
                            <button
                                onClick={() => {
                                    const words = (quiz.stem || '').split(/\s+/).length;
                                    const calc = Math.ceil(5 + (words * 0.2));
                                    updateQuiz({ min_viable_time: calc });
                                }}
                                title="Auto-calcular basado en NT10"
                                className="px-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[10px] text-gray-400">calculate</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Opciones de Respuesta</label>
                <div className="space-y-3">
                    {quiz.options.map((opt, idx) => (
                        <div key={opt.id} className="relative group/option bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.04]">
                            <div className="flex items-start gap-4">
                                {/* Correct/Incorrect Toggle */}
                                <button
                                    onClick={() => handleOptionUpdate(idx, { isCorrect: !opt.isCorrect })}
                                    className={`size-6 rounded-lg border transition-all flex items-center justify-center shrink-0 mt-1 ${opt.isCorrect
                                        ? 'bg-emerald-500 border-emerald-400 text-black'
                                        : 'bg-black/40 border-white/10 text-white/20'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[14px]">
                                        {opt.isCorrect ? 'check_circle' : 'circle'}
                                    </span>
                                </button>

                                <div className="flex-1 space-y-3">
                                    <input
                                        value={opt.content}
                                        onChange={(e) => handleOptionUpdate(idx, { content: e.target.value })}
                                        className="w-full bg-transparent border-none p-0 text-[11px] text-white placeholder:text-gray-700 outline-none font-bold"
                                        placeholder={`Opción ${idx + 1}...`}
                                    />

                                    {/* Forensic Mapping for Incorrect Options */}
                                    {!opt.isCorrect && (
                                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[14px] text-amber-500/50">psychology</span>
                                                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Diagnostica:</span>
                                                <select
                                                    value={opt.diagnosesMisconceptionId || ''}
                                                    onChange={(e) => handleOptionUpdate(idx, { diagnosesMisconceptionId: e.target.value || null })}
                                                    className="flex-1 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[9px] text-amber-400 font-bold outline-none focus:ring-1 ring-amber-500/30"
                                                >
                                                    <option value="">(Ningún error específico)</option>
                                                    {liveContext?.identifiedMisconceptions?.map((m) => (
                                                        <option key={m.error} value={m.competencyId || m.error}>
                                                            {m.error}
                                                        </option>
                                                    ))}
                                                </select>
                                                {opt.diagnosesMisconceptionId && (
                                                    <span className="material-symbols-outlined text-amber-500 text-sm animate-pulse">bug_report</span>
                                                )}
                                            </div>
                                            <textarea
                                                value={opt.feedback || ''}
                                                onChange={(e) => handleOptionUpdate(idx, { feedback: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 rounded-lg p-2 text-[9px] text-gray-400 placeholder:text-gray-800 outline-none resize-none min-h-[40px]"
                                                placeholder="Feedback correctivo experto..."
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeOption(idx)}
                                    className="size-8 rounded-xl flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/option:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={addOption}
                    className="w-full py-3 border border-dashed border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-emerald-500 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Añadir Distractor
                </button>
            </div>
        </div>
    );
}

export function StepContentResource({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-[10px] text-blue-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">attachment</span>
                    Recurso para Descargar
                </p>
                <div className="flex items-center gap-3">
                    <button className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        Vincular Archivo
                    </button>
                    <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-600">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function StepContentPractice({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                <p className="text-[10px] text-purple-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">brush</span>
                    Práctica Libre Atómica
                </p>
                <textarea
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] text-white placeholder:text-gray-700 outline-none focus:ring-1 ring-purple-500 min-h-[60px] resize-none"
                    placeholder="Instrucciones para la práctica de dibujo..."
                />
            </div>
        </div>
    );
}
