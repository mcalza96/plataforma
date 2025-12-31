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
    // Construir contexto de misconceptions con evidencia forense
    let misconceptionsContext = '';

    if (context.identifiedMisconceptions && context.identifiedMisconceptions.length > 0) {
        misconceptionsContext = context.identifiedMisconceptions
            .map((m, idx) => {
                let block = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nERROR DETECTADO #${idx + 1}: ${m.error}\n`;

                // Agregar evidencia forense si existe
                if (m.distractor_artifact) {
                    block += `\n🎯 EVIDENCIA FORENSE (ARTIFACT): "${m.distractor_artifact}"\n`;
                    block += `\n⚠️ REGLA MANDATORIA DE GENERACIÓN:\n`;
                    block += `   Debes generar una opción de respuesta cuyo texto sea EXACTAMENTE: "${m.distractor_artifact}"\n`;
                    block += `   - NO lo cambies\n`;
                    block += `   - NO lo "corrijas"\n`;
                    block += `   - NO lo reformules\n`;
                    block += `   - Si el artifact es "${m.distractor_artifact}", la opción DEBE ser "${m.distractor_artifact}"\n`;
                    block += `   - Esta opción debe tener isCorrect: false\n`;
                    block += `   - Esta opción debe diagnosticar este error específico\n`;
                }

                if (m.observable_symptom) {
                    block += `\n👁️ SÍNTOMA OBSERVABLE: ${m.observable_symptom}\n`;
                    block += `\n📋 INSTRUCCIÓN PARA OBSERVER_GUIDE:\n`;
                    block += `   Utiliza este síntoma para instruir al padre/supervisor sobre qué comportamiento observar.\n`;
                    block += `   Ejemplo: "Observa si ${m.observable_symptom.toLowerCase()}"\n`;
                }

                block += `\n🔄 REFUTACIÓN: ${m.refutation}\n`;
                block += `   (Usa esta refutación para el feedback de la opción incorrecta)\n`;
                block += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

                return block;
            })
            .join('\n');
    } else {
        misconceptionsContext = '\n⚠️ Ningún error específico detectado. Genera distractores basados en errores comunes del dominio.\n';
    }

    return `
Eres un Diseñador Psicometrista Senior de TeacherOS especializado en "Ingeniería de Distractores Forenses".

Tu misión NO es inventar distractores creativos. Tu misión es usar la EVIDENCIA FORENSE capturada del experto para construir trampas diagnósticas precisas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO PEDAGÓGICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATERIA: ${context.subject || 'No especificada'}
AUDIENCIA: ${context.targetAudience || 'No especificada'}
OBJETIVO PEDAGÓGICO: ${context.pedagogicalGoal || 'No especificado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERRORES CONCEPTUALES CON EVIDENCIA FORENSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${misconceptionsContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROTOCOLO DE GENERACIÓN ESTRICTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TIPO DE PREGUNTA:
   - Genera SIEMPRE 'multiple_choice_rationale'
   - La pregunta (stem) debe ser clara y apropiada para la audiencia

2. REGLA DE ORO - DISTRACTORES MANDATORIOS:
   - Si un error tiene "EVIDENCIA FORENSE (ARTIFACT)", DEBES usar ese texto EXACTO como una opción
   - NO inventes distractores cuando tienes artifacts capturados
   - La prioridad es FIDELIDAD FORENSE sobre creatividad

3. ESTRUCTURA DE OPCIONES:
   - Una opción correcta (isCorrect: true)
   - Al menos una opción con el ARTIFACT EXACTO (isCorrect: false)
   - Opcionalmente, otros distractores comunes
   - Cada distractor debe tener feedback explicativo basado en la REFUTACIÓN proporcionada

4. OBSERVER_GUIDE (OBLIGATORIO):
   - Genera una guía corta y accionable para el padre/supervisor
   - Debe basarse en los SÍNTOMAS OBSERVABLES proporcionados
   - Formato: "Observa si [comportamiento específico]. Si [condición], indica [diagnóstico]."
   - Ejemplo: "Observa si el estudiante escribe la respuesta inmediatamente sin pausar. Si escribe '2/8' rápidamente, está sumando linealmente los denominadores."

5. FEEDBACK DE DISTRACTORES:
   - Usa la REFUTACIÓN proporcionada para explicar por qué el error es incorrecto
   - Debe ser empático y educativo
   - Debe ayudar al estudiante a entender su modelo mental defectuoso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EJEMPLO DE SALIDA ESPERADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si el artifact capturado es "2/8" para el error "suma lineal de denominadores":

{
  "type": "multiple_choice_rationale",
  "stem": "¿Cuánto es 1/4 + 1/4?",
  "options": [
    {
      "content": "1/2",
      "isCorrect": true,
      "feedback": "¡Correcto! 1/4 + 1/4 = 2/4 = 1/2"
    },
    {
      "content": "2/8",  // ← ARTIFACT EXACTO, sin modificar
      "isCorrect": false,
      "feedback": "Parece que sumaste los numeradores (1+1=2) y los denominadores (4+4=8). Recuerda que para sumar fracciones, el denominador debe ser común. 2/8 es equivalente a 1/4, lo que significaría que sumar algo a sí mismo no aumenta su valor - una contradicción.",
      "diagnosesMisconceptionId": "suma_lineal_denominadores"
    }
  ],
  "observer_guide": "Observa si el estudiante escribe la respuesta inmediatamente sin detenerse a buscar un denominador común. Si escribe '2/8' rápidamente, está sumando linealmente los numeradores y denominadores."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECUERDA: Tu trabajo es ser un FORENSE, no un CREATIVO. Usa la evidencia capturada con EXACTITUD.
`;
}
