'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Lock, Target, Brain, ShieldAlert, Navigation } from 'lucide-react';
import { KnowledgeGraph, GraphNode } from '@/lib/actions/student/curriculum-actions';
import { useRouter } from 'next/navigation';

interface KnowledgeMapProps {
    graph: KnowledgeGraph;
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ graph }) => {
    const router = useRouter();
    const { nodes, edges } = graph;

    // Use a simpler layout strategy for now (Level-based rank)
    // In a real expanded app, use dagre or react-flow.
    // Here we compute positions deterministically based on level.
    const nodePositions = React.useMemo(() => {
        const positions: Record<string, { x: number; y: number }> = {};
        const levelCounts: Record<number, number> = {};

        nodes.forEach(node => {
            const count = levelCounts[node.level] || 0;
            positions[node.id] = {
                x: 100 + node.level * 220, // Horizontal spacing
                y: 150 + count * 140       // Vertical spacing
            };
            levelCounts[node.level] = count + 1;
        });
        return positions;
    }, [nodes]);

    const handleNodeClick = (node: GraphNode) => {
        if (node.status === 'LOCKED') return;

        if (node.status === 'INFECTED') {
            // Trigger Remediation Modal (To be implemented or emit event)
            alert("Protocolo de Reparación Iniciado: Se ha detectado una infección cognitiva.");
            return;
        }

        if (node.status === 'AVAILABLE' || node.status === 'COMPLETED' || node.status === 'MASTERED') {
            router.push(`/lessons/${node.id}`);
        }
    };

    return (
        <div className="group/map p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-x-auto relative min-h-[500px] flex flex-col transition-all duration-700 hover:border-white/10">
            <header className="mb-8 sticky left-0 top-0 z-20">
                <div className="flex items-center gap-2 mb-1">
                    <Navigation className="size-4 text-indigo-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Topología de Aprendizaje</h3>
                </div>
                <h2 className="text-xl font-bold text-white italic">Niebla de Guerra & Frontera Activa</h2>
            </header>

            <div className="flex-1 relative min-w-max pb-20 pr-20">
                {/* SVG Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <marker id="arrow-locked" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-800" />
                        </marker>
                        <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-600" />
                        </marker>
                    </defs>
                    {edges.map((edge, i) => {
                        const start = nodePositions[edge.from];
                        const end = nodePositions[edge.to];
                        if (!start || !end) return null;

                        // Calculate status of the connection (if source is infected, line is red)
                        const sourceNode = nodes.find(n => n.id === edge.from);
                        const isRed = sourceNode?.status === 'INFECTED';
                        const isLocked = sourceNode?.status === 'LOCKED';

                        return (
                            <motion.line
                                key={`edge-${i}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                x1={start.x + 20} y1={start.y}
                                x2={end.x - 20} y2={end.y}
                                strokeWidth="2"
                                markerEnd={isLocked ? "url(#arrow-locked)" : "url(#arrow-active)"}
                                className={`transition-colors duration-500 ${isRed ? 'stroke-rose-500/30' :
                                        isLocked ? 'stroke-zinc-800' : 'stroke-slate-700'
                                    }`}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map((node, i) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    const isFoggy = node.label === '???';

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, type: 'spring' }}
                            style={{ left: pos.x, top: pos.y }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        >
                            <div
                                onClick={() => handleNodeClick(node)}
                                className={`
                                    relative group cursor-pointer transition-all duration-500
                                    ${isFoggy ? 'blur-[2px] opacity-40 hover:opacity-100 hover:blur-0' : ''}
                                `}
                            >
                                {/* Active Frontier Glow */}
                                {node.status === 'AVAILABLE' && (
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg animate-pulse" />
                                )}

                                {/* Infection Pulse */}
                                {node.status === 'INFECTED' && (
                                    <div className="absolute inset-0 bg-rose-500/40 rounded-full blur-xl animate-pulse" />
                                )}

                                {/* Node Body */}
                                <div className={`
                                    w-48 p-3 rounded-xl border flex items-start gap-3 transition-all duration-300
                                    ${node.status === 'MASTERED' ? 'bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10' : ''}
                                    ${node.status === 'INFECTED' ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-900/40' : ''}
                                    ${node.status === 'AVAILABLE' ? 'bg-slate-800 border-indigo-500/50 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''}
                                    ${node.status === 'COMPLETED' ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : ''}
                                    ${node.status === 'LOCKED' ? 'bg-zinc-950 border-zinc-900 text-zinc-700 grayscale cursor-not-allowed' : ''}
                                `}>
                                    <div className={`
                                        p-2 rounded-lg shrink-0
                                        ${node.status === 'MASTERED' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                                        ${node.status === 'INFECTED' ? 'bg-rose-500/20 text-rose-500' : ''}
                                        ${node.status === 'AVAILABLE' ? 'bg-indigo-500/20 text-indigo-400' : ''}
                                        ${node.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400' : ''}
                                        ${node.status === 'LOCKED' ? 'bg-zinc-900 text-zinc-800' : ''}
                                    `}>
                                        {node.status === 'MASTERED' && <Target className="size-5" />}
                                        {node.status === 'INFECTED' && <ShieldAlert className="size-5" />}
                                        {node.status === 'AVAILABLE' && <Brain className="size-5" />}
                                        {node.status === 'COMPLETED' && <Hammer className="size-5" />}
                                        {node.status === 'LOCKED' && <Lock className="size-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs font-bold leading-tight mb-1 truncate ${node.status === 'LOCKED' ? 'text-zinc-700' : 'text-slate-200'}`}>
                                            {node.label}
                                        </h4>
                                        <p className={`text-[10px] leading-relaxed line-clamp-2 ${node.status === 'LOCKED' ? 'text-zinc-800' : 'text-slate-500'}`}>
                                            {node.description || 'Concepto fundamental del módulo.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Infection Reason Tooltip */}
                                {node.status === 'INFECTED' && (
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-rose-300 text-[10px] p-2 rounded border border-rose-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                        <div className="font-bold mb-1 uppercase tracking-wider text-rose-500 flex items-center gap-1">
                                            <ShieldAlert className="size-3" />
                                            Detectado
                                        </div>
                                        {node.infectionReason}
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-rose-500/30 rotate-45" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <footer className="mt-8 flex gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Frontera Activa</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Infección</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-zinc-800 border border-zinc-700"></span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Niebla de Guerra</span>
                </div>
            </footer>
        </div>
    );
};

