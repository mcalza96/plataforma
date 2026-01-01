import { DiagnosticResult } from '@/lib/domain/evaluation/types';

interface FeedbackNarrative {
    glow: string[];
    grow: string[];
    meta: string;
}

/**
 * FeedbackGenerator
 * Transform raw diagnostic data into qualitative pedagogical narratives.
 * Logic: "Glow & Grow" - Reinforce mastery, isolate bugs without judgment.
 */
export class FeedbackGenerator {

    static generate(result: DiagnosticResult): FeedbackNarrative {
        const glow: string[] = [];
        const grow: string[] = [];
        let meta = "";

        // 1. GLOW: Identify Mastered Competencies
        const mastered = result.competencyDiagnoses.filter(d => d.state === 'MASTERED');
        if (mastered.length > 0) {
            const subjects = mastered.map(d => d.competencyId).join(", "); // Ideally use proper labels
            if (mastered.length === 1) {
                glow.push(`Has demostrado un control técnico sólido sobre ${mastered[0].competencyId}. Tu ejecución fue precisa y fluida.`);
            } else {
                glow.push(`Tu dominio sobre ${mastered.length} conceptos clave es evidente. Destacas especialmente en la aplicación de ${mastered[0].competencyId}.`);
            }
        } else {
            glow.push("Has iniciado el proceso de calibración. Tu esfuerzo inicial establece la línea base para el crecimiento.");
        }

        // 2. GROW: Misconceptions (Bugs) & Gaps
        const misconceptions = result.competencyDiagnoses.filter(d => d.state === 'MISCONCEPTION');
        const gaps = result.competencyDiagnoses.filter(d => d.state === 'GAP');

        if (misconceptions.length > 0) {
            misconceptions.forEach(m => {
                // Template: Clinical isolation of the bug
                grow.push(`En ${m.competencyId}, detectamos una inconsistencia: ${m.evidence.reason}.`);
            });
        }

        if (gaps.length > 0) {
            grow.push(`Identificamos ${gaps.length} áreas donde la falta de fundamentos impide la resolución: ${gaps.map(g => g.competencyId).slice(0, 2).join(", ")}.`);
        }

        if (misconceptions.length === 0 && gaps.length === 0) {
            grow.push("No se detectaron bloqueos críticos en esta sesión. Estás listo para aumentar la complejidad.");
        }

        // 3. META: Calibration Analysis
        const { eceScore, calibrationStatus, blindSpots } = result.calibration;

        if (blindSpots > 0) {
            meta = `Alerta Metacognitiva: Tienes ${blindSpots} puntos ciegos. Reportaste alta seguridad en respuestas incorrectas, lo que indica un error de juicio que debemos recalibrar.`;
        } else if (calibrationStatus === 'UNDERCONFIDENT') {
            meta = "Tu precisión es mayor que tu confianza. Sabes más de lo que crees; confía en tu primer impulso.";
        } else if (calibrationStatus === 'CALIBRATED') {
            meta = "Tu autoevaluación es precisa. Sabes lo que sabes y reconoces lo que ignoras. Excelente madurez cognitiva.";
        } else {
            meta = "Tu calibración está dentro de rangos normales. Continúa monitoreando tu certeza antes de responder.";
        }

        return { glow, grow, meta };
    }
}
