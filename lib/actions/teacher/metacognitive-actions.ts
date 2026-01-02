"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { getUserId } from "@/lib/infrastructure/auth-utils";

export type MetacognitiveArchetype = 'CALIBRATED' | 'DELUSIONAL' | 'UNCERTAIN' | 'DEVELOPING';

export interface MetacognitiveStudent {
    studentId: string;
    accuracy: number;
    certainty: number;
    gap: number;
    archetype: MetacognitiveArchetype;
    blindSpots: number;
    fragileKnowledge: number;
}

export interface MetacognitiveAnalytics {
    students: MetacognitiveStudent[];
    cohortAverageGap: number;
    criticalBlindSpotsCount: number;
    recommendations: string[];
}

export async function getMetacognitiveAnalytics(examId?: string): Promise<MetacognitiveAnalytics | null> {
    const teacherId = await getUserId();
    if (!teacherId) return null;

    const supabase = await createClient();

    // 1. Fetch relevant attempts
    let query = supabase
        .from('exam_attempts')
        .select(`
            id,
            learner_id,
            results_cache,
            learner:profiles!learner_id(id)
        `)
        .eq('status', 'COMPLETED');

    // If no examId, we could filter by teacher's students, but let's assume we want all for now or filter by teacher
    // Based on previous conversations, there's a teacher mapping.
    if (examId) {
        query = query.eq('exam_config_id', examId);
    }

    const { data: attempts, error } = await query;

    if (error || !attempts) {
        console.error("[getMetacognitiveAnalytics] Error fetching attempts:", error);
        return null;
    }

    // 2. Process metrics
    const processedStudents: MetacognitiveStudent[] = attempts.map(attempt => {
        const calibration = attempt.results_cache?.calibration || { certaintyAverage: 0, accuracyAverage: 0, blindSpots: 0, fragileKnowledge: 0 };
        const accuracy = calibration.accuracyAverage || 0;
        const certainty = calibration.certaintyAverage || 0;
        const gap = certainty - accuracy;

        let archetype: MetacognitiveArchetype = 'DEVELOPING';
        if (Math.abs(gap) <= 15) {
            archetype = 'CALIBRATED';
        } else if (gap > 15) {
            archetype = 'DELUSIONAL';
        } else if (gap < -15) {
            archetype = 'UNCERTAIN';
        }

        return {
            studentId: attempt.learner_id,
            accuracy,
            certainty,
            gap,
            archetype,
            blindSpots: calibration.blindSpots || 0,
            fragileKnowledge: calibration.fragileKnowledge || 0
        };
    });

    const cohortAverageGap = processedStudents.length > 0
        ? processedStudents.reduce((acc, s) => acc + Math.abs(s.gap), 0) / processedStudents.length
        : 0;

    const criticalBlindSpotsCount = processedStudents.reduce((acc, s) => acc + s.blindSpots, 0);

    // 3. Generate Tactical Recommendations
    const recommendations: string[] = [];
    if (cohortAverageGap > 20) {
        recommendations.push("Alerta de Descalibración Global: La cohorte muestra una desconexión crítica entre lo que saben y lo que creen saber.");
    }

    const delusionalCount = processedStudents.filter(s => s.archetype === 'DELUSIONAL').length;
    if (delusionalCount > processedStudents.length * 0.3) {
        recommendations.push(`Alta incidencia de Perfiles Delirantes (${Math.round(delusionalCount / processedStudents.length * 100)}%): Priorice sesiones de refutación con contraejemplos para demoler modelos mentales defectuosos.`);
    }

    const uncertainCount = processedStudents.filter(s => s.archetype === 'UNCERTAIN').length;
    if (uncertainCount > processedStudents.length * 0.3) {
        recommendations.push(`Falta de Seguridad Cognitiva (${Math.round(uncertainCount / processedStudents.length * 100)}%): El grupo duda de su capacidad a pesar de tener precisión. Fomente la validación positiva y la automaticidad.`);
    }

    if (criticalBlindSpotsCount > 5) {
        recommendations.push(`Detectados ${criticalBlindSpotsCount} Puntos Ciegos Críticos: Existen conflictos conceptuales 'invisibles' para los alumnos que requieren intervención inmediata.`);
    }

    return {
        students: processedStudents,
        cohortAverageGap,
        criticalBlindSpotsCount,
        recommendations
    };
}
