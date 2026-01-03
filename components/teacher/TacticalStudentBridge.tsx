"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getStudentDigitalTwin } from '@/lib/actions/teacher/forensic-actions';
import { DigitalTwinTimeline } from './bridge/DigitalTwinTimeline';
import { InterventionJustifier } from './bridge/InterventionJustifier';
import { ShieldCheck, Crosshair, Fingerprint, Activity, Clock, Box } from 'lucide-react';

interface Student {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
}

interface TacticalStudentBridgeProps {
    student: Student;
    onClose: () => void;
}

/**
 * TacticalStudentBridge: Centro de Auditoría Forense Individual (Digital Twin)
 * Encapsula la telemetría y la identidad cognitiva del estudiante.
 */
export default function TacticalStudentBridge({ student, onClose }: TacticalStudentBridgeProps) {
    const router = useRouter();
    const [twinData, setTwinData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTwin() {
            setIsLoading(true);
            try {
                const data = await getStudentDigitalTwin(student.id);
                setTwinData(data);
            } catch (err) {
                console.error("Failed to load digital twin:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadTwin();
    }, [student.id]);

    const handleClose = () => {
        router.push('/teacher');
        onClose();
    };

    // Prepare timeline events from attempts
    const timelineEvents = (twinData?.attempts || []).map((a: any) => ({
        id: a.id,
        title: a.exam_config?.title || 'Sonda de Calibración',
        score: a.results_cache?.overallScore || 0,
        expectedScore: 70, // Baseline for comparison
        timeSpent: a.results_cache?.totalTimeSeconds || 0,
        expectedTime: 600, // Proposed baseline
        timestamp: a.created_at
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-8 pb-20"
        >
            {/* Forensic Header: White Box Context */}
            <div className="bg-[#1A1A1A]/80 border-2 border-magenta-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Fingerprint size={240} className="text-magenta-500" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-magenta-500/20 border border-magenta-500/40 rounded-full">
                                <div className="size-2 rounded-full bg-magenta-500 animate-pulse" />
                                <span className="text-[10px] font-black text-magenta-400 uppercase tracking-widest">Auditoría en Tiempo Real</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-600">SID_{student.id.split('-')[0].toUpperCase()}</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                                {student.avatar_url ? (
                                    <img src={student.avatar_url} alt="" className="size-full object-cover rounded-2xl" />
                                ) : (
                                    <div className="size-full bg-magenta-500/20 flex items-center justify-center text-magenta-400 font-black text-2xl">
                                        {student.display_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                    {student.display_name}
                                </h2>
                                <p className="text-zinc-500 font-medium text-sm">Nivel de Madurez Cognitiva: Level {student.level}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="p-4 rounded-3xl bg-black/40 border border-white/5 min-w-[120px]">
                            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Puntos Ciegos</p>
                            <span className="text-2xl font-black text-amber-500 italic">{twinData?.intelligence?.detectedMisconceptions?.length || 0}</span>
                        </div>
                        <div className="p-4 rounded-3xl bg-black/40 border border-white/5 min-w-[120px]">
                            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Mutaciones IA</p>
                            <span className="text-2xl font-black text-magenta-500 italic">{twinData?.intelligence?.appliedInterventions?.length || 0}</span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95 group flex items-center gap-2"
                        >
                            <span className="text-xs font-black text-white uppercase tracking-widest">Salir del Puente</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Forensic Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left: Progression & Evolution */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-[2.5rem] p-8">
                        <DigitalTwinTimeline events={timelineEvents} />
                    </div>
                </div>

                {/* Center: Interpretation (White Box) */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-[2.5rem] p-8">
                        <InterventionJustifier
                            mutations={twinData?.intelligence?.appliedInterventions || []}
                        />
                    </div>
                </div>

                {/* Right: Cognitive Mirror & Gaps */}
                <div className="col-span-12 lg:col-span-3 space-y-8">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Crosshair className="text-amber-500" size={18} />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Nodos Sombra Activos</h3>
                        </div>

                        <div className="space-y-3">
                            {twinData?.intelligence?.detectedMisconceptions?.map((m: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-amber-500 uppercase">{m.competencyId.split('-')[0]}</span>
                                        <div className="size-1.5 rounded-full bg-amber-500" />
                                    </div>
                                    <p className="text-[9px] text-zinc-400 font-medium leading-relaxed italic">
                                        Detectado en: {m.nodeTitle || "Concepto no especificado"}
                                    </p>
                                </div>
                            ))}
                            {twinData?.intelligence?.detectedMisconceptions?.length === 0 && (
                                <p className="text-[10px] text-zinc-600 italic">No se han detectado inconsistencias críticas.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-magenta-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-xl font-black uppercase italic leading-none">Certificado de Integridad</h4>
                            <p className="text-xs opacity-80 leading-relaxed">Este perfil ha sido validado bajo los protocolos de neutralidad conductual de TeacherOS.</p>
                            <button className="px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-[9px] font-black uppercase tracking-widest transition-all">
                                Protocolo Forense Descargado
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
                    <div className="size-12 rounded-full border-4 border-t-magenta-500 border-white/5 animate-spin" />
                    <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Extrayendo Gemelo Digital...</p>
                </div>
            )}
        </motion.div>
    );
}
