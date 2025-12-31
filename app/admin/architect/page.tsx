'use client';

import React, { useRef, useEffect } from 'react';
import { ArchitectLayout } from '@/components/admin/architect/ArchitectLayout';
import { DiagnosticBlueprint } from '@/components/admin/architect/DiagnosticBlueprint';
import { useArchitect } from '@/hooks/admin/architect/useArchitect';
import { MessageSquareCode, Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * ArchitectPage
 * Main entry point for the TeacherOS Architect module.
 * Orchestrates the Socratic Assistant and the Engineering Blueprint.
 */
export default function ArchitectPage() {
    const {
        state,
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        handleGenerate
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
            <div className="p-6 border-b border-[#333333] flex items-center justify-between bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MessageSquareCode className="text-blue-400 h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Ingeniero de Conocimiento</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">TeacherOS Architect v1.0</p>
                    </div>
                </div>
                {isLoading && (
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter"
                    >
                        Procesando...
                    </motion.div>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
                        >
                            <Sparkles className="h-10 w-10 text-blue-500/50" />
                            <div className="space-y-1">
                                <p className="text-white font-medium">Inicia la Entrevista</p>
                                <p className="text-xs text-gray-500 max-w-[200px]">Define la materia y el alumno objetivo para comenzar la ingeniería.</p>
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
                                    m.role === 'user' ? "bg-blue-600" : "bg-[#252525] border border-[#333333]"
                                )}>
                                    {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-blue-400" />}
                                </div>
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed",
                                    m.role === 'user'
                                        ? "bg-blue-600 text-white rounded-tr-none"
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
            <div className="p-6 border-t border-[#333333] bg-[#1A1A1A]">
                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-end gap-2 bg-[#252525] border border-[#333333] rounded-2xl p-2 focus-within:border-blue-500/50 transition-colors"
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
                                    // Reset height
                                    (e.target as HTMLTextAreaElement).style.height = 'auto';
                                }
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-xl text-white transition-all shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </form>
                <p className="text-[9px] text-gray-600 mt-3 text-center uppercase tracking-widest font-bold">
                    Clean Language Protocol Active • AI Engineering Mode
                </p>
            </div>
        </div>
    );

    return (
        <ArchitectLayout
            chatPanel={chatPanel}
            blueprintPanel={<DiagnosticBlueprint state={state} onGenerate={handleGenerate} />}
        />
    );
}
