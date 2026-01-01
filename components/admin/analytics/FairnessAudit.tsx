'use client';

import { useState } from 'react';
import { Scale, Users, Smartphone, AlertOctagon } from 'lucide-react';

interface FairnessMetric {
    category: string;
    score: number; // 0-1, 1 is perfect equity
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    details: string;
}

export function FairnessAudit() {
    // Mock Data (In real app, fetch from CalibrationService or Views)
    const [metrics] = useState<FairnessMetric[]>([
        { category: 'DIF Global (Differential Functioning)', score: 0.92, status: 'OPTIMAL', details: 'No se detectó sesgo significativo en ítems clave.' },
        { category: 'Paridad de Etiquetado (Cognitive Labels)', score: 0.78, status: 'WARNING', details: 'El Grupo B tiene 15% más etiquetas de "Impulsividad".' },
        { category: 'Equidad de Dispositivo (Mobile vs Desktop)', score: 0.95, status: 'OPTIMAL', details: 'RTE normalizado correctamente.' }
    ]);

    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Scale className="text-blue-400" />
                Auditoría de Equidad Algorítmica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {metrics.map((m, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                {m.category}
                            </span>
                            <StatusBadge status={m.status} />
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                            {Math.round(m.score * 100)}%
                        </div>
                        <p className="text-xs text-gray-500">{m.details}</p>
                    </div>
                ))}
            </div>

            <div className="opacity-50 text-[10px] text-center text-gray-600 uppercase tracking-[0.2em] font-bold">
                Certificado de Integridad Generado Automáticamente por TeacherOS
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const format = () => {
        switch (status) {
            case 'OPTIMAL': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'WARNING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${format()}`}>
            {status}
        </span>
    );
}
