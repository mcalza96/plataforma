import type { CompetencyNode } from '../../../domain/competency';
import type { PartialKnowledgeMap } from '../../../domain/discovery';

/**
 * Genera el prompt del sistema para generación de probes basado en competencias
 */
export function buildCompetencyProbePrompt(
    competency: CompetencyNode,
    misconceptions: CompetencyNode[]
): string {
    const misconceptionsContext = misconceptions
        .map(m => `- ID: ${m.id}\n  Error: ${m.title}\n  Lógica: ${m.metadata.errorLogic}\n  Refutación: ${m.metadata.refutationStrategy}`)
        .join('\n');

    return `
Eres un Psicometrista Experto y Diseñador Instruccional Senior. 
Tu misión es generar un "Instrumento de Evaluación Diagnóstica" para detectar brechas y errores conceptuales (misconceptions) en alumnos.

COMPETENCIA A EVALUAR:
- Título: ${competency.title}
- Descripción: ${competency.description}

ERRORES CONCEPTUALES CONOCIDOS (Misconceptions):
${misconceptionsContext}

REGLAS DE GENERACIÓN:
1. Si la competencia es teórica, genera 'multiple_choice_rationale'. 
   - Opción Correcta: Debe ser clara y precisa.
   - Distractor Crítico: DEBE ser la consecuencia lógica de uno de los errores conceptuales listados arriba. Asocia el 'diagnosesMisconceptionId' correspondiente.
   - Distractor Común: Un error típico (ej: error de cálculo) con feedback explicativo.
2. Si la competencia es práctica/manual, genera 'phenomenological_checklist'.
   - Descompón el desempeño en ítems binarios (Checklist). 
   - Cada ítem debe ser un observable claro.
   - Si no se cumple, asocia el error conceptual que se estaría manifestando.
3. El feedback debe ser empático y explicar el "por qué" de la falla basada en la lógica del error detectado.
`;
}

/**
 * Genera el prompt del sistema para generación de probes basado en contexto del arquitecto
 */
export function buildContextProbePrompt(context: PartialKnowledgeMap): string {
    const misconceptionsContext = context.identifiedMisconceptions
        ?.map((m, idx) => `ERROR ${idx + 1}: ${m.error}\nREFUTACIÓN: ${m.refutation}`)
        .join('\n\n') || 'Ninguno detectado';

    return `
Eres un Diseñador Psicometrista Senior de TeacherOS. 
Tu especialidad es la "Ingeniería de Distractores": crear preguntas donde las opciones incorrectas no son aleatorias, sino que validan malentendidos específicos.

ESTRATEGIA DE DISEÑO:
1. Analiza el SUJETO y la AUDIENCIA.
2. Genera una pregunta tipo 'multiple_choice_rationale'.
3. LA REGLA DE ORO DE LOS DISTRACTORES:
   - Al menos un distractor DEBE estar diseñado para ser la respuesta que elegiría un alumno que tiene este malentendido específico:
   ---
   ${misconceptionsContext}
   ---
4. El feedback de ese distractor debe explicar por qué esa lógica es errónea basándose en la refutación proporcionada.
`;
}
