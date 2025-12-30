import { streamObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { ProposalSchema } from '@/lib/validations';
import { z } from 'zod';

// Configuración de streaming para planes de aprendizaje
export async function POST(req: Request) {
    const { diagnosis } = await req.json();

    const result = await streamObject({
        model: groq('llama-3.3-70b-versatile'),
        schema: ProposalSchema,
        prompt: `
        Eres el "Secretario Técnico" de una academia EdTech LEGO. 
        Tu misión es diseñar un "Camino de Aprendizaje" personalizado.

        DIAGNÓSTICO DEL ALUMNO:
        - Edad: ${diagnosis.learner_profile.age}
        - Estilo: ${diagnosis.learner_profile.style}
        - Materia: ${diagnosis.subject}
        - Brechas: ${diagnosis.identified_gaps.join(", ")}

        REGLAS PEDAGÓGICAS:
        1. Sigue la Taxonomía de Bloom: Fundamentos antes que Aplicaciones.
        2. Selecciona contenidos que resuelvan las brechas (Búscalos por su relevancia teórica).
        3. El orden debe ser lógico y progresivo ("metodología LEGO").

        Genera una propuesta estructurada.
        `,
    });

    return result.toTextStreamResponse();
}
