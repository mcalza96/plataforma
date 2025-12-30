'use client';

import { useOptimistic, startTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { CheckCircle2, Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface InsightCardProps {
    title: string;
    description: string;
    actionLabel: string;
    onApply: () => Promise<void>;
}

export function InsightCard({ title, description, actionLabel, onApply }: InsightCardProps) {
    const [isPending, setIsPending] = useState(false);

    // State: 'idle' | 'applied' | 'error'
    const [status, setStatus] = useState<'idle' | 'applied' | 'error'>('idle');

    // Optimistic State
    const [optimisticStatus, addOptimisticStatus] = useOptimistic(
        status,
        (currentStatus, newStatus: 'idle' | 'applied' | 'error') => newStatus
    );

    const handleApply = async () => {
        setIsPending(true);
        startTransition(() => {
            addOptimisticStatus('applied');
        });

        try {
            await onApply();
            setStatus('applied');
        } catch (error) {
            setStatus('error');
            // Revert optimistic update automatically happens when state updates, but we set explicit error state
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-amber-400 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
                    <Lightbulb className="w-4 h-4" />
                    Insight Pedagógico
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold text-gray-900 mb-1">{title}</p>
                <div className="text-sm text-gray-600 mb-4 prose prose-sm max-w-none">
                    {/* We can integrate TypewriterText here if we want the insight to stream */}
                    {description}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleApply}
                        disabled={isPending || optimisticStatus === 'applied'}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                            ${optimisticStatus === 'applied'
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200 active:scale-95'
                            }
                        `}
                    >
                        <AnimatePresence mode="wait">
                            {optimisticStatus === 'applied' ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Aplicado</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="action"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <span>{actionLabel}</span>
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {optimisticStatus === 'error' && (
                    <p className="text-xs text-red-500 mt-2 text-right">
                        Error al aplicar. Reintentar.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
