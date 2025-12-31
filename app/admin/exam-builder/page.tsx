'use client';

import React, { useRef, useEffect } from 'react';
import { ArchitectLayout } from '@/components/admin/architect/ArchitectLayout';
import { DiagnosticBlueprint } from '@/components/admin/architect/DiagnosticBlueprint';
import { useArchitect } from '@/hooks/admin/architect/useArchitect';
import { MessageSquareCode, Sparkles, Send, User, Bot, Loader2, ChevronLeft, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * ExamBuilderPage (Constructor IA)
 * Unified module for pedagogical engineering and exam publication.
 * Uses the advanced Architect Engine for discovery and structure.
 */
export default function ExamBuilderPage() {
    const {
        state,
        messages,
        input,
        examTitle,
        setExamTitle,
        handleInputChange,
        handleSubmit,
        isLoading,
        handleGeneratePrototypes,
        handlePublish,
        handleReset
    } = useArchitect();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const chatPanel = (
        <div className="flex flex-col h-full bg-[#1A1A1A]">
            {/* Chat Header */}
            <div className="p-6 border-b border-[#333333] flex items-center justify-between bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <MessageSquareCode className="text-amber-500 h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Constructor IA</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">TeacherOS Engine v3.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-amber-500 transition-colors h-8 w-8"
                        onClick={handleReset}
                        title="Nueva Sesión"
                        disabled={isLoading}
                    >
                        <Loader2 className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                    {isLoading && (
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter"
                        >
                            Procesando...
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
                        >
                            <Sparkles className="h-10 w-10 text-amber-500/50" />
                            <div className="space-y-1">
                                <p className="text-white font-medium">Inicia la Ingeniería</p>
                                <p className="text-xs text-gray-500 max-w-[200px]">Define el tema y los alumnos para que el Arquitecto diseñe la evaluación.</p>
                            </div>
                        </motion.div>
                    ) : (
                        messages.map((m: any) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex gap-4 max-w-[90%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                    m.role === 'user' ? "bg-amber-600" : "bg-[#252525] border border-[#333333]"
                                )}>
                                    {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-amber-400" />}
                                </div>
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed",
                                    m.role === 'user'
                                        ? "bg-amber-600 text-white rounded-tr-none"
                                        : "bg-[#252525] text-gray-200 border border-[#333333] rounded-tl-none"
                                )}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-[#333333] bg-[#1A1A1A] shrink-0">
                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-end gap-2 bg-[#252525] border border-[#333333] rounded-2xl p-2 focus-within:border-amber-500/50 transition-colors"
                >
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => {
                            handleInputChange(e);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder="Escribe tu respuesta..."
                        className="flex-1 bg-transparent border-none py-2 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none max-h-32 scrollbar-hide"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (input.trim() && !isLoading) {
                                    handleSubmit(e as any);
                                    (e.target as HTMLTextAreaElement).style.height = 'auto';
                                }
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 rounded-xl text-white transition-all shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );

    const header = (
        <div className="flex items-center justify-between w-full px-8 py-4 border-b border-white/5 bg-[#121212]">
            <div className="flex items-center gap-6">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="size-9 rounded-xl border border-white/5 bg-white/[0.02]">
                        <ChevronLeft size={18} />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                        <Input
                            value={examTitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExamTitle(e.target.value)}
                            className="bg-transparent border-none text-base font-black text-white p-0 h-auto focus:ring-0 w-[400px]"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold">Modo Constructor Unificado</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    disabled={!state.readiness.isValid || state.isGenerating}
                    onClick={handlePublish}
                    size="sm"
                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-20 transition-all"
                >
                    {state.isGenerating ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Rocket size={16} />
                    )}
                    Publicar Evaluación
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#121212] rounded-2xl border border-white/5 overflow-hidden shadow-2xl min-h-0">
            {header}
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                <ArchitectLayout
                    chatPanel={chatPanel}
                    blueprintPanel={
                        <div className="h-full overflow-y-auto min-h-0 flex flex-col">
                            <DiagnosticBlueprint
                                state={state}
                                onGenerate={handlePublish}
                                onGeneratePrototypes={handleGeneratePrototypes}
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
}
