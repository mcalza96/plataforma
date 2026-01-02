"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, Lock } from 'lucide-react';

interface IntegrityCertificateProps {
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    issueDate?: string;
}

export default function IntegrityCertificate({ status, issueDate = new Date().toLocaleDateString() }: IntegrityCertificateProps) {
    const isOptimal = status === 'OPTIMAL';

    return (
        <div className={`p-8 rounded-3xl border ${isOptimal ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 opacity-50'
            } flex flex-col items-center text-center space-y-6 relative overflow-hidden group`}>

            {isOptimal && (
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"
                />
            )}

            <div className={`p-4 rounded-full ${isOptimal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                <ShieldCheck className={`w-12 h-12 ${isOptimal ? 'animate-pulse' : ''}`} />
            </div>

            <div className="space-y-2">
                <h3 className={`text-xl font-black tracking-tight ${isOptimal ? 'text-white' : 'text-slate-500'}`}>
                    Certificado de Integridad Ética
                </h3>
                <p className="text-[11px] text-slate-400 font-medium max-w-[200px] leading-relaxed">
                    {isOptimal
                        ? 'TeacherOS valida que este curso cumple con los estándares internacionales de paridad algorítmica y neutralidad técnica.'
                        : 'El certificado está suspendido hasta que las brechas de equidad sean resueltas.'}
                </p>
            </div>

            <div className="w-full pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> FECHA DE EMISIÓN
                    </div>
                    <span className="text-slate-300">{issueDate}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" /> FORENSIC KEY
                    </div>
                    <span className="text-slate-300 font-mono">TOS-ETH-2026-X8B</span>
                </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isOptimal ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'
                }`}>
                {isOptimal ? 'Integridad Validada' : 'Certificación Pendiente'}
            </div>
        </div>
    );
}
