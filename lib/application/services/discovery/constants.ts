import type Groq from 'groq-sdk';
import { z } from 'zod';

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
                    description: 'Key concepts identified'
                },
                identifiedMisconceptions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            error: { type: 'string', description: 'Conceptual error' },
                            refutation: { type: 'string', description: 'Counter-example' },
                            distractor_artifact: { type: 'string', description: 'Wrong answer example' },
                            observable_symptom: { type: 'string', description: 'Behavioral cue' }
                        },
                        required: ['error', 'refutation']
                    },
                    description: 'Deep conceptual errors'
                },
                pedagogicalGoal: { type: 'string' },
                studentProfile: { type: 'string' },
                contentPreference: { type: 'string', enum: ['user_provided', 'ai_suggested', 'mixed'] },
                examConfig: {
                    type: 'object',
                    properties: {
                        questionCount: { type: 'number' },
                        durationMinutes: { type: 'number' }
                    }
                }
            },
            required: [] // Allow partial updates
        }
    }
};

export const UPDATE_CONTEXT_TOOL_DEFINITION = {
    description: 'Actualiza el blueprint del examen con nueva información identificada.',
    parameters: z.object({
        subject: z.string().optional(),
        targetAudience: z.string().optional(),
        pedagogicalGoal: z.string().optional(),
        keyConcepts: z.array(z.string()).optional(),
        identifiedMisconceptions: z.array(z.object({
            error: z.string(),
            distractor_artifact: z.string().optional(),
            refutation: z.string().optional()
        })).optional(),
        examConfig: z.object({
            questionCount: z.number().optional(),
            durationMinutes: z.number().optional()
        }).optional()
    })
};
