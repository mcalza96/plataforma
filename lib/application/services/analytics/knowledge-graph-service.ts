import { SupabaseClient } from '@supabase/supabase-js';
import { KnowledgeGraph, GraphNode, GraphEdge } from '@/lib/domain/analytics-types';

export class KnowledgeGraphService {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Aggregates student competency status from exam attempts (Admin View).
     */
    async getGlobalKnowledgeMap(): Promise<KnowledgeGraph> {
        const { data: nodesData } = await this.supabase.from('competency_nodes').select('*');
        const { data: edgesData } = await this.supabase.from('competency_edges').select('*');
        const { data: attempts } = await this.supabase.from('exam_attempts').select('results_cache');

        const metrics = this.aggregateCompetencyMetrics(attempts || []);
        return this.buildGlobalGraphData(nodesData || [], edgesData || [], metrics);
    }

    /**
     * Fetches the topological map for a specific student (Student View).
     */
    async getStudentKnowledgeMap(studentId: string): Promise<KnowledgeGraph> {
        const { data: nodesData } = await this.supabase.from('competency_nodes').select('id, title, description');
        const { data: edgesData } = await this.supabase.from('competency_edges').select('source_id, target_id');
        const { data: progressData } = await this.supabase.from('student_progress').select('*').eq('student_id', studentId);

        const edges: GraphEdge[] = (edgesData || []).map(e => ({ from: e.source_id, to: e.target_id }));
        const revAdj = this.buildReverseAdjacency(nodesData || [], edges);

        const levelCache = new Map<string, number>();
        const getNodeLevel = (nodeId: string): number => {
            if (levelCache.has(nodeId)) return levelCache.get(nodeId)!;
            const parents = revAdj[nodeId] || [];
            const level = parents.length === 0 ? 1 : Math.max(...parents.map(p => getNodeLevel(p))) + 1;
            levelCache.set(nodeId, level);
            return level;
        };

        const progressMap = new Map(progressData?.map(p => [p.competency_id, p.status]));

        const nodes: GraphNode[] = (nodesData || []).map(n => {
            const pStatus = progressMap.get(n.id);
            let status: GraphNode['status'] = 'LOCKED';

            if (pStatus === 'mastered') status = 'MASTERED';
            else if (pStatus === 'completed') status = 'COMPLETED';
            else if (pStatus === 'infected' || pStatus === 'misconception') status = 'INFECTED';
            else {
                const parents = revAdj[n.id] || [];
                const allParentsDone = parents.length === 0 || parents.every(pid => {
                    const ps = progressMap.get(pid);
                    return ps === 'mastered' || ps === 'completed';
                });
                if (allParentsDone) status = 'AVAILABLE';
            }

            return {
                id: n.id,
                label: n.title,
                description: n.description,
                status,
                level: getNodeLevel(n.id)
            };
        });

        // Fog of War
        nodes.forEach(node => {
            if (node.status === 'LOCKED') {
                const parents = revAdj[node.id] || [];
                const isFrontier = parents.some(pid => {
                    const ps = progressMap.get(pid);
                    return ps === 'mastered' || ps === 'completed';
                });
                if (!isFrontier && parents.length > 0) {
                    node.label = '???';
                    node.description = 'Zona inexplorada';
                }
            }
        });

        return { nodes, edges };
    }

    private aggregateCompetencyMetrics(attempts: any[]) {
        const nodeMetrics: Record<string, { students: Set<string>, mastered: number, failures: number, bugs: Record<string, number> }> = {};
        attempts?.forEach((attempt, studentIdx) => {
            const diagnoses = (attempt.results_cache as any)?.competencyDiagnoses || [];
            diagnoses.forEach((diag: any) => {
                const nodeId = diag.competencyId;
                if (!nodeMetrics[nodeId]) nodeMetrics[nodeId] = { students: new Set(), mastered: 0, failures: 0, bugs: {} };
                nodeMetrics[nodeId].students.add(studentIdx.toString());
                if (diag.state === 'MASTERED') nodeMetrics[nodeId].mastered++;
                if (diag.state === 'MISCONCEPTION') {
                    nodeMetrics[nodeId].failures++;
                    const reason = diag.evidence?.reason || 'Unknown Error';
                    nodeMetrics[nodeId].bugs[reason] = (nodeMetrics[nodeId].bugs[reason] || 0) + 1;
                }
            });
        });
        return nodeMetrics;
    }

    private buildGlobalGraphData(rawNodes: any[], rawEdges: any[], nodeMetrics: any): KnowledgeGraph {
        const nodes: GraphNode[] = rawNodes
            .filter(n => n.node_type === 'competency')
            .map(node => {
                const metrics = nodeMetrics[node.id] || { students: new Set(), mastered: 0, failures: 0, bugs: {} };
                const studentCount = metrics.students.size;
                const avgMastery = studentCount > 0 ? (metrics.mastered / studentCount) * 100 : 0;
                const frictionScore = (metrics.failures * 1.5) / (metrics.mastered + 1);
                const topBugs = Object.entries(metrics.bugs as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([bug]) => bug);
                return {
                    id: node.id,
                    label: node.title,
                    status: 'AVAILABLE', // Admin view is all visible
                    level: 0, // Admin doesn't need levels usually, but keeping type consistency
                    studentCount,
                    averageMastery: avgMastery,
                    frictionScore,
                    topBugs
                };
            });

        const edges: GraphEdge[] = rawEdges.map(edge => ({
            from: edge.source_id,
            to: edge.target_id,
            weight: edge.weight || 1.0
        }));

        return { nodes, edges };
    }

    private buildReverseAdjacency(nodes: any[], edges: GraphEdge[]): Record<string, string[]> {
        const revAdj: Record<string, string[]> = {};
        nodes.forEach(n => revAdj[n.id] = []);
        edges.forEach(e => {
            if (!revAdj[e.to]) revAdj[e.to] = [];
            revAdj[e.to].push(e.from);
        });
        return revAdj;
    }
}
