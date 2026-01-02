"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
 * TacticalStudentBridge: On-demand individual student audit container
 * Encapsulates all individual telemetry and cognitive identity data
 * Activated only when professor explicitly selects a student
 */
export default function TacticalStudentBridge({ student, onClose }: TacticalStudentBridgeProps) {
    const router = useRouter();

    const handleClose = () => {
        // Remove studentId query param to return to cohort view
        router.push('/teacher-dashboard');
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
        >
            {/* Forensic Audit Header */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Live Audit Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                                AUDITORÍA ACTIVA
                            </span>
                        </div>

                        {/* Student Identity */}
                        <div>
                            <h2 className="text-xl font-black text-white">
                                Sujeto: {student.display_name}
                            </h2>
                            <p className="text-sm text-gray-400 font-mono">
                                ID: {student.id} | Nivel: {student.level}
                            </p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                        <span className="text-sm font-bold text-white">Cerrar Auditoría</span>
                    </button>
                </div>
            </div>

            {/* Two-Column Layout: Mental Model + Raw Evidence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Mental Model */}
                <div className="space-y-6">
                    <div className="bg-[#252525] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">psychology</span>
                            Modelo Mental
                        </h3>
                        {/* Placeholder for CognitiveMirror */}
                        <div className="bg-[#1A1A1A] rounded-xl p-8 text-center">
                            <p className="text-gray-500 text-sm">
                                [CognitiveMirror Component]
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#252525] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">route</span>
                            Grafo de Tráfico
                        </h3>
                        {/* Placeholder for TrafficLightGraph */}
                        <div className="bg-[#1A1A1A] rounded-xl p-8 text-center">
                            <p className="text-gray-500 text-sm">
                                [TrafficLightGraph Component]
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Raw Evidence */}
                <div className="space-y-6">
                    <div className="bg-[#252525] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">analytics</span>
                            Telemetría Forense
                        </h3>
                        {/* Placeholder for ForensicLogTable */}
                        <div className="bg-[#1A1A1A] rounded-xl p-8 text-center">
                            <p className="text-gray-500 text-sm">
                                [ForensicLogTable: RTE, H_i, timestamps]
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
