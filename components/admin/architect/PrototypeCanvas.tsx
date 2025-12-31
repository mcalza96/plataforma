'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, ChevronDown, CheckCircle2, MessageSquare, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prototype {
    id: string;
    stem: string;
    options: Array<{
        content: string;
        isCorrect: boolean;
        rationale: string;
    }>;
    pedagogicalReasoning: string;
    alternatives?: string[];
}

interface PrototypeCanvasProps {
    prototypes: Prototype[];
}

export function PrototypeCanvas({ prototypes }: PrototypeCanvasProps) {
    const [expandedId, setExpandedId] = useState<string | null>(prototypes[0]?.id || null);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Prototipos de Preguntas
                </h4>
            </div>

            <div className="grid gap-3">
                {prototypes.map((p, idx) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "bg-[#1A1A1A] border rounded-xl overflow-hidden transition-all",
                            expandedId === p.id ? "border-emerald-500/30 ring-1 ring-emerald-500/10" : "border-[#333333] hover:border-[#444444]"
                        )}
                    >
                        {/* Header */}
                        <button
                            onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                            className="w-full flex items-start gap-3 p-4 text-left"
                        >
                            <div className="mt-1">
                                {expandedId === p.id ? (
                                    <ChevronDown className="h-4 w-4 text-emerald-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-200 line-clamp-2">
                                    {p.stem}
                                </p>
                            </div>
                        </button>

                        {/* Content */}
                        <AnimatePresence>
                            {expandedId === p.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-[#333333] bg-[#252525]/30"
                                >
                                    <div className="p-4 space-y-4">
                                        {/* Pedagogical Reason */}
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Razonamiento Pedagógico</span>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed italic">
                                                "{p.pedagogicalReasoning}"
                                            </p>
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Opciones y Distractores</span>
                                            {p.options.map((opt, oIdx) => (
                                                <div
                                                    key={oIdx}
                                                    className={cn(
                                                        "p-3 rounded-lg border text-xs relative group transition-colors",
                                                        opt.isCorrect
                                                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-100"
                                                            : "bg-[#1A1A1A] border-[#333333] text-gray-400"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {opt.isCorrect && <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />}
                                                        <div className="flex-1">
                                                            <p className="font-medium mb-1">{opt.content}</p>
                                                            <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                                                                <span className="font-bold uppercase tracking-tighter opacity-50 mr-1">Razón:</span>
                                                                {opt.rationale}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Alternatives */}
                                        {p.alternatives && p.alternatives.length > 0 && (
                                            <div className="pt-2 border-t border-[#333333]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare className="h-3 w-3 text-blue-400" />
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Alternativas de Enunciado</span>
                                                </div>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {p.alternatives.map((alt, aIdx) => (
                                                        <li key={aIdx} className="text-[10px] text-gray-500 italic">
                                                            {alt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
