'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { cookies } from 'next/headers';

export interface GraphNode {
    id: string;
    label: string;
    description?: string;
    status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED' | 'MASTERED' | 'INFECTED';
    infectionReason?: string;
    level: number;
}

export interface GraphEdge {
    from: string;
    to: string;
}

export interface KnowledgeGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

/**
 * getStudentKnowledgeGraph
 * Fetches the topological map for the student, applying Fog of War and Infection logic.
 */
export async function getStudentKnowledgeGraph(): Promise<KnowledgeGraph | null> {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) return null;

    // 1. Fetch raw graph structure (Nodes & Edges) from the static curriculum
    // Assuming 'competencies' and 'competency_edges' tables exist based on prompt context
    // If 'path_nodes' is a view, we might use that. Let's stick to base tables for flexibility.

    // FETCH NODES
    const { data: nodesData, error: nodesError } = await supabase
        .from('competency_nodes')
        .select('id, title, description');

    if (nodesError || !nodesData) {
        console.error('Error fetching competencies:', nodesError);
        return null;
    }

    // FETCH EDGES
    const { data: edgesData, error: edgesError } = await supabase
        .from('competency_edges')
        .select('source_id, target_id');

    if (edgesError) {
        console.error('Error fetching edges:', edgesError);
        return null;
    }

    const edges: GraphEdge[] = (edgesData || []).map(e => ({
        from: e.source_id,
        to: e.target_id
    }));

    // Build Adjacency for Level Calculation
    const adj: Record<string, string[]> = {};
    const revAdj: Record<string, string[]> = {}; // Key: Child, Value: Parents

    // Initialize revAdj for all nodes to safe handle empty parents
    nodesData.forEach(node => {
        revAdj[node.id] = [];
    });

    edges.forEach(e => {
        if (!adj[e.from]) adj[e.from] = [];
        adj[e.from].push(e.to);

        if (!revAdj[e.to]) revAdj[e.to] = [];
        revAdj[e.to].push(e.from);
    });

    // CALCULATE LEVELS (Longest Path in DAG)
    // Simple Memoization approach
    const levelCache = new Map<string, number>();

    function getNodeLevel(nodeId: string, visited = new Set<string>()): number {
        if (levelCache.has(nodeId)) return levelCache.get(nodeId)!;
        if (visited.has(nodeId)) return 1; // Cycle detected, fallback

        visited.add(nodeId);
        const parents = revAdj[nodeId] || [];

        if (parents.length === 0) {
            levelCache.set(nodeId, 1);
            return 1;
        }

        let maxParentLevel = 0;
        for (const pid of parents) {
            maxParentLevel = Math.max(maxParentLevel, getNodeLevel(pid, new Set(visited)));
        }

        const level = maxParentLevel + 1;
        levelCache.set(nodeId, level);
        return level;
    }

    // 2. Fetch Student Progress (Evidence)
    const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId);

    // 3. Process the Graph
    const nodes: GraphNode[] = nodesData.map(n => ({
        id: n.id,
        label: n.title,
        description: n.description,
        status: 'LOCKED', // Default
        level: getNodeLevel(n.id) // Dynamic Level
    }));

    // Map Progress to partial status
    const progressMap = new Map(progressData?.map(p => [p.competency_id, p.status])); // 'mastered', 'infected', 'completed'

    // Status Propagation Logic
    // Iterative pass or Topological sort needed? 
    // New rule: Node is AVAILABLE if all parents are COMPLETED or MASTERED.
    // Node is INFECTED if it has a bug record.

    nodes.forEach(node => {
        const pStatus = progressMap.get(node.id); // e.g., 'mastered' or 'misconception'

        if (pStatus === 'misconception' || pStatus === 'infected') {
            node.status = 'INFECTED';
            node.infectionReason = 'Consistencia Forense Fallida'; // Simplified, fetch real reason if available
            return;
        }

        if (pStatus === 'mastered') {
            node.status = 'MASTERED';
            return;
        }

        if (pStatus === 'completed') {
            node.status = 'COMPLETED';
            return;
        }

        // Check availability (Parents)
        const parents = revAdj[node.id] || [];
        if (parents.length === 0) {
            // Root nodes are AVAILABLE by default if not completed
            node.status = 'AVAILABLE';
        } else {
            const allParentsDone = parents.every(pid => {
                const parentStatus = progressMap.get(pid);
                return parentStatus === 'mastered' || parentStatus === 'completed';
            });

            if (allParentsDone) {
                node.status = 'AVAILABLE';
            } else {
                node.status = 'LOCKED';
            }
        }
    });

    // 4. Fog of War Logic
    // Hide details of nodes that are LOCKED and NOT immediate children of a visible node?
    // User Requirement: "Los nodos bloqueados (locked) y que NO son hijos directos de un nodo completado deben renderizarse con un efecto de 'Niebla'"
    // Implementation: If I am LOCKED, check if any of my parents are (COMPLETED | MASTERED | AVAILABLE). 
    // Actually, "available" usually implies parents are done. 
    // So if I am LOCKED, I am by definition deeper. 
    // Wait, "Visible Frontier": 
    // - Mastered/Completed/Infected: Visible
    // - Available: Visible (Frontier)
    // - Locked (Immediate neighbor of visible): "Foggy but Visible?" or "Visible Locked"?
    // The prompt says: "Only fully visible nodes are mastered, completed, available, infected."
    // "Remote Locked Nodes" (not direct children of completed) -> Fog (masked).

    // Let's refine:
    // If Status is LOCKED:
    // Check if any parent is (COMPLETED | MASTERED). If yes, show as "Locked but Visible Title".
    // If NO parent is done (meaning deep in tree), Mask the title.

    nodes.forEach(node => {
        if (node.status === 'LOCKED') {
            const parents = revAdj[node.id] || [];
            const isFrontierLocked = parents.some(pid => {
                const pStatus = progressMap.get(pid);
                return pStatus === 'mastered' || pStatus === 'completed';
            });

            if (!isFrontierLocked && parents.length > 0) {
                // Deep fog
                node.label = '???';
                node.description = 'Zona inexplorada';
            }
        }
    });

    return { nodes, edges };
}
