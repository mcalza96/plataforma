"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FacultyHeaderProps {
    teacherName: string;
    cohortSize: number;
}

/**
 * FacultyHeader: Professional header for Faculty Intelligence Center
 * Shows teacher identity and cohort metrics
 */
export default function FacultyHeader({ teacherName, cohortSize }: FacultyHeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
        >
            <div className="bg-gradient-to-r from-[#252525] to-[#1A1A1A] border border-white/5 rounded-2xl p-8">
                {/* Title Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-emerald-500 text-2xl">school</span>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Centro de Inteligencia de Facultad
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Profesor: <span className="text-white font-bold">{teacherName}</span>
                        </p>
                    </div>

                    {/* Inference Engine Status */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Motor de Inferencia: Activo
                        </span>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cohort Size */}
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-amber-500 text-lg">groups</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Cohorte Activa
                            </span>
                        </div>
                        <p className="text-2xl font-black text-white font-mono">
                            {cohortSize} <span className="text-sm font-normal text-gray-400">estudiantes</span>
                        </p>
                    </div>

                    {/* KPIs Placeholder */}
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-blue-500 text-lg">analytics</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Salud Curricular
                            </span>
                        </div>
                        <p className="text-2xl font-black text-white font-mono">
                            --<span className="text-sm font-normal text-gray-400"> KPI</span>
                        </p>
                    </div>

                    {/* Synchronization Status */}
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-purple-500 text-lg">sync</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Última Sincronización
                            </span>
                        </div>
                        <p className="text-sm font-bold text-white">
                            {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
