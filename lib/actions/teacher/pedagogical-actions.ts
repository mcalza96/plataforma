"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { revalidatePath } from "next/cache";
import { PedagogicalAdvisorService, PedagogicalAlert } from "../../application/services/notifications/pedagogical-advisor";
import { getIntegrityAlerts } from "../admin/analytics/item-actions";
import { getMetacognitiveAnalytics } from "./metacognitive-actions";

/**
 * Recupera y procesa alertas proactivas para el dashboard del maestro.
 */
export async function getProactiveAlerts(examId?: string): Promise<PedagogicalAlert[]> {
    const alerts: PedagogicalAlert[] = [];

    // 1. Alertas de Sesgo Cognitivo (ECE)
    const metacognitive = await getMetacognitiveAnalytics(examId);
    if (metacognitive && metacognitive.students.length > 0) {
        const delusionalCount = metacognitive.students.filter(s => s.archetype === 'DELUSIONAL').length;
        const eceAlert = PedagogicalAdvisorService.getMetacognitiveAlert(delusionalCount / metacognitive.students.length);
        if (eceAlert) alerts.push(eceAlert);
    }

    // 2. Alertas de Integridad (Poda de Distractores)
    const integrityAlerts = await getIntegrityAlerts();
    const relevantIntegrity = integrityAlerts
        .filter(a => a.alert_type === 'USELESS_DISTRACTOR' || a.alert_type === 'HIGH_SLIP')
        .map(a => PedagogicalAdvisorService.translateIntegrityAlert(a));

    alerts.push(...relevantIntegrity);

    return alerts;
}

/**
 * Ejecuta la poda inteligente de un distractor.
 * @param alertId ID de la alerta que disparó la poda
 */
export async function executeSmartPruning(alertId: string) {
    await validateAdmin(); // Solo maestros/admins pueden podar
    const supabase = await createClient();

    // 1. Obtener detalles de la alerta
    const { data: alert, error: fetchError } = await supabase
        .from('integrity_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

    if (fetchError || !alert) {
        throw new Error('No se encontró la alerta de poda.');
    }

    const questionId = alert.question_id;
    const optionId = alert.metadata?.option_id;

    if (!questionId || !optionId) {
        throw new Error('Datos de poda incompletos en la alerta.');
    }

    console.log(`[SmartPruning] Executing removal of option ${optionId} from item ${questionId}`);

    // 2. Ejecutar la poda física (Eliminar la opción)
    // Nota: En un sistema real, podríamos querer marcarla como deshabilitada en lugar de DELETE físico
    // Pero el requerimiento pide "podarla" ejecutando un Server Action.
    const { error: deleteError } = await supabase
        .from('probe_options')
        .delete()
        .eq('id', optionId)
        .eq('probe_id', questionId);

    if (deleteError) {
        console.error('Error during physical pruning:', deleteError);
        throw new Error('Fallo crítico al eliminar el distractor.');
    }

    // 3. Marcar alerta como resuelta
    await supabase
        .from('integrity_alerts')
        .update({ is_resolved: true })
        .eq('id', alertId);

    revalidatePath('/app/teacher');
    revalidatePath('/app/admin/calibration');

    return {
        success: true,
        message: 'La precisión de la sonda ha mejorado al eliminar el ruido estadístico.'
    };
}
