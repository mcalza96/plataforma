import { BloomLevel } from '../domain/course';

export class MetadataService {
    private apiKey: string;
    private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async analyzeContent(description: string): Promise<{
        bloom_level: BloomLevel;
        skills: string[]
    }> {
        try {
            const prompt = `
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

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: 'Eres un experto en pedagogía y taxonomía de Bloom.' },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);

            // Validar que el nivel sea un valor válido del enum
            const bloomLevel = this.mapToBloomLevel(result.bloom_level);

            return {
                bloom_level: bloomLevel,
                skills: result.skills || []
            };

        } catch (error) {
            console.error('Error analyzing content with Groq:', error);
            // Fallback por defecto en caso de error
            return {
                bloom_level: BloomLevel.COMPRENSION,
                skills: ['Exploración Inicial']
            };
        }
    }

    private mapToBloomLevel(level: string): BloomLevel {
        const normalized = level.toLowerCase();
        if (normalized.includes('recordar')) return BloomLevel.RECUERDO;
        if (normalized.includes('comprender')) return BloomLevel.COMPRENSION;
        if (normalized.includes('aplicar')) return BloomLevel.APLICACION;
        if (normalized.includes('analizar')) return BloomLevel.ANALISIS;
        if (normalized.includes('evaluar')) return BloomLevel.EVALUACION;
        if (normalized.includes('crear')) return BloomLevel.CREACION;
        return BloomLevel.COMPRENSION; // Fallback
    }
}
