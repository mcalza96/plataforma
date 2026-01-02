import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Share2, Download, ChevronRight, User } from 'lucide-react';

interface ReportHeaderProps {
    studentName: string;
    attemptId: string;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const ReportHeader = ({ studentName, attemptId }: ReportHeaderProps) => (
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
                    ID: {attemptId.split('-')[0]}
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
);
