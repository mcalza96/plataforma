import { z } from 'zod';

export const RouterIntentSchema = z.enum([
    'CHAT',
    'CANVAS_ACTION',
    'PEDAGOGICAL_QUERY',
]);

export type RouterIntent = z.infer<typeof RouterIntentSchema>;

// Schema for the "Architect" personality outputs
// This allows generating structured changes for the canvas
export const CanvasActionSchema = z.object({
    action: z.enum(['create_lesson', 'update_lesson', 'create_module', 'explain_concept']),
    parameters: z.record(z.string(), z.any()), // Flexible parameters for now, can be tightened later
    reasoning: z.string().describe('Explanation of why this action was chosen from a pedagogical perspective'),
});

export type CanvasAction = z.infer<typeof CanvasActionSchema>;
