/**
 * Modelo de Groq para análisis de contenido
 */
export const MODEL_NAME = 'llama-3.3-70b-versatile';

/**
 * Prompt del sistema para análisis pedagógico
 */
export const SYSTEM_PROMPT = 'Eres un experto en pedagogía y taxonomía de Bloom.';

/**
 * Template del prompt de análisis
 */
export function buildAnalysisPrompt(description: string): string {
    return `
Analiza la siguiente descripción de un objeto de aprendizaje pedagógico y determina:
1. El nivel de la Taxonomía de Bloom (Recordar, Comprender, Aplicar, Analizar, Evaluar, Crear).
2. Sugiere 3 habilidades (skills) relacionadas que el alumno desarrollará.

Descripción: "${description}"

Responde ÚNICAMENTE en formato JSON plano:
{
    "bloom_level": "Nivel",
    "skills": ["Habilidad 1", "Habilidad 2", "Habilidad 3"]
}
`;
}
