import { ChatGroq } from "@langchain/groq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { IAIProvider } from "../domain/repositories/ai-provider";
import { PlanningProposal } from "../application/services/orchestrator/types";

/**
 * Adapter for LangChain + Groq/OpenAI.
 * Concrete implementation of the IAIProvider port.
 */
export class LangChainAIAdapter implements IAIProvider {
    private llm: ChatGroq;
    private embeddings: OpenAIEmbeddings;

    constructor(groqApiKey: string, openaiApiKey: string) {
        this.llm = new ChatGroq({
            apiKey: groqApiKey,
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
        });

        this.embeddings = new OpenAIEmbeddings({
            apiKey: openaiApiKey,
            model: "text-embedding-3-small",
        });
    }

    async generatePlanning(prompt: string): Promise<PlanningProposal> {
        const response = await this.llm.invoke(prompt);
        try {
            return JSON.parse(response.content as string) as PlanningProposal;
        } catch (e) {
            console.error("Error parsing LLM response in Adapter:", response.content);
            throw new Error("La IA generó un formato de plan inválido.");
        }
    }

    async generateQuiz(context: string): Promise<any[]> {
        const prompt = `
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
        const response = await this.llm.invoke(prompt);
        return JSON.parse(response.content as string);
    }

    async embedQuery(text: string): Promise<number[]> {
        return this.embeddings.embedQuery(text);
    }
}
