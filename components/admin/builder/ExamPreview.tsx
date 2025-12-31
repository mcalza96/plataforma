"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileCode, CheckCircle, Copy } from "lucide-react";
import { BuilderState } from "@/hooks/admin/builder/useExamBuilder";

interface ExamPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    state: BuilderState;
    title: string;
}

export function ExamPreview({ isOpen, onClose, state, title }: ExamPreviewProps) {
    const jsonPreview = JSON.stringify({
        title,
        matrix: state.matrix,
        version: "1.0.0",
        generated_at: new Date().toISOString(),
    }, null, 2);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-12">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl h-[80vh] bg-[#0D0D0D] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <FileCode className="size-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Copia Maestra del Examen</h3>
                                    <p className="text-[10px] text-zinc-500 font-mono">ESTRUCTURA GENERADA VÍA AGENTE</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="size-5 text-zinc-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-hidden flex">
                            {/* Navigation/Stats */}
                            <div className="w-64 border-r border-white/10 p-6 space-y-6 bg-black/20">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Resumen Estructural</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-zinc-400">Conceptos</span>
                                            <span className="text-[11px] font-mono text-white">{state.matrix.concepts.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-zinc-400">Trampas</span>
                                            <span className="text-[11px] font-mono text-white">{state.matrix.misconceptions.filter(m => m.hasTrap).length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="size-3 text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Validado</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-500/70 leading-relaxed italic">
                                        La estructura cumple con los requisitos mínimos de diagnóstico pedagógico.
                                    </p>
                                </div>
                            </div>

                            {/* JSON Editor/Viewer */}
                            <div className="flex-1 p-6 overflow-hidden flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vista Previa JSON</h4>
                                    <button className="flex items-center gap-2 text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase">
                                        <Copy className="size-3" />
                                        Copiar JSON
                                    </button>
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-auto custom-scrollbar">
                                    <pre className="text-[11px] font-mono text-amber-500/80 leading-relaxed">
                                        {jsonPreview}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                Cerrar Previsualización
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
