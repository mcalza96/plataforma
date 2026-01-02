import { SupabaseClient } from '@supabase/supabase-js';
import { PathMutation } from '../../domain/triage';

/**
 * TriageMutationService - Business Logic for Knowledge Graph Mutations
 * 
 * Extracted from SupabaseLearnerRepository to adhere to SRP.
 * Handles the logic for "Fog of War" pruning, refutation injection,
 * and mastery-based unlocking.
 */
export class TriageMutationService {
    constructor(private supabase: SupabaseClient) { }

    async executeMutations(studentId: string, mutations: PathMutation[]): Promise<boolean> {
        for (const mutation of mutations) {
            try {
                switch (mutation.action) {
                    case 'LOCK_DOWNSTREAM':
                        await this.handleLockDownstream(studentId, mutation);
                        break;
                    case 'INSERT_NODE':
                        await this.handleInsertNode(studentId, mutation);
                        break;
                    case 'UNLOCK_NEXT':
                        await this.handleUnlockNext(studentId, mutation);
                        break;
                }
            } catch (err) {
                console.error(`[TriageMutationService] Failed to execute mutation ${mutation.action}:`, err);
                return false;
            }
        }
        return true;
    }

    private async handleLockDownstream(studentId: string, mutation: PathMutation) {
        // 1. Try to use optimized RPC for recursive pruning
        const { error } = await this.supabase.rpc('apply_hard_pruning', {
            p_learner_id: studentId,
            p_root_content_id: mutation.targetNodeId
        });

        if (error) {
            // Fallback: Linear pruning based on position_order
            const { data: currentRoot } = await this.supabase
                .from('path_nodes')
                .select('position_order')
                .eq('learner_id', studentId)
                .eq('content_id', mutation.targetNodeId)
                .single();

            if (currentRoot) {
                await this.supabase
                    .from('path_nodes')
                    .update({ status: 'locked' })
                    .eq('learner_id', studentId)
                    .gt('position_order', currentRoot.position_order);
            }
        }
    }

    private async handleInsertNode(studentId: string, mutation: PathMutation) {
        if (!mutation.metadata.contentId) return;

        const { data: targetNode } = await this.supabase
            .from('path_nodes')
            .select('id, position_order')
            .eq('learner_id', studentId)
            .eq('content_id', mutation.targetNodeId)
            .single();

        if (targetNode) {
            // Place strictly before the target (scaffolding)
            const newOrder = (targetNode.position_order || 0) - 0.5;

            await this.supabase.from('path_nodes').insert({
                learner_id: studentId,
                content_id: mutation.metadata.contentId,
                status: mutation.metadata.newStatus || 'available',
                position_order: newOrder,
                title: mutation.metadata.title || `Refuerzo: ${mutation.reason}`,
                type: 'remediation'
            });
        }
    }

    private async handleUnlockNext(studentId: string, mutation: PathMutation) {
        const { data: currentNode } = await this.supabase
            .from('path_nodes')
            .select('position_order')
            .eq('learner_id', studentId)
            .eq('content_id', mutation.targetNodeId)
            .single();

        // Mark current as completed
        await this.supabase.from('path_nodes')
            .update({ status: 'mastered', is_completed: true })
            .eq('learner_id', studentId)
            .eq('content_id', mutation.targetNodeId);

        if (currentNode) {
            // Unlock next in linear projection
            const { data: nextNode } = await this.supabase
                .from('path_nodes')
                .select('id')
                .eq('learner_id', studentId)
                .gt('position_order', currentNode.position_order)
                .order('position_order', { ascending: true })
                .limit(1)
                .single();

            if (nextNode) {
                await this.supabase.from('path_nodes')
                    .update({ status: 'available' })
                    .eq('id', nextNode.id)
                    .eq('status', 'locked');
            }
        }
    }
}
