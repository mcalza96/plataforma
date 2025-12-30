import { CompetencyNode } from './competency';

export type RelationType = 'prerequisite' | 'misconception_of' | 'remedies';

export interface Edge {
    sourceId: string;
    targetId: string;
    relationType: RelationType;
    weight: number;
}

/**
 * CompetencyGraph Aggregator
 * Encapsulates the graph traversal logic in-memory.
 */
export class CompetencyGraph {
    private nodes: Map<string, CompetencyNode>;
    private edges: Edge[];

    constructor(nodes: CompetencyNode[], edges: Edge[]) {
        this.nodes = new Map(nodes.map(n => [n.id, n]));
        this.edges = edges;
    }

    /**
     * Pure Logic: Recursively finds all dependencies (prerequisites) for a node
     * @param nodeId Starting node
     * @returns Distinct array of prerequisite nodes
     */
    public getPrerequisites(nodeId: string): CompetencyNode[] {
        const prerequisites: Set<CompetencyNode> = new Set();
        const visited: Set<string> = new Set();

        const traverse = (currentId: string) => {
            if (visited.has(currentId)) return;
            visited.add(currentId);

            const directPrereqIds = this.edges
                .filter(e => e.targetId === currentId && e.relationType === 'prerequisite')
                .map(e => e.sourceId);

            for (const prereqId of directPrereqIds) {
                const node = this.nodes.get(prereqId);
                if (node) {
                    prerequisites.add(node);
                    traverse(prereqId);
                }
            }
        };

        traverse(nodeId);
        return Array.from(prerequisites);
    }

    /**
     * Business Logic: Finds malfunctions or misconceptions associated with this node
     */
    public getMisconceptions(nodeId: string): CompetencyNode[] {
        return this.edges
            .filter(e => e.targetId === nodeId && e.relationType === 'misconception_of')
            .map(e => this.nodes.get(e.sourceId))
            .filter((node): node is CompetencyNode => !!node);
    }
}
