'use client';

import React, { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArchitectLayout } from '@/components/admin/architect/ArchitectLayout';
import { DiagnosticBlueprint } from '@/components/admin/architect/DiagnosticBlueprint';
import { useArchitect } from '@/hooks/admin/architect/use-architect';
import { MessageSquareCode, Sparkles, Send, User, Bot, Loader2, ChevronLeft, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BuilderLayout, type BuilderMode } from '@/components/admin/builder/BuilderLayout';
import { BuilderModeToggle } from '@/components/admin/builder/BuilderModeToggle';
import { CoverageHUD } from '@/components/admin/builder/CoverageHUD';
import { ConfigChat } from '@/components/admin/builder/ConfigChat';

/**
 * ExamBuilderPage (Constructor IA)
 * Unified module for pedagogical engineering and exam publication.
 * Uses the advanced Architect Engine for discovery and structure.
 */
export default function ExamBuilderPage() {
    const [mode, setMode] = React.useState<BuilderMode>('interview');
    const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);

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
        handleReset,
        setState
    } = useArchitect({
        selectedBlockId: React.useMemo(() => selectedBlockId, [selectedBlockId])
    });

    const searchParams = useSearchParams();
    const resetRequested = searchParams.get('reset') === 'true';

    useEffect(() => {
        if (resetRequested) {
            handleReset();
            // Limpiar la URL para evitar re-resets al recargar
            window.history.replaceState({}, '', '/admin/exam-builder');
        }
    }, [resetRequested, handleReset]);

    // Sync mode with isCanvasReady and Architect Stage
    useEffect(() => {
        if (mode === 'construction' && state.stage !== 'construction') {
            setState((prev: any) => ({ ...prev, stage: 'construction' }));
        } else if (mode === 'interview' && state.stage === 'construction') {
            setState((prev: any) => ({ ...prev, stage: 'synthesis' })); // Return to synthesis if coming back
        }
    }, [mode, state.stage, setState]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const chatPanel = (
        <ConfigChat
            messages={messages}
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode={mode}
            selectedBlockId={selectedBlockId}
        />
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
                <BuilderModeToggle
                    mode={mode}
                    onChange={setMode}
                    isReadyToBuild={state.isCanvasReady}
                />
                <Button
                    disabled={!state.readiness.isValid || state.isGenerating}
                    onClick={handlePublish}
                    size="sm"
                    className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-20 transition-all"
                >
                    {state.isGenerating ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Terminal size={16} />
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
                <BuilderLayout
                    mode={mode}
                    chatPanel={chatPanel}
                    hudPanel={<CoverageHUD state={state} />}
                    contentPanel={
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
