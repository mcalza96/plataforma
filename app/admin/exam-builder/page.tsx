"use client";

import React from "react";
import { BuilderLayout } from "@/components/admin/builder/BuilderLayout";
import { ConfigChat } from "@/components/admin/builder/ConfigChat";
import { CoverageHUD } from "@/components/admin/builder/CoverageHUD";
import { useExamBuilder } from "@/hooks/admin/builder/useExamBuilder";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Rocket, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ExamPreview } from "@/components/admin/builder/ExamPreview";
import { saveDiscoveryContext } from "@/lib/actions/discovery-actions";

export default function ExamBuilderPage() {
    const {
        state,
        examTitle,
        setExamTitle,
        readiness,
        canPublish,
        lastSyncedAt,
        handleSync,
        updateConceptStatus,
        setState
    } = useExamBuilder();

    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);

    // Handle tool calls from chat to update builder state
    const handleUpdateFromChat = async (toolCall: any) => {
        if (toolCall.method === 'updateContext') {
            const { subject, targetAudience, keyConcepts, identifiedMisconceptions, pedagogicalGoal } = toolCall.args;

            setState(prev => {
                // Accumulate concepts (deduplicate by name)
                let updatedConcepts = prev.matrix.concepts;
                if (keyConcepts && keyConcepts.length > 0) {
                    const existingNames = new Set(prev.matrix.concepts.map(c => c.name.toLowerCase()));
                    const newConcepts = keyConcepts
                        .filter((name: string) => typeof name === 'string' && !existingNames.has(name.toLowerCase()))
                        .map((name: string) => ({
                            id: crypto.randomUUID(),
                            name,
                            status: 'PENDING' as const
                        }));
                    updatedConcepts = [...prev.matrix.concepts, ...newConcepts];
                }

                // Accumulate misconceptions (deduplicate by description)
                let updatedMisconceptions = prev.matrix.misconceptions;
                if (identifiedMisconceptions && identifiedMisconceptions.length > 0) {
                    const existingDescriptions = new Set(
                        prev.matrix.misconceptions.map(m => m.description.toLowerCase())
                    );
                    const newMisconceptions = identifiedMisconceptions
                        .filter((m: any) => {
                            if (!m) return false;
                            const desc = (m.error || m.description || '').toLowerCase();
                            return desc && !existingDescriptions.has(desc);
                        })
                        .map((m: any) => ({
                            id: crypto.randomUUID(),
                            description: m.error || m.description || 'Unknown Error',
                            hasTrap: !!(m.distractor_artifact || m.hasTrap)
                        }));
                    updatedMisconceptions = [...prev.matrix.misconceptions, ...newMisconceptions];
                }

                const newMatrix = {
                    ...prev.matrix,
                    subject: subject || prev.matrix.subject,
                    targetAudience: targetAudience || prev.matrix.targetAudience,
                    pedagogicalGoal: pedagogicalGoal || prev.matrix.pedagogicalGoal,
                    concepts: updatedConcepts,
                    misconceptions: updatedMisconceptions
                };

                // Side effect OUTSIDE the state calculation (async wrapper not needed here, 
                // but we should just fire it. However, doing it inside setState callback is risky for async updates.
                // Better approach: Calculate new state, then update local state, then save to DB.
                // But setState requires accessing 'prev'.

                // Fire-and-forget save to server with the CALCULATED new matrix
                // This is still inside the callback but we are not blocking rendering.
                // The warning "Cannot update a component while rendering" usually happens if we trigger ANOTHER state update from here.
                // saveDiscoveryContext is an async server action, so it shouldn't block render.
                // The issue might be if saveDiscoveryContext triggers a revalidation that updates a component.

                // Let's use a timeout to detach it from the render cycle just to be safe, 
                // OR better: use the returned state result in a useEffect.
                // However, since we are in an event handler (technically), we can't access 'prev' outside.

                // FIX: Don't put the side effect here. 
                // Since we need 'prev', we can't do it easily outside without reading state.matrix which might be stale.
                // But 'state' form useExamBuilder is available.

                // Actually, the cleanest way is to use the callback to calculate state, return it, 
                // and use a useEffect to sync changes? No, that causes loops.

                // Let's defer the server save execution to the next tick.
                setTimeout(() => {
                    saveDiscoveryContext("draft-exam", newMatrix);
                }, 0);

                return {
                    ...prev,
                    matrix: newMatrix
                };
            });
            handleSync();
        }
    };

    const handlePublish = async () => {
        if (!canPublish) return;
        setIsPublishing(true);
        try {
            const { publishExam } = await import("@/lib/actions/exam-actions");
            const result = await publishExam({ title: examTitle, matrix: state.matrix });
            if (result.success) {
                alert(`¡Examen publicado con éxito! ID: ${result.examId}`);
            } else {
                alert(`Error al publicar: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    const header = (
        <div className="flex items-center justify-between w-full">
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
                            className="bg-transparent border-none text-base font-black text-white p-0 h-auto focus:ring-0 w-[300px]"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">Draft Mode</span>
                            {lastSyncedAt && (
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                                    Sincronizado: {lastSyncedAt.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewOpen(true)}
                    className="h-10 rounded-xl border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-widest gap-2 hover:bg-white/10"
                >
                    <Eye size={16} />
                    Blueprint
                </Button>
                <Button
                    disabled={!canPublish || isPublishing}
                    onClick={handlePublish}
                    size="sm"
                    className="h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-20 transition-all"
                >
                    {isPublishing ? (
                        <div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <Rocket size={16} />
                    )}
                    Publicar
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <BuilderLayout
                header={header}
                sidebar={
                    <ConfigChat
                        examTitle={examTitle}
                        stage={state.stage}
                        matrix={state.matrix}
                        onUpdateState={handleUpdateFromChat}
                    />
                }
            >
                <div className="max-w-4xl mx-auto space-y-12 pb-20">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                            <h2 className="text-3xl font-black text-white tracking-tight">Arquitectura del Diagnóstico</h2>
                        </div>
                        <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                            Diseño asistido por IA: El Agente Arquitecto mapea la topología del conocimiento mientras detecta nodos sombra (misconceptions) en tiempo real.
                        </p>
                    </div>

                    <CoverageHUD
                        stage={state.stage}
                        readiness={readiness}
                        concepts={state.matrix.concepts}
                        misconceptions={state.matrix.misconceptions}
                        onConceptClick={(name) => console.log("Focus:", name)}
                    />

                    {/* Footer decoration */}
                    <div className="mt-20 pt-10 border-t border-white/5 opacity-20">
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
                            <span>Knowledge Engine V2.1</span>
                            <span>Shadow Work Protocol Active</span>
                            <span>Node Density: {state.matrix.concepts.length + state.matrix.misconceptions.length}</span>
                        </div>
                    </div>
                </div>
            </BuilderLayout>

            <ExamPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                state={state}
                title={examTitle}
            />
        </>
    );
}
