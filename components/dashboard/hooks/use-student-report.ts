import { useMemo } from 'react';
import { DiagnosticResult } from '@/lib/domain/assessment';
import { KnowledgeGraph, GraphNode, GraphEdge } from '@/lib/domain/analytics-types';
import { FeedbackGenerator } from '@/lib/application/services/feedback-generator';

export function useStudentReport(result: DiagnosticResult, matrix: any) {
    const narrative = useMemo(() => FeedbackGenerator.generate(result), [result]);

    const graph: KnowledgeGraph = useMemo(() => {
        const nodes: GraphNode[] = (matrix?.keyConcepts || []).map((c: any) => {
            const isString = typeof c === 'string';
            return {
                id: isString ? c : (c.id || c.name || c.title),
                label: isString ? c : (c.name || c.title || c.id),
                description: isString ? '' : c.description,
                status: 'LOCKED',
                level: 1
            };
        });

        const edges: GraphEdge[] = (matrix?.prerequisites || []).map((p: any) => ({
            from: p.sourceId,
            to: p.targetId
        }));

        const revAdj: Record<string, string[]> = {};
        edges.forEach(e => {
            if (!revAdj[e.to]) revAdj[e.to] = [];
            revAdj[e.to].push(e.from);
        });

        const getLevel = (id: string, visited = new Set<string>()): number => {
            if (visited.has(id)) return 1;
            visited.add(id);
            const parents = revAdj[id] || [];
            if (parents.length === 0) return 1;
            return Math.max(...parents.map(pid => getLevel(pid, new Set(visited)))) + 1;
        };

        nodes.forEach(n => {
            n.level = getLevel(n.id);
            const d = result.competencyDiagnoses.find(x => x.competencyId === n.id);
            if (d) {
                if (d.state === 'MISCONCEPTION') n.status = 'INFECTED';
                else if (d.state === 'MASTERED') n.status = 'MASTERED';
                else if (d.state === 'GAP') n.status = 'AVAILABLE';
            }
        });

        return { nodes, edges };
    }, [matrix, result]);

    return {
        narrative,
        graph
    };
}
