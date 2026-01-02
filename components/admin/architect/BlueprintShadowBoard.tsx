import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge as UIBadge } from '@/components/ui/badge';
import { ArchitectState } from '@/lib/domain/architect';

export const BlueprintShadowBoard = ({
    context,
    readiness,
    generatedProbeId
}: {
    context: ArchitectState['context'],
    readiness: ArchitectState['readiness'],
    generatedProbeId?: string
}) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-500 uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                Nodos Sombra (Shadow Work)
            </div>
            <span className={cn(
                "text-xs px-2 py-1 rounded-md font-bold",
                readiness.misconceptionCount >= 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
            )}>
                {readiness.misconceptionCount}/1 Requerido
            </span>
        </div>
        <div className="space-y-3">
            <AnimatePresence mode='popLayout'>
                {(context.identifiedMisconceptions || []).map((item, idx) => (
                    <motion.div
                        key={item.error}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-amber-500">
                                <TriangleAlert className="h-5 w-5" />
                                <span className="font-bold text-sm">MALENTENDIDO DETECTADO</span>
                            </div>
                            {generatedProbeId && (
                                <UIBadge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase tracking-widest px-2 py-0.5 font-black">
                                    Inyectado
                                </UIBadge>
                            )}
                        </div>
                        <p className="text-gray-200">{item.error}</p>
                        <div className="pl-4 border-l-2 border-emerald-500/30">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Estrategia de Refutación</p>
                            <p className="text-emerald-400 text-sm italic">{item.refutation}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {(!context.identifiedMisconceptions || context.identifiedMisconceptions.length === 0) && (
                <div className="bg-[#1A1A1A] border border-dashed border-amber-500/10 rounded-xl p-8 text-center">
                    <p className="text-gray-600 italic">La fase de Shadow Work aún no ha revelado confusiones cognitivas.</p>
                </div>
            )}
        </div>
    </section>
);
