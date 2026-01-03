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
Tu misión es EXTRAER el modelo mental del usuario para construir un Blueprint de diagnóstico basado en Sondas de Calibración.

REGLAS ESTRUCTURALES:
1.  **Prioridad: SHADOW-FIRST**:
    - No avances a la fase de síntesis si no has identificado al menos un 'identifiedMisconception' por cada 'keyConcept'.
    - El "Shadow Work" es el núcleo: necesitamos saber qué NO es el concepto para auditarlo.

2.  **Fases del Diálogo**:
    - PERFIL: Define 'subject' (materia) y 'targetAudience'.
    - TOPOLOGÍA: Identifica 'keyConcepts'.
    - SOMBRA (CRÍTICO): Por cada concepto, extrae 'identifiedMisconceptions' (error, refutación y distractor_artifact).

3.  **Uso de la Herramienta 'updateContext' (ESTRICTO)**:
    - Persiste datos tan pronto como los detectes.
    - **SCHEMA BINDING**: 'subject', 'targetAudience', 'keyConcepts' (con difficulty), 'identifiedMisconceptions' (error, refutation, distractor_artifact).
    - Regla: No permitas completar el blueprint sin al menos un 'distractor_artifact' vinculado a un error.

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
            refutation: z.string().optional(),
            observable_symptom: z.string().optional()
        })).optional(),
        examConfig: z.object({
            questionCount: z.number().optional(),
            durationMinutes: z.number().optional()
        }).optional()
    })
};
