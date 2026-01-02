"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * QuickActionsCTA: Command Header for Teacher Dashboard
 * Provides immediate access to exam creation and assignment tools
 */
export default function QuickActionsCTA() {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
            {/* CTA 1: Create New Diagnostic */}
            <Link
                href="/teacher/exam-builder"
                className="group relative bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/40 transition-all min-h-[120px] flex flex-col justify-between"
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <span className="material-symbols-outlined text-2xl text-amber-500">auto_awesome</span>
                    </div>
                    <span className="material-symbols-outlined text-amber-500/40 group-hover:text-amber-500/60 transition-colors">arrow_forward</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">Crear Nuevo Diagnóstico</h3>
                    <p className="text-sm text-gray-400">Diseña un instrumento de evaluación con el Constructor IA</p>
                </div>
            </Link>

            {/* CTA 2: Manage Evaluations */}
            <Link
                href="/teacher/exams"
                className="group relative bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/40 transition-all min-h-[120px] flex flex-col justify-between"
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <span className="material-symbols-outlined text-2xl text-amber-500">assignment_add</span>
                    </div>
                    <span className="material-symbols-outlined text-amber-500/40 group-hover:text-amber-500/60 transition-colors">arrow_forward</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">Gestionar Evaluaciones</h3>
                    <p className="text-sm text-gray-400">Administra instrumentos de evaluación y asignaciones</p>
                </div>
            </Link>
        </motion.div>
    );
}
