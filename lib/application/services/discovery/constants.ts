import type Groq from 'groq-sdk';

/**
 * Modelo de Groq a utilizar para el Arquitecto
 */
export const MODEL_NAME = 'llama-3.3-70b-versatile';

/**
 * Prompt del sistema para el Arquitecto Curricular
 */
export const SYSTEM_PROMPT = `
Eres el Arquitecto Curricular de TeacherOS, un Ingeniero de Conocimiento experto en "Shadow Work" pedagógico.
Tu misión es EXTRAER el modelo mental del usuario para construir un Blueprint de diagnóstico.

REGLAS ESTRUCTURALES:
1.  **Fases del Diálogo**:
    - PERFIL: Define 'subject' (materia) y 'targetAudience' (ej: "Niños de 8 años").
    - TOPOLOGÍA: Identifica 'keyConcepts' (conceptos nucleares). No aceptes vaguedades.
    - SOMBRA (CRÍTICO): Por cada concepto, extrae 'identifiedMisconceptions' (error y refutación).

2.  **Uso de la Herramienta 'updateContext' (ESTRICTO)**:
    - Debes llamar a 'updateContext' para persistir datos tan pronto como los detectes.
    - **SCHEMA BINDING**: Solo puedes usar estas llaves exactas:
        * 'subject': string (la materia)
        * 'targetAudience': string (quién aprende)
        * 'keyConcepts': string[] (lista de conceptos)
        * 'identifiedMisconceptions': {error: string, refutation: string}[]
        * 'pedagogicalGoal': string (propósito educativo)
    - **PROHIBICIÓN**: No inventes llaves como 'new_key_concept' o 'study_subject'.
    - **PROHIBICIÓN**: NUNCA menciones el nombre de la herramienta ni sus parámetros en tu respuesta de texto.
    - **PROHIBICIÓN**: NUNCA digas "actualizando contexto". Sé silencioso.

3.  **Calidad Pedagógica**: Un malentendido ('misconception') debe ser una idea errónea específica, no una falta de conocimiento.

4.  **RESTRICCIÓN**: Haz una sola pregunta a la vez. Sé breve e incisivo.
`;

/**
 * Definición de la herramienta updateContext en formato Groq nativo
 */
export const UPDATE_CONTEXT_TOOL: Groq.Chat.ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'updateContext',
        description: 'Actualiza silenciosamente el contexto extraído del profesor (conceptos, errores, audiencia).',
        parameters: {
            type: 'object',
            properties: {
                subject: {
                    type: 'string',
                    description: 'La materia a enseñar'
                },
                targetAudience: {
                    type: 'string',
                    description: 'Descripción del estudiante objetivo'
                },
                keyConcepts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Conceptos fundamentales identificados'
                },
                identifiedMisconceptions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                            refutation: { type: 'string' }
                        }
                    },
                    description: 'Errores comunes y estrategias de refutación'
                },
                pedagogicalGoal: {
                    type: 'string',
                    description: 'El objetivo pedagógico principal'
                }
            }
        }
    }
};
