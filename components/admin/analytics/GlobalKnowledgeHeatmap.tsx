"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Info,
    AlertTriangle,
    X,
    Maximize2,
    Minimize2,
    Bug,
    ArrowRight,
    Search,
    Zap
} from 'lucide-react';
import { KnowledgeGraphData } from '@/lib/actions/admin/admin-analytics-actions';

interface GlobalKnowledgeHeatmapProps {
    data: KnowledgeGraphData;
    className?: string;
}

export default function GlobalKnowledgeHeatmap({ data, className = '' }: GlobalKnowledgeHeatmapProps) {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const nodes = useMemo(() => {
        const width = 1200;
        const height = 800;

        // Simple Layered Layout for DAG
        return data.nodes.map((node, i) => {
            const angle = (i / data.nodes.length) * 2 * Math.PI;
            return {
                ...node,
                x: (width / 2) + 400 * Math.cos(angle),
                y: (height / 2) + 300 * Math.sin(angle)
            };
        });
    }, [data.nodes]);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    const getHeatColor = (mastery: number) => {
        if (mastery >= 80) return 'rgb(16, 185, 129)'; // Emerald
        if (mastery >= 50) return 'rgb(245, 158, 11)'; // Amber
        return 'rgb(244, 63, 94)'; // Rose/Red
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className={`relative w-full h-[700px] bg-[#1A1A1A] rounded-3xl overflow-hidden border border-white/5 ${className}`} ref={containerRef}>
            {/* Control HUD */}
            <div className="absolute top-6 left-6 z-10 flex gap-2">
                <div className="bg-[#252525]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Maestría</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Punto de Fricción</span>
                    </div>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <button onClick={() => setZoom(1)} className="text-slate-500 hover:text-white transition-colors">
                        <span className="text-[10px] font-mono font-bold">RESET {Math.round(zoom * 100)}%</span>
                    </button>
                </div>
            </div>

            {/* Interaction Layer */}
            <div
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg
                    viewBox={`0 0 1200 800`}
                    className="w-full h-full transition-transform duration-75"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center'
                    }}
                >
                    {/* Edges */}
                    {data.edges.map((edge, i) => {
                        const start = nodes.find(n => n.id === edge.source);
                        const end = nodes.find(n => n.id === edge.target);
                        if (!start || !end) return null;

                        const isDraftNode = start.student_count === 0 && end.student_count === 0;

                        return (
                            <motion.line
                                key={`edge-${i}`}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={Math.max(edge.weight * 2, 0.5)}
                                opacity={isDraftNode ? 0.1 : 0.4}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => {
                        const isSelected = selectedNodeId === node.id;
                        const radius = 10 + Math.sqrt(node.student_count) * 2;
                        const color = getHeatColor(node.average_mastery);
                        const isCritical = node.average_mastery < 50 && node.student_count > 0;

                        return (
                            <g
                                key={node.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNodeId(node.id);
                                }}
                                className="cursor-pointer group"
                            >
                                <motion.circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={radius}
                                    fill={color}
                                    opacity={node.student_count === 0 ? 0.2 : (isSelected ? 1 : 0.8)}
                                    className={`${isCritical ? 'animate-pulse' : ''}`}
                                    initial={{ scale: 0 }}
                                    animate={{
                                        scale: isSelected ? 1.4 : 1,
                                        filter: isSelected ? 'drop-shadow(0 0 15px currentColor)' : 'none'
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                />
                                {radius > 15 && (
                                    <text
                                        x={node.x}
                                        y={node.y + radius + 15}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="10"
                                        className={`font-medium tracking-tight pointer-events-none transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
                                    >
                                        {node.title}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Side Insight Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute top-0 right-0 w-80 h-full bg-[#252525]/95 backdrop-blur-xl border-l border-white/5 z-20 p-8 shadow-2xl overflow-y-auto"
                    >
                        <button
                            onClick={() => setSelectedNodeId(null)}
                            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-8 mt-4">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Atómico (KST)</span>
                                </div>
                                <h3 className="text-xl font-bold leading-tight">{selectedNode.title}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Maestría Global</p>
                                    <p className={`text-xl font-mono font-bold ${selectedNode.average_mastery < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {Math.round(selectedNode.average_mastery)}%
                                    </p>
                                </div>
                                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Tráfico (N)</p>
                                    <p className="text-xl font-mono font-bold text-white">
                                        {selectedNode.student_count}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Impacto de Bloqueo</p>
                                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                                        Friction: {selectedNode.friction_score.toFixed(2)}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all"
                                        style={{ width: `${Math.min(selectedNode.friction_score * 20, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                    {selectedNode.friction_score > 2
                                        ? `¡Crítico! Este nodo está impidiendo que más de la mitad de sus aprendices avancen al siguiente nivel.`
                                        : `Flujo nominal. El conocimiento fluye hacia los nodos dependientes.`}
                                </p>
                            </div>

                            {selectedNode.top_bugs.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Bug className="w-3 h-3" />
                                        Principales Misconceptions
                                    </p>
                                    <div className="space-y-2">
                                        {selectedNode.top_bugs.map((bug, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                                <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 text-rose-500 text-[9px] font-bold">
                                                    {i + 1}
                                                </div>
                                                <p className="text-xs text-slate-300 leading-snug">{bug}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group">
                                Abrir en Editor de DAG
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
