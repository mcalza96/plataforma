'use client';

import { type ArchitectState, INITIAL_ARCHITECT_STATE } from '@/lib/domain/architect';
import { compileDiagnosticProbe } from '@/lib/actions/admin/architect-actions';

interface UseArchitectActionsProps {
    state: ArchitectState;
    setState: React.Dispatch<React.SetStateAction<ArchitectState>>;
    examTitle: string;
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
    setInput: (val: string) => void;
    setIsLoading: (val: boolean) => void;
    onProbeGenerated?: (probeId: string, metadata: any) => void;
}

export function useArchitectActions({
    state,
    setState,
    examTitle,
    setMessages,
    setInput,
    setIsLoading,
    onProbeGenerated
}: UseArchitectActionsProps) {

    const handleGeneratePrototypes = async () => {
        setState(prev => ({ ...prev, isGenerating: true }));
        try {
            const { generatePrototypes } = await import('@/lib/actions/admin/architect-actions');
            const result = await generatePrototypes(state);
            if (result.success && result.prototypes) {
                setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    context: { ...prev.context, prototypes: result.prototypes }
                }));
            } else {
                throw new Error(result.error || "Falla en la generación de prototipos");
            }
        } catch (error: any) {
            console.error("[useArchitectActions] Prototype generation error:", error);
            setState(prev => ({ ...prev, isGenerating: false }));
            alert(error.message || "No se pudo generar los prototipos.");
        }
    };

    const handleGenerate = async () => {
        if (!state.readiness.isValid) return;
        setState(prev => ({ ...prev, isGenerating: true }));
        try {
            const result = await compileDiagnosticProbe(state);
            if (result.success && result.probeId) {
                setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    generatedProbeId: result.probeId
                }));
                if (onProbeGenerated) {
                    onProbeGenerated(result.probeId, {
                        title: (result as any).stem || state.context.subject || 'Sonda de Diagnóstico',
                        misconceptionIds: state.context.identifiedMisconceptions?.map(m => m.competencyId || m.error) || [],
                        options: (result as any).options
                    });
                }
            } else {
                throw new Error(result.error || "Falla en la compilación");
            }
        } catch (error: any) {
            console.error("[useArchitectActions] Generation error:", error);
            setState(prev => ({ ...prev, isGenerating: false }));
            alert(error.message || "No se pudo generar el diagnóstico.");
        }
    };

    const handlePublish = async () => {
        if (!state.readiness.isValid) return;
        setState(prev => ({ ...prev, isGenerating: true }));
        try {
            const { publishExam } = await import("@/lib/actions/assessment/exam-actions");
            const result = await publishExam({
                title: examTitle,
                matrix: state.context,
                questions: state.context.prototypes as any[]
            });
            if (result.success) {
                alert(`¡Examen publicado con éxito!`);
                return result;
            } else {
                throw new Error(result.error || "Falla al publicar");
            }
        } catch (error: any) {
            console.error("[useArchitectActions] Publish error:", error);
            alert(error.message || "No se pudo publicar el examen.");
        } finally {
            setState(prev => ({ ...prev, isGenerating: false }));
        }
    };

    const handleReset = async () => {
        setIsLoading(true);
        try {
            const { resetDiscoveryContext } = await import("@/lib/actions/assessment/discovery-actions");
            const result = await resetDiscoveryContext();
            if (result.success) {
                setMessages([]);
                setState(INITIAL_ARCHITECT_STATE);
                setInput('');
            } else {
                throw new Error(result.error || "Falla al reiniciar");
            }
        } catch (error: any) {
            console.error("[useArchitectActions] Reset error:", error);
            alert(error.message || "No se pudo reiniciar la sesión.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleGeneratePrototypes,
        handleGenerate,
        handlePublish,
        handleReset
    };
}
