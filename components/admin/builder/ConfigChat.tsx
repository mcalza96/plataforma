'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, Loader2, Hammer, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BuilderMode } from './BuilderLayout';

interface ConfigChatProps {
    messages: any[];
    input: string;
    onInputChange: (e: any) => void;
    onSubmit: (e: any) => void;
    isLoading: boolean;
    mode: BuilderMode;
    selectedBlockId?: string | null;
}

/**
 * ConfigChat
 * Specialized version of the chat for Construction Mode.
 * When a block is selected, it shifts the focus to "Psychometric Review".
 */
export function ConfigChat({
    messages,
    input,
    onInputChange,
    onSubmit,
    isLoading,
    mode,
    selectedBlockId
}: ConfigChatProps) {
    const isConstruction = mode === 'construction';

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A]">
            {/* Header */}
            <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#1A1A1A]">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isConstruction ? "bg-blue-500/10" : "bg-amber-500/10"
                    )}>
                        {isConstruction ? (
                            <Hammer className="text-blue-400 size-4" />
                        ) : (
                            <Bot className="text-amber-500 size-4" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-xs">
                            {isConstruction ? 'Asistente de Bloque' : 'Arquitecto IA'}
                        </h3>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
                            {isConstruction && selectedBlockId ? 'Modo Revisor' : 'Fase de Discovery'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contextual Banner if Block Selected */}
            <AnimatePresence>
                {isConstruction && selectedBlockId && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-blue-500/5 border-b border-blue-500/20 p-3 overflow-hidden"
                    >
                        <div className="flex items-start gap-2">
                            <ShieldCheck className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-[10px] text-blue-200">
                                <span className="font-bold">Análisis de Calidad:</span> Estoy revisando el bloque seleccionado para asegurar rigor psicométrico.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                        <Sparkles className="size-8 text-amber-500" />
                        <p className="text-[11px] text-white">Inicia la conversación...</p>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <div key={idx} className={cn(
                            "flex gap-3",
                            m.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "size-6 rounded-full flex items-center justify-center shrink-0",
                                m.role === 'user' ? "bg-amber-600" : "bg-[#252525] border border-[#333333]"
                            )}>
                                {m.role === 'user' ? <User className="size-3 text-white" /> : <Bot className="size-3 text-amber-400" />}
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%]",
                                m.role === 'user'
                                    ? "bg-amber-600 text-white rounded-tr-none"
                                    : "bg-[#252525] text-gray-200 border border-[#333333] rounded-tl-none"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#333333] bg-[#1A1A1A]">
                <form
                    onSubmit={onSubmit}
                    className="flex items-center gap-2 bg-[#252525] border border-[#333333] rounded-xl p-1.5 focus-within:border-amber-500/50 transition-colors"
                >
                    <input
                        value={input}
                        onChange={onInputChange}
                        placeholder={isConstruction && selectedBlockId ? "Pregunta sobre este bloque..." : "Responder..."}
                        className="flex-1 bg-transparent border-none py-1.5 px-3 text-[11px] text-white placeholder:text-gray-600 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg text-white transition-all"
                    >
                        {isLoading ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
