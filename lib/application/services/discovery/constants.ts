import type Groq from 'groq-sdk';

/**
 * Modelo de Groq a utilizar para el Arquitecto
 */
export const MODEL_NAME = 'llama-3.3-70b-versatile';
export const FALLBACK_MODEL_NAME = 'llama-3.1-8b-instant';

/**
 * Prompt del sistema para el Arquitecto Curricular
 */
export const DIFFICULTY_TIERS = {
    easy: 45,
    medium: 120,
    hard: 300
};

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
        * 'keyConcepts': { name: string, difficulty: 'easy' | 'medium' | 'hard' }[]
        * 'identifiedMisconceptions': {error: string, refutation: string, distractor_artifact?: string, observable_symptom?: string}[]
        * 'pedagogicalGoal': string (propósito educativo)
    - **PROHIBICIÓN**: No inventes llaves como 'new_key_concept' o 'study_subject'.
    - **PROHIBICIÓN**: NUNCA menciones el nombre de la herramienta ni sus parámetros en tu respuesta de texto.
    - **PROHIBICIÓN**: NUNCA digas "actualizando contexto". Sé silencioso.

3.  **Calidad Pedagógica**: Un malentendido ('misconception') debe ser una idea errónea específica, no una falta de conocimiento.

4.  **RESTRICCIÓN**: Haz una sola pregunta a la vez. Sé breve e incisivo.
`;

/**
 * Definición COMPRIMIDA de updateContext (ahorro: ~200 tokens)
 */
export const UPDATE_CONTEXT_TOOL: Groq.Chat.ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'updateContext',
        description: 'Silently update extracted context (concepts, errors, audience).',
        parameters: {
            type: 'object',
            properties: {
                subject: { type: 'string', description: 'Subject to teach' },
                targetAudience: { type: 'string', description: 'Target student profile' },
                keyConcepts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
                        },
                        required: ['name', 'difficulty']
                    },
                    description: 'Key concepts identified with their difficulty tier'
                },
                identifiedMisconceptions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string',
                                description: 'Conceptual error with student reasoning. Format: "[Wrong belief] because [reasoning]"'
                            },
                            distractor_artifact: {
                                type: 'string',
                                description: 'CRITICAL: Exact wrong answer student would write (e.g., "2/8" for adding fractions incorrectly)'
                            },
                            observable_symptom: {
                                type: 'string',
                                description: 'Behavioral cue (e.g., "hesitates >5s", "uses fingers")'
                            },
                            refutation: {
                                type: 'string',
                                description: 'Counter-example proving error wrong (self-evident, no teacher explanation needed)'
                            }
                        }
                    },
                    description: 'Deep conceptual errors with internal logic'
                },
                pedagogicalGoal: { type: 'string', description: 'Main pedagogical objective' },
                studentProfile: { type: 'string', description: 'Detailed learner profile (e.g. engineering students, context, age)' },
                contentPreference: { type: 'string', enum: ['user_provided', 'ai_suggested', 'mixed'], description: 'How the syllabus is defined' },
                examConfig: {
                    type: 'object',
                    properties: {
                        questionCount: { type: 'number' },
                        durationMinutes: { type: 'number' }
                    }
                }
            }
        }
    }
};
