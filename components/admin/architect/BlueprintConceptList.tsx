import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArchitectState } from '@/lib/domain/architect';

export const BlueprintConceptList = ({ context, readiness }: { context: ArchitectState['context'], readiness: ArchitectState['readiness'] }) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <Lightbulb className="h-4 w-4 text-blue-400" />
                Nodos de Conocimiento
            </div>
            <span className={cn(
                "text-xs px-2 py-1 rounded-md font-bold",
                readiness.conceptCount >= 3 ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
            )}>
                {readiness.conceptCount}/3
            </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode='popLayout'>
                {(context.keyConcepts || []).map((concept, idx) => (
                    <motion.div
                        key={typeof concept === 'string' ? concept : concept.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#252525] border border-[#333333] hover:border-blue-500/30 p-4 rounded-lg flex items-center gap-3 transition-colors group"
                    >
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-gray-100">{typeof concept === 'string' ? concept : concept.name}</span>
                        <ChevronRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </motion.div>
                ))}
            </AnimatePresence>
            {(!context.keyConcepts || context.keyConcepts.length === 0) && (
                <div className="border-2 border-dashed border-[#333333] rounded-lg p-8 text-center text-gray-500 italic">
                    No se han extraído conceptos clave todavía.
                </div>
            )}
        </div>
    </section>
);
