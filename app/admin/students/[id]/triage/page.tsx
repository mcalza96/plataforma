'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CompetencyGraphView from '@/components/admin/analytics/CompetencyGraphView';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for demonstration - in production this comes from Supabase/API
const MOCK_NODES = [
    { id: '1', title: 'Líneas de Horizonte', status: 'mastered' },
    { id: '2', title: 'Perspectiva de 1 Punto', status: 'infected' },
    { id: '3', title: 'Perspectiva de 2 Puntos', status: 'available' },
    { id: '4', title: 'Sombreado Básico', status: 'available' },
];

const MOCK_EDGES = [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
];

const MOCK_INSIGHTS = [
    {
        id: 'ins-1',
        title: 'Bloqueo en Perspectiva',
        explanation: 'El alumno seleccionó consistentemente distractores que indican una confusión entre línea de horizonte y nivel de ojos en la Perspectiva de 1 Punto.',
        action: 'Se sugiere insertar la cápsula de refutación "Horizontes Relativos" antes de avanzar.',
        type: 'danger'
    }
];

export default function TriagePage() {
    const params = useParams();
    const studentId = params.id as string;
    const [insights, setInsights] = useState(MOCK_INSIGHTS);
    const [nodes, setNodes] = useState(MOCK_NODES);

    const handleApprove = (id: string) => {
        // Optimistic UI update
        setInsights(prev => prev.filter(i => i.id !== id));
        // Logic to update node status or insert new node
        setNodes(prev => prev.map(n => n.id === '2' ? { ...n, status: 'available' } : n));
        console.log(`Approved intervention ${id}`);
    };

    const handleIgnore = (id: string) => {
        setInsights(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-8 space-y-8">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard value="75%" label="Salud del Grafo" variant="primary" icon="analytics" />
                <StatCard value="1" label="Nodos Críticos" variant="amber" icon="warning" />
                <StatCard value="12" label="Días Activo" variant="default" icon="calendar_today" />
                <StatCard value="3" label="Intervenciones" variant="violet" icon="bolt" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Graph Visualization */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white tracking-tight">Mapa Cognitivo de Alumno</h2>
                        <div className="flex gap-2">
                            <Badge variant="default">Mastered</Badge>
                            <Badge variant="destructive">Error Detectado</Badge>
                            <Badge variant="secondary">En Progreso</Badge>
                        </div>
                    </div>
                    <CompetencyGraphView
                        nodes={nodes as any}
                        edges={MOCK_EDGES}
                        className="h-[500px]"
                    />
                </div>

                {/* Right: Intervention Feed */}
                <div className="w-full lg:w-1/3 space-y-4">
                    <h2 className="text-xl font-bold text-white tracking-tight">Propuestas de Triage (IA)</h2>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {insights.map((insight) => (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Card className="bg-white/[0.03] border-white/5 border-l-4 border-l-amber-500">
                                        <CardHeader>
                                            <CardTitle className="text-amber-500 text-sm uppercase tracking-widest">{insight.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                {insight.explanation}
                                            </p>
                                            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                                <p className="text-amber-500 text-xs font-bold leading-tight">
                                                    ACCIÓN: {insight.action}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleApprove(insight.id)}
                                                    className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-white/90 transition-colors"
                                                >
                                                    Aprobar Cambio
                                                </button>
                                                <button
                                                    onClick={() => handleIgnore(insight.id)}
                                                    className="flex-1 bg-white/5 text-white/50 text-xs font-bold py-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    Ignorar
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {insights.length === 0 && (
                            <div className="text-center py-12 opacity-30 italic text-white/50">
                                No hay intervenciones pendientes.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
