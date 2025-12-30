'use server';

import { DiagnosisSchema } from './validations';
import { getAIOrchestratorService } from './di';
import { validateAdmin } from './infrastructure/auth-utils';
import { ActionResponse } from './admin-content-actions';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/infrastructure/rate-limit';

/**
 * Genera una propuesta de camino de aprendizaje personalizado
 * a partir de las notas/diagnóstico del profesor.
 */
export async function generateCustomPath(data: z.infer<typeof DiagnosisSchema>): Promise<ActionResponse> {
    // Rate Limit Check
    // In a real app, use the authenticated user ID. Here we mock it or use IP if available.
    const identifier = "mock-user-id";
    const { success } = await checkRateLimit(identifier, 'diagnostic');

    if (!success) {
        return {
            success: false,
            error: "Has alcanzado tu límite de velocidad cognitiva por hoy (Rate Limit Exceeded)."
        };
    }

    try {
        // 1. Seguridad: Solo admin/instructor
        await validateAdmin();

        // 2. Validación de datos
        const validated = DiagnosisSchema.parse(data);

        // 3. Orquestación de IA
        const aiService = getAIOrchestratorService();
        const proposal = await aiService.generatePath(validated);

        // Track Usage (Async, fire and forget)
        import('@/lib/services/usage-tracker').then(({ UsageTrackerService }) => {
            const inputTokens = JSON.stringify(validated).length / 4; // Rough estimation
            const outputTokens = JSON.stringify(proposal).length / 4;
            UsageTrackerService.track({
                userId: 'mock-user-id', // Replace with real ID
                model: 'gemini-1.5-pro',
                tokensInput: Math.ceil(inputTokens),
                tokensOutput: Math.ceil(outputTokens),
                featureUsed: 'diagnostic'
            });
        });

        return {
            success: true,
            data: proposal
        };
    } catch (error: any) {
        console.error('Error generating AI path:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Datos de diagnóstico inválidos.',
                issues: error.issues
            };
        }

        return {
            success: false,
            error: error.message || 'Error inesperado al orquestar la IA'
        };
    }
}

/**
 * Persiste el camino de aprendizaje personalizado para un alumno.
 * Implementa Copy-on-Write (CoW) para preservar la biblioteca global.
 */
export async function commitCustomPath(data: {
    learner_id: string;
    modules: any[];
}): Promise<ActionResponse> {
    try {
        await validateAdmin();
        const { learner_id, modules } = data;

        // Carga dinámica de dependencias para evitar ciclos en compilación
        const { getContentRepository } = await import('./di');
        const contentRepo = getContentRepository();
        const { createClient } = await import('./infrastructure/supabase/supabase-server');
        const supabase = await createClient();

        const pathNodes = [];
        let previousNodeId = null;

        for (const mod of modules) {
            let finalContentId = mod.content_id;

            // Lógica Copy-on-Write (CoW)
            if (mod.has_custom_edits) {
                const { getUserId } = await import('./infrastructure/auth-utils');
                const userId = await getUserId();

                const clonedALO = await contentRepo.createContent({
                    ...mod.original_alo,
                    title: mod.title_override || mod.original_alo.title,
                    description: mod.description_override || mod.original_alo.description,
                    is_public: false, // Personalizaciones son siempre privadas
                }, userId || '');

                finalContentId = clonedALO.id;
            }

            // Inserción del nodo en el camino del alumno
            const { data: node, error } = await supabase
                .from('path_nodes')
                .insert({
                    learner_id,
                    content_id: finalContentId,
                    title_override: mod.title_override,
                    description_override: mod.description_override,
                    order: mod.order,
                    parent_node_id: previousNodeId
                })
                .select()
                .single();

            const typedNode = node as any; // Cast manual para evitar el error de inferencia circular
            if (error) throw error;
            pathNodes.push(typedNode);
            previousNodeId = typedNode.id;
        }

        return {
            success: true,
            data: pathNodes
        };

    } catch (error: any) {
        console.error('Error committing custom path:', error);
        return {
            success: false,
            error: error.message || 'Error al persistir el camino personalizado'
        };
    }
}
