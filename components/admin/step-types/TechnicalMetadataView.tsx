'use client';

import React from 'react';

interface TechnicalMetadataViewProps {
    linkedProbeId?: string;
    misconceptionIds?: string[];
}

/**
 * TechnicalMetadataView: Renders the backend connectivity for a diagnostic probe.
 */
export function TechnicalMetadataView({ linkedProbeId, misconceptionIds }: TechnicalMetadataViewProps) {
    if (!linkedProbeId) return null;

    return (
        <div className="mt-8 p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                    <span className="material-symbols-outlined text-sm">database</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Sonda Psicométrica Vinculada</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-1">
                <p className="text-[8px] text-gray-600 uppercase font-black">UUID del Servidor</p>
                <code className="text-[10px] text-emerald-400 font-mono block truncate bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    {linkedProbeId}
                </code>
            </div>

            {misconceptionIds && misconceptionIds.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[8px] text-gray-600 uppercase font-black">
                        Malentendidos Detectados ({misconceptionIds.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {misconceptionIds.map(id => (
                            <span key={id} className="text-[7px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 font-mono">
                                {id}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
