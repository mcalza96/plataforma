'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/useCopilotSession';

interface DiscoveryChatProps {
    session: CopilotSessionHelper;
}

export default function DiscoveryChat({ session }: DiscoveryChatProps) {
    const [localInput, setLocalInput] = useState('');
    const {
        messages,
        isLoading,
        append,
        liveContext: context
    } = session;

    const handleSubmitLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const content = localInput;
        setLocalInput('');
        await append({ role: 'user', content });
    };

    return (
        <div className="flex h-[calc(100vh-200px)] w-full gap-4 overflow-hidden rounded-xl bg-gray-50/50 p-4 shadow-sm border border-gray-100">
            {/* Left: Chat Pane */}
            <div className="flex flex-col flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Entrevista Pedagógica</h3>
                    {isLoading && (
                        <div className="flex gap-1">
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-blue-500" />
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-blue-500" />
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    <AnimatePresence initial={false}>
                        {messages.map((m: any) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {m.role === 'user' ? (
                                        m.content
                                    ) : (
                                        <TypewriterText text={m.content} speed={0.01} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmitLocal} className="p-4 border-t border-gray-100 bg-gray-50/30">
                    <div className="relative flex items-center gap-2">
                        <input
                            className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                            value={localInput}
                            placeholder="Responde al ingeniero..."
                            onChange={(e) => setLocalInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !localInput.trim()}
                            className="bg-blue-600 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* Right: Live Context Pane */}
            <div className="w-1/3 flex flex-col gap-4">
                <Card className="flex-1 border-none bg-white shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            Notas del Secretario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 overflow-y-auto flex-1 bg-gray-50/30">
                        {/* Sujeto y Audiencia */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metadatos</h4>
                            <div className="space-y-1">
                                {context.subject ? (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500">Materia</span>
                                        <span className="text-xs font-semibold">{context.subject}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Identificando materia...</span>
                                )}
                                {context.targetAudience && (
                                    <div className="flex flex-col mt-2">
                                        <span className="text-[10px] text-gray-500">Audiencia</span>
                                        <span className="text-xs font-semibold">{context.targetAudience}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Conceptos Clave */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Conceptos Finales</h4>
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {context.keyConcepts?.map((concept, idx) => (
                                        <motion.div
                                            key={concept}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                        >
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                                {concept}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {context.keyConcepts?.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">No hay conceptos detectados.</span>
                                )}
                            </div>
                        </div>

                        {/* Errores Comunes */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Errores Comunes</h4>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {context.identifiedMisconceptions?.map((m, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-2 bg-red-50 rounded border border-red-100"
                                        >
                                            <p className="text-[10px] font-bold text-red-700">ERROR: {m.error}</p>
                                            <p className="text-[10px] text-red-600 mt-1 italic">REFUTACIÓN: {m.refutation}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {context.identifiedMisconceptions?.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">No hay errores detectados.</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
