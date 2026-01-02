import { BloomLevel } from '@/lib/domain/assessment';
import type { Diagnosis } from './types';

/**
 * Genera el prompt para secuenciación de contenido
 */
export function buildPlanningPrompt(
  diagnosis: Diagnosis,
  alosMetadata: Array<{
    id: string;
    title: string;
    type: string;
    level: string;
    skills: string[];
  }>
): string {
  return `
Eres el "Secretario Técnico" de una academia EdTech LEGO. 
Tu misión es diseñar un "Camino de Aprendizaje" personalizado.

DIAGNÓSTICO DEL ALUMNO:
- Edad: ${diagnosis.student_profile.age}
- Estilo: ${diagnosis.student_profile.style}
- Materia: ${diagnosis.subject}
- Brechas: ${diagnosis.identified_gaps.join(", ")}

CONTENIDOS DISPONIBLES (Atomic Learning Objects):
${JSON.stringify(alosMetadata, null, 2)}

REGLAS PEDAGÓGICAS:
1. Sigue la Taxonomía de Bloom: Fundamentos (${BloomLevel.RECUERDO}, ${BloomLevel.COMPRENSION}) deben ir antes que Aplicaciones (${BloomLevel.APLICACION}, ${BloomLevel.ANALISIS}).
2. Selecciona entre 3 y 6 objetos que mejor resuelvan las brechas.
3. El orden debe ser lógico y progresivo ("metodología LEGO").

Responde ÚNICAMENTE en formato JSON plano:
{
  "suggested_title": "Nombre de la Misión",
  "rationale": "Breve explicación pedagógica de por qué este orden",
  "modules": [
    { "content_id": "UUID", "order": 1, "reason": "Por qué este objeto va aquí" }
  ]
}
`;
}

/**
 * Genera el prompt para generación de quizzes
 */
export function buildQuizPrompt(context: string): string {
  return `
Genera un banco de 5 preguntas de opción múltiple (evaluación formativa) basadas en:
${context}

Responde ÚNICAMENTE en formato JSON plano:
[
  {
    "question": "¿...?",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "Por qué es la correcta"
  }
]
`;
}
