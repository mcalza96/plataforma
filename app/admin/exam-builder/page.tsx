"use client";

import React from "react";
import { BuilderLayout } from "@/components/admin/builder/BuilderLayout";
import { ConfigChat } from "@/components/admin/builder/ConfigChat";
import { CoverageHUD } from "@/components/admin/builder/CoverageHUD";
import { useExamBuilder } from "@/hooks/admin/builder/useExamBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ExamPreview } from "@/components/admin/builder/ExamPreview";

export default function ExamBuilderPage() {
    const {
        state,
        examTitle,
        setExamTitle,
        canPublish,
        updateConceptStatus,
        setState
    } = useExamBuilder();

    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);

    // Handle tool calls from chat to update builder state
    const handleUpdateFromChat = (toolCall: any) => {
        // In a real implementation, we would parse toolCall.args
        // Example: updateContext({ keyConcepts: [...], identifiedMisconceptions: [...] })
        if (toolCall.method === 'updateContext') {
            const { keyConcepts, identifiedMisconceptions } = toolCall.args;

            setState(prev => ({
                ...prev,
                matrix: {
                    concepts: keyConcepts || prev.matrix.concepts,
                    misconceptions: identifiedMisconceptions || prev.matrix.misconceptions
                }
            }));
        }
    };

    const handlePublish = async () => {
        if (!canPublish) return;
        setIsPublishing(true);
        try {
            const { publishExam } = await import("@/lib/actions/exam-actions");
            const result = await publishExam({ title: examTitle, matrix: state.matrix });
            if (result.success) {
                alert(`¡Examen publicado con éxito! URL: ${result.url}`);
            } else {
                alert(`Error al publicar: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleConceptClick = (name: string) => {
        // This could trigger a specific message in chat to focus on this concept
        console.log("Focusing on concept:", name);
    };

    const header = (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full border border-white/5">
                        <ChevronLeft size={16} />
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Input
                        value={examTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExamTitle(e.target.value)}
                        className="bg-transparent border-none text-sm font-black text-white p-0 h-auto focus:ring-0 w-[300px]"
                    />
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded uppercase">Draft</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewOpen(true)}
                    className="h-9 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2"
                >
                    <Eye size={14} />
                    Previsualizar
                </Button>
                <Button
                    disabled={!canPublish || isPublishing}
                    onClick={handlePublish}
                    size="sm"
                    className="h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-amber-500/10"
                >
                    {isPublishing ? (
                        <span className="animate-spin text-sm">⌛</span>
                    ) : (
                        <Rocket size={14} />
                    )}
                    Publicar Examen
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
                        onUpdateState={handleUpdateFromChat}
                    />
                }
            >
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">Entorno de Construcción</h2>
                        <p className="text-sm text-zinc-500 max-w-xl">
                            Conversa con el Agente Arquitecto para definir los límites del conocimiento y los posibles fallos cognitivos de tus alumnos.
                        </p>
                    </div>

                    <CoverageHUD
                        concepts={state.matrix.concepts}
                        misconceptions={state.matrix.misconceptions}
                        onConceptClick={handleConceptClick}
                    />

                    {/* Informative placeholder for ExamPreview functionality */}
                    <div className="mt-20 pt-20 border-t border-white/5 opacity-30 select-none">
                        <p className="text-[10px] font-mono text-center tracking-[0.5em] uppercase">
                            Sistema de Generación de Reactivos Activo
                        </p>
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
