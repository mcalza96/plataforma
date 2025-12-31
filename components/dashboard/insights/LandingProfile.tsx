'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, Clock, BrainCircuit, Target, ShieldCheck } from 'lucide-react';
import { BehaviorProfile } from '../../../lib/domain/evaluation/types';

interface LandingProfileProps {
    profile: BehaviorProfile;
}

export const LandingProfile: React.FC<LandingProfileProps> = ({ profile }) => {
    // Determinar el arquetipo basado en el perfil
    let archetype = {
        name: 'Analista Equilibrado',
        tag: 'Consistente',
        icon: <ShieldCheck className="w-6 h-6" />,
        color: 'emerald',
        description: 'Muestra un ritmo constante y seguridad acorde a sus conocimientos.',
        strategy: 'Seguir con el plan de estudios estándar y aumentar complejidad progresivamente.'
    };

    if (profile.isImpulsive) {
        archetype = {
            name: 'Velocista Visual',
            tag: 'Impulsivo',
            icon: <Zap className="w-6 h-6" />,
            color: 'rose',
            description: 'Llega rápido a conclusiones pero puede cometer errores por omitir detalles críticos.',
            strategy: 'Usar "Time-boxing" inverso: forzar reflexión de 30s antes de permitir el envío de respuestas complejas.'
        };
    } else if (profile.isAnxious) {
        archetype = {
            name: 'Arquitecto Cauteloso',
            tag: 'Dubitativo',
            icon: <Clock className="w-6 h-6" />,
            color: 'amber',
            description: 'Analiza múltiples veces cada opción, lo que genera fatiga cognitiva temprana.',
            strategy: 'Refuerzo de confianza mediante micro-confirmaciones positivas y andamiaje visual simplificado.'
        };
    }

    const colorClasses = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 ring-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30 ring-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30 ring-amber-500/20'
    }[archetype.color as 'emerald' | 'rose' | 'amber'];

    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-2xl border ${colorClasses}`}>
                        {archetype.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-slate-100">{archetype.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorClasses}`}>
                                {archetype.tag}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 max-w-xs">{archetype.description}</p>
                    </div>
                </div>
                <BrainCircuit className="w-5 h-5 text-slate-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2 text-slate-300 font-semibold text-sm">
                        <Target className="w-4 h-4 text-indigo-400" />
                        Estrategia Sugerida
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {archetype.strategy}
                    </p>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2 text-slate-300 font-semibold text-sm">
                        <Rocket className="w-4 h-4 text-emerald-400" />
                        Recomendación de Contenido
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Priorizar formatos {profile.isImpulsive ? 'estáticos interactivos' : 'narrativos pausados'} para optimizar la carga cognitiva.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 tracking-wider uppercase bg-slate-950/30 p-2 rounded-lg">
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${archetype.color === 'rose' ? 'bg-rose-500' : 'bg-slate-700'}`} />
                    Impulsividad
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${archetype.color === 'amber' ? 'bg-amber-500' : 'bg-slate-700'}`} />
                    Ansiedad
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${profile.isConsistent ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    Consistencia
                </div>
            </div>
        </div>
    );
};
