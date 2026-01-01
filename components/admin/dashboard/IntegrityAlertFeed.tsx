'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, ShieldAlert, CheckCircle } from 'lucide-react';

interface IntegrityAlert {
    id: string;
    alert_type: 'CONCEPT_DRIFT' | 'HIGH_SLIP' | 'USELESS_DISTRACTOR' | 'FRAGILE_PREREQUISITE';
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    message: string;
    created_at: string;
    is_resolved: boolean;
}

export function IntegrityAlertFeed({ teacherId }: { teacherId: string }) {
    const [alerts, setAlerts] = useState<IntegrityAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, [teacherId]);

    const fetchAlerts = async () => {
        // Dynamic import to avoid build issues if client component constraint
        const { createClient } = await import('@/lib/infrastructure/supabase/supabase-client');
        const supabase = createClient();

        const { data, error } = await supabase
            .from('integrity_alerts')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('is_resolved', false)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setAlerts(data as unknown as IntegrityAlert[]);
        }
        setLoading(false);
    };

    const handleAction = async (alertId: string, action: 'RECALIBRATE' | 'IGNORE') => {
        const { createClient } = await import('@/lib/infrastructure/supabase/supabase-client');
        const supabase = createClient();

        // Mark as resolved for now
        // Ideally 'Recalibrate' triggers a specific workflow, but for dashboard feedback loop,
        // we archive it and optionally log the action. 
        // We set is_resolved=true.
        const { error } = await supabase
            .from('integrity_alerts')
            .update({ is_resolved: true }) // Simulating "Handled"
            .eq('id', alertId);

        if (!error) {
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        }
    };

    if (loading) return <div className="p-4 text-sm text-gray-500">Analizando integridad psicométrica...</div>;

    if (alerts.length === 0) return (
        <div className="p-6 border border-white/10 rounded-xl bg-green-500/5 text-green-400 flex items-center gap-3">
            <CheckCircle size={20} />
            <div>
                <h4 className="font-bold">Salud Psicométrica Óptima</h4>
                <p className="text-sm opacity-80">Todos los instrumentos están calibrados.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ShieldAlert className="text-amber-500" />
                Alertas de Integridad
            </h3>

            <div className="grid gap-3">
                {alerts.map(alert => (
                    <div
                        key={alert.id}
                        className={`
                            p-4 rounded-lg border flex gap-4 items-start
                            ${alert.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-[#1A1A1A] border-white/10'}
                        `}
                    >
                        <AlertIcon type={alert.alert_type} />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm text-gray-200">{formatAlertType(alert.alert_type)}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                                     ${alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400'}
                                `}>
                                    {alert.severity}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{alert.message}</p>

                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => handleAction(alert.id, 'RECALIBRATE')}
                                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-white"
                                >
                                    Recalibrar
                                </button>
                                <button
                                    onClick={() => handleAction(alert.id, 'IGNORE')}
                                    className="text-xs text-gray-500 hover:text-white px-3 py-1.5 transition-colors"
                                >
                                    Ignorar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AlertIcon({ type }: { type: string }) {
    switch (type) {
        case 'CONCEPT_DRIFT': return <TrendingUp size={18} className="text-purple-400 mt-1" />;
        case 'HIGH_SLIP': return <AlertTriangle size={18} className="text-amber-400 mt-1" />;
        default: return <ShieldAlert size={18} className="text-blue-400 mt-1" />;
    }
}

function formatAlertType(type: string) {
    switch (type) {
        case 'CONCEPT_DRIFT': return 'Deriva de Concepto Detectada';
        case 'HIGH_SLIP': return 'Ambigüedad en Pregunta (High Slip)';
        case 'USELESS_DISTRACTOR': return 'Distractores Ineficaces';
        case 'FRAGILE_PREREQUISITE': return 'Causalidad Inversa';
        default: return type;
    }
}
