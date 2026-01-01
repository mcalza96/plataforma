'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { GraduationCap, Share2, Download, ChevronRight, User } from 'lucide-react';
import { DiagnosticResult } from '@/lib/domain/assessment';
import { KnowledgeGraph, GraphNode, GraphEdge } from '@/lib/actions/student/curriculum-actions';
import { FeedbackGenerator } from '../../../lib/application/services/feedback-generator';
import { TrafficLightGraph } from '../insights/TrafficLightGraph';
import { PrescriptionCard } from '../insights/PrescriptionCard';
import { LandingProfile } from '../insights/LandingProfile';
import { CognitiveMirror } from '../../assessment/results/CognitiveMirror';
import { NextStepsCard } from '../NextStepsCard';
import { KnowledgeMap } from '../KnowledgeMap';

interface StudentReportViewProps {
    result: DiagnosticResult;
    matrix: any; // The pedagogical graph from the exam config
    studentName?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const StudentReportView: React.FC<StudentReportViewProps> = ({
    result,
    matrix,
    studentName = 'Estudiante'
}) => {
    const narrative = FeedbackGenerator.generate(result);

    const graph: KnowledgeGraph = React.useMemo(() => {
        const nodes: GraphNode[] = (matrix?.keyConcepts || []).map((c: any) => ({
            id: c.id,
            label: c.name || c.title || c.id,
            description: c.description,
            status: 'LOCKED',
            level: 1
        }));

        const edges: GraphEdge[] = (matrix?.prerequisites || []).map((p: any) => ({
            from: p.sourceId,
            to: p.targetId
        }));

        // Simple Level Calculation
        const adj: Record<string, string[]> = {};
        const revAdj: Record<string, string[]> = {};
        edges.forEach(e => {
            if (!adj[e.from]) adj[e.from] = [];
            adj[e.from].push(e.to);
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

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 md:p-8 lg:p-12 selection:bg-indigo-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto relative z-10"
            >
                {/* Header Section */}
                <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <User className="w-3 h-3" />
                                Reporte de Diagnóstico v1.0
                                <ChevronRight className="w-3 h-3" />
                                ID: {result.attemptId.split('-')[0]}
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Insights para {studentName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-sm font-medium transition-colors">
                            <Share2 className="w-4 h-4" /> Compartir
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                            <Download className="w-4 h-4" /> Descargar PDF
                        </button>
                    </div>
                </motion.header>

                {/* Global Summary & Score */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div className="lg:col-span-2 p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ActivityIcon className="w-32 h-32 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-4 text-indigo-400">Resumen Ejecutivo</h2>
                        <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                            {narrative.executiveSummary}
                        </p>
                        {narrative.behavioralNote && (
                            <div className="mt-6 p-4 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-start gap-4">
                                <LightbulbIcon className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                                <p className="text-sm text-slate-400 italic">
                                    {narrative.behavioralNote}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    fill="none" stroke="currentColor"
                                    strokeWidth="8" className="text-slate-800"
                                />
                                <motion.circle
                                    cx="64" cy="64" r="58"
                                    fill="none" stroke="currentColor"
                                    strokeWidth="8" strokeLinecap="round"
                                    className="text-indigo-500"
                                    initial={{ strokeDasharray: "0 1000" }}
                                    animate={{ strokeDasharray: `${(result.overallScore / 100) * 364} 1000` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white">{result.overallScore}%</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Score Global</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 px-4">
                            Calculado sobre {result.competencyDiagnoses.length} competencias clave evaluadas.
                        </p>
                    </div>
                </motion.section>

                {/* Main Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Visualization */}
                    <motion.div variants={itemVariants} className="lg:col-span-12 xl:col-span-7 space-y-8">
                        <CognitiveMirror calibration={result.calibration} />
                        <KnowledgeMap graph={graph} />
                        <TrafficLightGraph diagnoses={result.competencyDiagnoses} />
                        <LandingProfile profile={result.behaviorProfile} />
                    </motion.div>

                    {/* Right Column: Actions */}
                    <motion.div variants={itemVariants} className="lg:col-span-12 xl:col-span-5 space-y-8">
                        <PrescriptionCard diagnoses={result.competencyDiagnoses} />
                        <NextStepsCard attemptId={result.attemptId} />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

// Internal minimal icons for header/resumen
const ActivityIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.922-.606l7-15A1 1 0 0021 0H3a1 1 0 00-.914 1.406l7 15a1 1 0 00.922.606z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v4m0 0H8m4 0h4" />
    </svg>
);

const TargetIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
);
