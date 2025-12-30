import { ChatGroq } from "@langchain/groq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { IContentRepository } from "../repositories/content-repository";
import { AtomicLearningObject, BloomLevel } from "../domain/course";
import { DiagnosisSchema } from "../validations";
import { z } from "zod";

type Diagnosis = z.infer<typeof DiagnosisSchema>;

export interface PlanningProposal {
    suggested_title: string;
    rationale: string;
    modules: {
        content_id: string;
        order: number;
        reason: string;
    }[];
}

export class AIOrchestratorService {
    private llm: ChatGroq;
    private embeddings: OpenAIEmbeddings;
    private contentRepository: IContentRepository;

    constructor(
        groqApiKey: string,
        openaiApiKey: string,
        contentRepository: IContentRepository
    ) {
        this.llm = new ChatGroq({
            apiKey: groqApiKey,
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
        });

        this.embeddings = new OpenAIEmbeddings({
            apiKey: openaiApiKey,
            model: "text-embedding-3-small",
        });

        this.contentRepository = contentRepository;
    }

    /**
     * Genera un plan de aprendizaje personalizado basado en el diagnóstico.
     */
    async generatePath(diagnosis: Diagnosis): Promise<PlanningProposal> {
        // 1. Fase de Recuperación (Retrieval)
        // Generamos un embedding de las brechas detectadas para buscar contenidos relevantes
        const queryText = `${diagnosis.subject}: ${diagnosis.identified_gaps.join(", ")}`;
        const queryVector = await this.embeddings.embedQuery(queryText);

        const relevantALOs = await this.contentRepository.findRelevantItems(queryVector, 10);

        if (relevantALOs.length === 0) {
            throw new Error("No se encontraron contenidos relevantes en la biblioteca para estas brechas.");
        }

        // 2. Fase de Arquitectura (Sequencing)
        const proposal = await this.sequenceContent(diagnosis, relevantALOs);

        // 3. Fase de Auditoría (Validation)
        this.auditProposal(proposal, relevantALOs);

        return proposal;
    }

    private async sequenceContent(diagnosis: Diagnosis, alos: AtomicLearningObject[]): Promise<PlanningProposal> {
        const alosMetadata = alos.map(a => ({
            id: a.id,
            title: a.title,
            type: a.type,
            level: a.metadata.bloom_level,
            skills: a.metadata.skills
        }));

        const prompt = `
        Eres el "Secretario Técnico" de una academia EdTech LEGO. 
        Tu misión es diseñar un "Camino de Aprendizaje" personalizado.

        DIAGNÓSTICO DEL ALUMNO:
        - Edad: ${diagnosis.learner_profile.age}
        - Estilo: ${diagnosis.learner_profile.style}
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

        const response = await this.llm.invoke(prompt);
        // Nota: La respuesta de ChatGroq con json_mode o prompt explícito suele ser JSON
        try {
            const result = JSON.parse(response.content as string);
            return result as PlanningProposal;
        } catch (e) {
            console.error("Error parsing LLM response:", response.content);
            throw new Error("La IA generó un formato de plan inválido.");
        }
    }

    private auditProposal(proposal: PlanningProposal, availableALOs: AtomicLearningObject[]) {
        const availableIds = new Set(availableALOs.map(a => a.id));

        // Verificar que todos los IDs existan
        for (const mod of proposal.modules) {
            if (!availableIds.has(mod.content_id)) {
                throw new Error(`El plan incluye un contenido inexistente o no recuperado: ${mod.content_id}`);
            }
        }

        // Verificar que no haya ciclos o duplicados de orden
        const orders = proposal.modules.map(m => m.order);
        if (new Set(orders).size !== orders.length) {
            throw new Error("El plan generado tiene errores en la secuencia de órdenes.");
        }
    }

    /**
     * Genera un banco de preguntas basado en contenidos seleccionados.
     */
    async generateQuiz(alos: AtomicLearningObject[]): Promise<any[]> {
        const context = alos.map(a => `${a.title}: ${a.description}`).join("\n");

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
}
