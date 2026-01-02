import { z } from 'zod';
import { BloomLevel } from '../assessment';

// --- Content Library (Brickyard) ---

export type AtomicLearningObject = {
    id: string;
    title: string;
    description: string;
    type: string;
    content_url: string;
    metadata: {
        bloom_level: BloomLevel;
        estimated_duration?: number;
        skills: string[];
    };
    created_by: string;
    created_at: string;
};

export const ALOSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(5, 'El título del objeto de aprendizaje es muy corto (mín. 5 caracteres)'),
    description: z.string().min(10, 'Añade una descripción pedagógica (mín. 10 caracteres)'),
    type: z.union([z.literal('video'), z.literal('quiz'), z.literal('text')]),
    payload: z.record(z.string(), z.any()).refine((val) => val !== null, "El payload no puede ser nulo"),
    metadata: z.object({
        bloom_level: z.string(),
        estimated_duration: z.coerce.number().optional(),
        skills: z.array(z.string()),
    }).optional(),
    is_public: z.boolean().optional(),
}).refine((data) => {
    if (data.type === 'video') {
        return !!data.payload.url && typeof data.payload.url === 'string';
    }
    if (data.type === 'quiz') {
        return Array.isArray(data.payload.questions) && data.payload.questions.length > 0;
    }
    if (data.type === 'text') {
        return !!data.payload.content && typeof data.payload.content === 'string';
    }
    return true;
}, {
    message: "El payload no coincide con el tipo de contenido seleccionado",
    path: ["payload"]
});
