import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArchitectState } from '@/lib/domain/architect';

export const BlueprintHeader = ({ readiness }: { readiness: ArchitectState['readiness'] }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Zap className="text-blue-400 h-6 w-6" />
                Blueprint de Ingeniería
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
                <span>Readiness Index</span>
                <div className="h-1 w-32 bg-[#252525] rounded-full overflow-hidden">
                    <motion.div
                        className={cn(
                            "h-full transition-colors duration-500",
                            readiness.isValid ? "bg-emerald-500" : "bg-blue-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(readiness.conceptCount, 3) + (readiness.misconceptionCount > 0 ? 1 : 0) + (readiness.hasTargetAudience ? 1 : 0)) * 20}%` }}
                    />
                </div>
            </div>
        </div>
    </div>
);
