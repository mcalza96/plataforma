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
        * 'identifiedMisconceptions': {error: string, refutation: string, distractor_artifact?: string, observable_symptom?: string}[]
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
                            error: {
                                type: 'string',
                                description: 'QUALITY RULE: Must be a deep conceptual misunderstanding or false mental model (e.g., "Student believes heavy objects fall faster because they have more force"). NOT ACCEPTABLE: Simple calculation slips or lack of attention. REQUIRED: Must include student\'s INTERNAL LOGIC. Format: "[Wrong belief] because [student\'s reasoning]"'
                            },
                            distractor_artifact: {
                                type: 'string',
                                description: 'CRITICAL: The exact incorrect answer or literal value the student would write/say. E.g., if the error is adding denominators, this value MUST be "2/8". Do not describe the error here, provide the ARTIFACT. This is the literal distractor that will appear in the exam.'
                            },
                            observable_symptom: {
                                type: 'string',
                                description: 'A visual or behavioral cue for an external observer (parent/teacher) to detect this error without seeing the result. E.g., "Student hesitates for >5 seconds", "Uses fingers to count", "Erases the answer twice", "Writes numerators and denominators at the same speed without pausing".'
                            },
                            refutation: {
                                type: 'string',
                                description: 'QUALITY RULE: A specific counter-example, visual proof, or thought experiment that proves the student\'s logic wrong WITHOUT requiring a teacher\'s explanation. It must be self-evident. E.g., "Show that 1/4 + 1/4 is half a pizza, while 2/8 is just a quarter - proving that adding something to itself cannot result in the same or smaller value". NOT ACCEPTABLE: Just stating the correct rule or explaining the theory.'
                            }
                        }
                    },
                    description: 'Errores conceptuales profundos (no simples olvidos) con su lógica interna y estrategia de refutación específica'
                },
                pedagogicalGoal: {
                    type: 'string',
                    description: 'El objetivo pedagógico principal'
                }
            }
        }
    }
};
