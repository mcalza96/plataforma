'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalizedInterventions } from '@/lib/actions/assessment/intervention-actions';
import { Play, BookOpen, CheckCircle, ChevronRight, Lock, Sparkles, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NextStepsCardProps {
    attemptId: string;
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({ attemptId }) => {
    const [interventions, setInterventions] = useState<any[]>([]);
    const [masteredSkills, setMasteredSkills] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const load = async () => {
            const result = await getPersonalizedInterventions(attemptId);
            if (result.success) {
                setInterventions(result.interventions || []);
                // For "Glow", we extract mastered skills from the result cache (simulation here or we can fetch full diagnostic)
                // Assuming we can get the mastered ones from the same result
            }
            setIsLoading(false);
        };
        load();
    }, [attemptId]);

    if (isLoading) {
        return (
            <div className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5 animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-4" />
                <div className="h-20 w-full bg-white/5 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* GLOW Section - Acknowledge Mastery */}
            {interventions.length < 5 && (
                <section className="space-y-4">
                    <header className="flex items-center gap-2 px-2">
                        <Sparkles className="size-3.5 text-emerald-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">Glow: Fortalezas Consolidadas</h3>
                    </header>
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle className="size-24 text-emerald-500" />
                        </div>
                        <p className="text-sm text-emerald-200/80 leading-relaxed relative z-10">
                            Has demostrado un <span className="font-bold">dominio sólido</span> en los fundamentos base. Tu precisión en estos nodos es consistente con tu seguridad reportada.
                        </p>
                    </div>
                </section>
            )}

            {/* GROW Section - Prioritized Interventions */}
            <section className="space-y-4">
                <header className="flex items-center gap-2 px-2">
                    <Zap className="size-3.5 text-indigo-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/70">Grow: Ruta de Reparación Activa</h3>
                </header>

                <div className="grid gap-4">
                    <AnimatePresence>
                        {interventions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-8 border border-dashed border-zinc-800 rounded-3xl text-center"
                            >
                                <p className="text-xs text-zinc-600 uppercase font-black tracking-widest">Sin misiones pendientes</p>
                            </motion.div>
                        ) : (
                            interventions.map((item, idx) => (
                                <motion.div
                                    key={item.diagnosis.competencyId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative overflow-hidden p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 transition-all duration-300"
                                >
                                    {/* Priority Indicator */}
                                    {item.diagnosis.state === 'MISCONCEPTION' && (
                                        <div className="absolute top-0 left-0 h-full w-1.5 bg-rose-500" />
                                    )}

                                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={item.diagnosis.state === 'MISCONCEPTION'
                                                        ? "border-rose-500/30 text-rose-500 bg-rose-500/5"
                                                        : "border-amber-500/30 text-amber-500 bg-amber-500/5"}
                                                >
                                                    {item.diagnosis.state === 'MISCONCEPTION' ? 'DIAGNÓSTICO: REPARACIÓN' : 'DIAGNÓSTICO: NIVELACIÓN'}
                                                </Badge>
                                            </div>

                                            <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {item.diagnosis.competencyId}
                                            </h4>

                                            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 italic">
                                                "{item.diagnosis.evidence.reason}"
                                            </p>

                                            <div className="pt-4 flex flex-wrap gap-2">
                                                {item.content?.map((content: any) => (
                                                    <Button
                                                        key={content.id}
                                                        variant="outline"
                                                        className="bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-xl h-10 group/btn"
                                                    >
                                                        {content.type === 'video' ? <Play className="size-3 mr-2" /> : <BookOpen className="size-3 mr-2" />}
                                                        <span className="truncate max-w-[150px]">{content.title}</span>
                                                        <ChevronRight className="size-3 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
};
