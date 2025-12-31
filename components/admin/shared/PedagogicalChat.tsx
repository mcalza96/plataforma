"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface Message {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
}

interface PedagogicalChatProps {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error?: Error | null;
    placeholder?: string;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    className?: string;
    useTypewriter?: boolean;
}

export function PedagogicalChat({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    placeholder = "Escribe tu respuesta...",
    emptyStateTitle = "Constructor Iniciado",
    emptyStateDescription = "Describe el tema para comenzar a mapear los conceptos.",
    className = "",
    useTypewriter = true
}: PedagogicalChatProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isLoading]);

    return (
        <div className={`flex flex-col h-full bg-[#121212] overflow-hidden ${className}`}>
            {/* Scrollable Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40"
                        >
                            <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Sparkles className="size-6 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{emptyStateTitle}</h4>
                                <p className="text-[10px] text-zinc-500 max-w-[200px] font-medium leading-relaxed">
                                    {emptyStateDescription}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {messages.map((m, idx) => (
                        <motion.div
                            key={m.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* Avatar */}
                            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xl ${m.role === "user"
                                ? "bg-white/5 border-white/10 text-zinc-400"
                                : "bg-amber-500 text-black border-amber-400 shadow-amber-500/20"
                                }`}>
                                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            {/* Bubble */}
                            <div className="flex flex-col space-y-2 max-w-[85%]">
                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ${m.role === "user" ? "text-right mr-1" : "ml-1"
                                    }`}>
                                    {m.role === "user" ? "Arquitecto" : "Deepmind Engine"}
                                </div>
                                <div className={`p-4 rounded-2xl text-[12px] leading-relaxed whitespace-pre-wrap shadow-2xl transition-all ${m.role === "user"
                                    ? "bg-zinc-100 text-black font-medium"
                                    : "bg-[#1A1A1A] border border-white/5 text-zinc-100"
                                    }`}>
                                    {m.role === "assistant" && useTypewriter && !(isLoading && idx === messages.length - 1) ? (
                                        <TypewriterText text={m.content} speed={0.01} />
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Loading State Dots */}
                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start pl-2"
                        >
                            <div className="flex gap-2 items-center bg-white/[0.03] border border-white/5 px-5 py-4 rounded-2xl">
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="size-1 rounded-full bg-amber-500" />
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="size-1 rounded-full bg-amber-500" />
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="size-1 rounded-full bg-amber-500" />
                            </div>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mx-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-medium flex items-center gap-3"
                        >
                            <AlertCircle size={14} />
                            <div className="flex-1">
                                <p className="font-black uppercase tracking-widest mb-0.5">Fallo de Comunicación</p>
                                {error.message || 'La IA está temporalmente fuera de línea.'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-gradient-to-t from-black/40 to-transparent border-t border-white/5">
                <form
                    onSubmit={(e) => {
                        console.log("[PedagogicalChat] Form onSubmit triggered");
                        e.preventDefault();
                        if (!input?.trim() || isLoading) {
                            console.warn("[PedagogicalChat] Submit blocked:", { input: !!input, isLoading });
                            return;
                        }
                        handleSubmit(e);
                    }}
                    className="relative group"
                >
                    <input
                        className="w-full rounded-2xl border border-white/5 bg-[#1A1A1A] py-5 px-6 pr-16 text-[12px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all shadow-2xl disabled:opacity-50"
                        value={input || ''}
                        placeholder={isLoading ? "Procesando respuesta..." : placeholder}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (input?.trim() && !isLoading) {
                                    console.log("[PedagogicalChat] Enter key submit");
                                    handleSubmit(e as any);
                                }
                            }
                        }}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        onClick={() => console.log("[PedagogicalChat] Send button clicked")}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-amber-500 hover:bg-amber-600 text-black rounded-xl flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 shadow-lg shadow-amber-500/10 z-10"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </form>
                <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/5">
                    Shift + Enter para nueva línea
                </p>
            </div>
        </div>
    );
}
