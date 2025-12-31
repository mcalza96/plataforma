import type { PlanningProposal } from './types';
import type { AtomicLearningObject } from '../../../domain/schemas/alo';

/**
 * Audita una propuesta de planificación para validar su consistencia
 */
export function auditProposal(
    proposal: PlanningProposal,
    availableALOs: AtomicLearningObject[]
): void {
    const availableIds = new Set(availableALOs.map(a => a.id));

    // Verificar que todos los IDs existan
    for (const mod of proposal.modules) {
        if (!availableIds.has(mod.content_id)) {
            throw new Error(
                `El plan incluye un contenido inexistente o no recuperado: ${mod.content_id}`
            );
        }
    }

    // Verificar que no haya ciclos o duplicados de orden
    const orders = proposal.modules.map(m => m.order);
    if (new Set(orders).size !== orders.length) {
        throw new Error("El plan generado tiene errores en la secuencia de órdenes.");
    }
}
