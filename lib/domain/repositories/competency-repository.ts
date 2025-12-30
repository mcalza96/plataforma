import { CompetencyNode } from '../competency';
import { Edge } from '../graph';


/**
 * Contract for the Knowledge Graph persistence layer.
 */
export interface ICompetencyRepository {
    /**
     * Atomic save for the knowledge graph state.
     * Implementation should handle UPSERT logic for both nodes and edges.
     */
    saveGraph(nodes: CompetencyNode[], edges: Edge[]): Promise<void>;

    /**
     * Semantic search for similar concepts using pgvector.
     */
    findSimilarNodes(queryVector: number[], limit?: number): Promise<CompetencyNode[]>;

    /**
     * Retrieves a node by its identifier.
     */
    getNodeById(id: string): Promise<CompetencyNode | null>;

    /**
     * Loads a subgraph or the full graph for a user (including global nodes).
     */
    getGraph(userId?: string): Promise<{ nodes: CompetencyNode[]; edges: Edge[] }>;

    /**
     * Upserts a competency or misconception node.
     */
    upsertNode(node: Partial<CompetencyNode>): Promise<void>;
}

