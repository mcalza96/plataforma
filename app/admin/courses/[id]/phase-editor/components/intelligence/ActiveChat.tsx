'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/useCopilotSession';

interface ActiveChatProps {
    session: CopilotSessionHelper;
}

/**
 * ActiveChat: Immersive conversational interface for the Copilot.
 * Clean, borderless design that fills its container.
 */
export function ActiveChat({ session }: ActiveChatProps) {
    const [localInput, setLocalInput] = useState('');
    const {
        messages,
        isLoading,
        append
    } = session;

    const handleSubmitLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const content = localInput;
        setLocalInput('');
        await append({ role: 'user', content });
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Message List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20"
                        >
                            <span className="material-symbols-outlined text-5xl">chat_bubble</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Inicia la Entrevista Pedagógica</p>
                        </motion.div>
                    )}

                    {messages.map((m: any, idx: number) => (
                        <motion.div
                            key={m.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] space-y-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`text-[10px] font-black uppercase tracking-widest opacity-30 ${m.role === 'user' ? 'text-right mr-2' : 'ml-2'}`}>
                                    {m.role === 'user' ? 'Arquitecto' : 'Copilot'}
                                </div>
                                <div className={`rounded-3xl px-6 py-4 text-[13px] leading-relaxed shadow-2xl ${m.role === 'user'
                                    ? 'bg-white text-black font-medium'
                                    : 'bg-white/5 text-white/80 border border-white/5'
                                    }`}>
                                    {m.role === 'user' ? (
                                        m.content
                                    ) : (
                                        <TypewriterText text={m.content} speed={0.01} />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start pl-2"
                        >
                            <div className="flex gap-1.5 items-center bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
                                <motion.span animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="size-1 rounded-full bg-amber-500" />
                                <motion.span animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="size-1 rounded-full bg-amber-500" />
                                <motion.span animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="size-1 rounded-full bg-amber-500" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent">
                <form
                    onSubmit={handleSubmitLocal}
                    className="relative group"
                >
                    <input
                        className="w-full rounded-2xl border border-white/5 bg-[#1A1A1A] p-5 pr-16 text-xs text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all shadow-2xl"
                        value={localInput}
                        placeholder="Escribe tu respuesta..."
                        onChange={(e) => setLocalInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !localInput.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black rounded-xl p-2.5 flex items-center justify-center hover:bg-amber-500 disabled:opacity-30 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                    </button>
                </form>
                <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/5">
                    Presiona Enter para enviar
                </p>
            </div>
        </div>
    );
}
