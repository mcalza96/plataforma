'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DiagnosticResult } from '@/lib/domain/evaluation/types';
import { Hammer, Lock, Target, Brain, ShieldAlert } from 'lucide-react';

interface KnowledgeMapProps {
    result: DiagnosticResult;
    matrix: {
        keyConcepts: string[];
        identifiedMisconceptions: { error: string; competencyId?: string }[];
        prerequisites?: { from: string; to: string }[]; // Added prerequisites
    };
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ result, matrix }) => {
    // 1. Map concepts to their diagnostic state and handle prerequisite propagation
    const nodeStates = useMemo(() => {
        const states: Record<string, {
            status: 'MASTERED' | 'MISCONCEPTION' | 'GAP' | 'LOCKED' | 'UNKNOWN';
            reason?: string;
        }> = {};

        // Initial state from diagnostics
        matrix.keyConcepts.forEach(c => states[c] = { status: 'UNKNOWN' });
        result.competencyDiagnoses.forEach(d => {
            states[d.competencyId] = {
                status: d.state,
                reason: d.evidence.reason // Capture the "why"
            };
        });

        // Hard Pruning Logic: Propagate "Infection" or "Blockage"
        // If a prerequisite has a MISCONCEPTION or GAP, descendants should be LOCKED
        const adj: Record<string, string[]> = {};
        matrix.prerequisites?.forEach(p => {
            if (!adj[p.from]) adj[p.from] = [];
            adj[p.from].push(p.to);
        });

        const blockedNodes = new Set<string>();
        const queue: string[] = [];

        // Identify starting points for blockage (Bugs and Gaps)
        Object.entries(states).forEach(([id, data]) => {
            if (data.status === 'MISCONCEPTION' || data.status === 'GAP') {
                queue.push(id);
            }
        });

        // BFS to mark all dependent nodes as blocked
        while (queue.length > 0) {
            const current = queue.shift()!;
            const dependents = adj[current] || [];
            dependents.forEach(dep => {
                if (!blockedNodes.has(dep)) {
                    blockedNodes.add(dep);
                    queue.push(dep);
                }
            });
        }

        // Apply Pruning: Blocked nodes become LOCKED
        blockedNodes.forEach(nodeId => {
            if (states[nodeId]) {
                states[nodeId] = {
                    ...states[nodeId],
                    status: 'LOCKED',
                    reason: states[nodeId].reason || 'Bloqueo por prerrequisito fallido'
                };
            }
        });

        return states;
    }, [result, matrix]);

    // 2. Simple layout (Force-directed or semi-manual)
    const nodes = useMemo(() => {
        // We'll use a levels-based layout if prerequisites exist
        const levels: Record<string, number> = {};
        matrix.keyConcepts.forEach(c => levels[c] = 0);

        matrix.prerequisites?.forEach(p => {
            levels[p.to] = Math.max(levels[p.to], levels[p.from] + 1);
        });

        const levelCounts: Record<number, number> = {};
        return matrix.keyConcepts.map((concept) => {
            const level = levels[concept];
            const currentInLevel = levelCounts[level] || 0;
            levelCounts[level] = currentInLevel + 1;

            return {
                id: concept,
                x: 100 + level * 200,
                y: 100 + currentInLevel * 120,
                state: nodeStates[concept] || { status: 'UNKNOWN' }
            };
        });
    }, [matrix, nodeStates]);

    return (
        <div className="p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-x-auto relative min-h-[500px] flex flex-col">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Brain className="size-4 text-indigo-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Estructura Cognitiva</h3>
                </div>
                <h2 className="text-xl font-bold text-white italic">Mapa de Misión: Reparación & Niebla</h2>
            </header>

            <div className="flex-1 relative" style={{ minWidth: nodes.length * 150 }}>
                {/* SVG Connections (Prerequisite Links) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-800" />
                        </marker>
                    </defs>
                    {matrix.prerequisites?.map((p, i) => {
                        const fromNode = nodes.find(n => n.id === p.from);
                        const toNode = nodes.find(n => n.id === p.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <line
                                key={`edge-${i}`}
                                x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                                stroke="currentColor" strokeWidth="2"
                                markerEnd="url(#arrow)"
                                className={nodeStates[p.from]?.status === 'MISCONCEPTION' ? 'text-rose-500/20' : 'text-zinc-800'}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, type: 'spring' }}
                        style={{ left: node.x, top: node.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                    >
                        <div className="relative">
                            {/* Infection Pulse for Bugs */}
                            {node.state.status === 'MISCONCEPTION' && (
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-rose-500/40 rounded-full blur-xl"
                                />
                            )}

                            <div className={`
                                size-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500
                                ${node.state.status === 'MASTERED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}
                                ${node.state.status === 'MISCONCEPTION' ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : ''}
                                ${node.state.status === 'GAP' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : ''}
                                ${node.state.status === 'LOCKED' ? 'bg-zinc-950 border-zinc-900 text-zinc-800 grayscale scale-90' : ''}
                                ${node.state.status === 'UNKNOWN' ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : ''}
                            `}>
                                {node.state.status === 'MASTERED' && <Target className="size-4" />}
                                {node.state.status === 'MISCONCEPTION' && <ShieldAlert className="size-4" />}
                                {node.state.status === 'GAP' && <Hammer className="size-4" />}
                                {node.state.status === 'LOCKED' && <Lock className="size-3" />}
                                {node.state.status === 'UNKNOWN' && <Brain className="size-4" />}
                            </div>

                            {/* Label & Active Feedback */}
                            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                <p className={`text-[9px] font-black uppercase tracking-widest ${node.state.status === 'LOCKED' ? 'text-zinc-700' : 'text-white'}`}>
                                    {node.state.status === 'LOCKED' ? 'Protección' : node.id}
                                </p>

                                {/* Infection Reason (Visible permanently or on group hover) */}
                                {node.state.status === 'MISCONCEPTION' && (
                                    <div className="flex flex-col items-center mt-1">
                                        <span className="text-[7px] font-bold text-rose-500 uppercase tracking-tighter animate-pulse">INFECTADO</span>
                                        <span className="text-[8px] text-rose-300/80 max-w-[120px] whitespace-normal bg-black/80 px-2 py-1 rounded border border-rose-500/20 mt-1 hidden group-hover:block z-50">
                                            {node.state.reason}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <footer className="mt-12 flex flex-wrap gap-6 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-lg bg-rose-500/20 border border-rose-500/50" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Infección (Bug)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                    <Lock className="size-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Poda Dura (LOCKED)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-lg bg-amber-500/10 border border-amber-500/30" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Brecha (Gap)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dominado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-lg bg-zinc-900 border border-zinc-800" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sin Evidencia</span>
                </div>
            </footer>
        </div>
    );
};

const AlertCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
    </svg>
);
