/**
 * Node types for the Knowledge Graph
 */
export type NodeType = 'competency' | 'misconception' | 'bridge';

/**
 * Strict typing for the metadata JSONB field
 */
export interface CompetencyMetadata {
    refutationStrategy?: string;
    errorLogic?: string;
    diagnosticPrompt?: string;
    isRoot?: boolean;
    [key: string]: any;
}

/**
 * Misconception Value Object
 * Immutable structure representing a common error or misconception
 */
export class Misconception {
    constructor(
        public readonly id: string,
        public readonly errorLogic: string,
        public readonly refutationStrategy: string
    ) {
        Object.freeze(this);
    }
}

/**
 * CompetencyNode Entity
 * Represents a node in the Knowledge Graph
 */
export class CompetencyNode {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string | null,
        public readonly type: NodeType,
        public readonly metadata: CompetencyMetadata,
        public readonly embedding?: number[],
        public readonly createdBy?: string | null
    ) { }

    /**
     * Business Rule: Determines if this node is a starting point in the graph
     */
    public isRoot(): boolean {
        return this.metadata.isRoot === true;
    }

    /**
     * Business Rule: Checks if the node represents a known misconception
     */
    public hasMisconception(): boolean {
        return this.type === 'misconception';
    }

    /**
     * Static factory to create a Misconception Value Object from the entity
     */
    public toMisconceptionVO(): Misconception | null {
        if (!this.hasMisconception()) return null;

        return new Misconception(
            this.id,
            this.metadata.errorLogic || '',
            this.metadata.refutationStrategy || ''
        );
    }
}
