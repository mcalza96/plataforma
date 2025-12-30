import { ICompetencyRepository } from '../../domain/repositories/competency-repository';
import { CompetencyNode } from '../../domain/competency';
import { Edge } from '../../domain/graph';
import { createClient } from './supabase-server';

export class SupabaseCompetencyRepository implements ICompetencyRepository {
    async saveGraph(nodes: CompetencyNode[], edges: Edge[]): Promise<void> {
        const supabase = await createClient();

        // Upsert nodes
        if (nodes.length > 0) {
            const { error: nodeError } = await supabase
                .from('competency_nodes')
                .upsert(nodes);
            if (nodeError) throw nodeError;
        }

        // Upsert edges
        if (edges.length > 0) {
            const { error: edgeError } = await supabase
                .from('competency_edges')
                .upsert(edges);
            if (edgeError) throw edgeError;
        }
    }

    async findSimilarNodes(queryVector: number[], limit: number = 5): Promise<CompetencyNode[]> {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('match_competency_nodes', {
            query_embedding: queryVector,
            match_threshold: 0.5,
            match_count: limit,
        });

        if (error) throw error;
        return data || [];
    }

    async getNodeById(id: string): Promise<CompetencyNode | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('competency_nodes')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async getGraph(userId?: string): Promise<{ nodes: CompetencyNode[]; edges: Edge[] }> {
        const supabase = await createClient();

        const { data: nodes, error: nodeError } = await supabase
            .from('competency_nodes')
            .select('*');

        if (nodeError) throw nodeError;

        const { data: edges, error: edgeError } = await supabase
            .from('competency_edges')
            .select('*');

        if (edgeError) throw edgeError;

        return { nodes: nodes || [], edges: edges || [] };
    }

    async upsertNode(node: Partial<CompetencyNode>): Promise<void> {
        const supabase = await createClient();

        // If it's a simple upsert by title (legacy style from ai-actions)
        if (!node.id && node.title) {
            const { data: existing } = await supabase
                .from('competency_nodes')
                .select('id')
                .eq('title', node.title)
                .eq('type', node.type || 'competency')
                .limit(1);

            if (existing && existing.length > 0) {

                const { error } = await supabase
                    .from('competency_nodes')
                    .update(node)
                    .eq('id', existing[0].id);
                if (error) throw error;
                return;
            }
        }

        const { error } = await supabase
            .from('competency_nodes')
            .upsert(node);

        if (error) throw error;
    }
}
