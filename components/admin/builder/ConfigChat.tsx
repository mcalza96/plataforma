"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface ConfigChatProps {
    examTitle: string;
    onUpdateState: (toolCall: any) => void;
    initialStage?: string;
}

export function ConfigChat({ examTitle, onUpdateState, initialStage = "initial_profiling" }: ConfigChatProps) {
    // Cast to any because the specific version (V6) in package.json seems to have 
    // different types or the environment is misinterpreting the exports.
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        body: {
            examId: "temp-config",
            stage: initialStage,
            context: { examTitle },
        },
    } as any) as any;

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Track tool calls via messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
            lastMessage.toolInvocations.forEach((invocation: any) => {
                if (invocation.state === 'result') {
                    onUpdateState({ method: invocation.toolName, args: invocation.args });
                }
            });
        }
    }, [messages, onUpdateState]);

    return (
        <div className="flex flex-col h-full bg-[#0D0D0D]">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="size-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Sparkles className="size-6 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Constructor Iniciado</h4>
                                <p className="text-[10px] text-zinc-500 max-w-[200px]">
                                    Describe el tema del examen para comenzar a mapear los conceptos.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {messages.map((m: any) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${m.role === "user"
                                ? "bg-white/5 border-white/10 text-zinc-300"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                }`}>
                                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${m.role === "user"
                                ? "bg-zinc-100 text-black font-medium"
                                : "bg-white/5 border border-white/5 text-zinc-300"
                                }`}>
                                {m.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <form
                onSubmit={handleSubmit}
                className="p-6 border-t border-white/5 bg-[#0A0A0A]"
            >
                <div className="relative group">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Responde lógicamente o añade un concepto..."
                        className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-black rounded-xl transition-all flex items-center justify-center"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="mt-3 text-[9px] text-zinc-600 text-center font-mono uppercase tracking-tighter">
                    {isLoading ? "El Agente está procesando..." : "Shift + Enter para nueva línea"}
                </p>
            </form>
        </div>
    );
}
