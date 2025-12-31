import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

/**
 * Obtiene el cliente Groq singleton
 */
export function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            throw new Error("GROQ_API_KEY no está configurada en el servidor.");
        }

        groqClient = new Groq({ apiKey });
    }

    return groqClient;
}
