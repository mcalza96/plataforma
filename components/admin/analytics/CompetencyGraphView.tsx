'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CompetencyNode } from '@/lib/domain/competency';

interface NodePosition {
    x: number;
    y: number;
}

interface CompetencyGraphViewProps {
    nodes: CompetencyNode[];
    edges: { source: string; target: string }[];
    onNodeClick?: (nodeId: string) => void;
    className?: string;
}

import { useCelebration } from '@/hooks/use-celebration';
import { useRef, useEffect } from 'react';

export default function CompetencyGraphView({
    nodes,
    edges,
    onNodeClick,
    className = ''
}: CompetencyGraphViewProps) {
    const { triggerCelebration } = useCelebration();
    const prevMasteredCount = useRef(0);

    // Effect to trigger celebration when a new node is mastered
    useEffect(() => {
        const masteredCount = nodes.filter((n: any) => n.status === 'mastered').length;
        if (masteredCount > prevMasteredCount.current && prevMasteredCount.current > 0) {
            triggerCelebration();
        }
        prevMasteredCount.current = masteredCount;
    }, [nodes, triggerCelebration]);

    // Simple force-directed layout or fixed layout for demonstration
    // In a real app, use a library or a robust layout algorithm
    const layoutNodes = useMemo(() => {
        const width = 800;
        const height = 400;
        const radius = 20;

        return nodes.map((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            const x = width / 2 + 300 * Math.cos(angle);
            const y = height / 2 + 150 * Math.sin(angle);
            return { ...node, x, y };
        });
    }, [nodes]);

    const findPos = (id: string) => {
        const n = layoutNodes.find(ln => ln.id === id);
        return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'mastered': return '#10b981'; // Green
            case 'infected': return '#ef4444'; // Red
            case 'available': return '#f59e0b'; // Yellow
            default: return '#6b7280'; // Grey
        }
    };

    return (
        <div className={`relative bg-[#1A1A1A] rounded-3xl p-4 overflow-hidden border border-white/5 ${className}`}>
            <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Edges */}
                {edges.map((edge, idx) => {
                    const start = findPos(edge.source);
                    const end = findPos(edge.target);
                    return (
                        <motion.line
                            key={`edge-${idx}`}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                    );
                })}

                {/* Nodes */}
                {layoutNodes.map((node) => (
                    <g
                        key={node.id}
                        onClick={() => onNodeClick?.(node.id)}
                        className="cursor-pointer group"
                    >
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="12"
                            fill={getStatusColor((node as any).status)} // Hypothetically mapped status
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                        <text
                            x={node.x}
                            y={node.y + 25}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                            className="font-medium tracking-tight opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                            {node.title}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
