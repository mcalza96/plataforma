'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/infrastructure/supabase/supabase-client';
import { AlertTriangle, TrendingDown, HelpCircle } from 'lucide-react';

interface IntegrityAlert {
    id: string;
    alert_type: 'CONCEPT_DRIFT' | 'HIGH_SLIP' | 'USELESS_DISTRACTOR';
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    message: string;
    created_at: string;
}

export function IntegrityAlertFeed({ teacherId }: { teacherId?: string }) {
    const [alerts, setAlerts] = useState<IntegrityAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            const supabase = createClient();
            let query = supabase
                .from('integrity_alerts')
                .select('*')
                .eq('is_resolved', false)
                .order('created_at', { ascending: false })
                .limit(5);

            if (teacherId) {
                query = query.eq('teacher_id', teacherId);
            }

            const { data } = await query;
            setAlerts(data || []);
            setLoading(false);
        };

        fetchAlerts();
    }, [teacherId]);

    if (loading) return <div className="text-gray-500 text-xs text-center py-4">Cargando monitor de integridad...</div>;
    if (alerts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'HIGH_SLIP': return <AlertTriangle size={16} />;
            case 'USELESS_DISTRACTOR': return <TrendingDown size={16} />;
            default: return <HelpCircle size={16} />;
        }
    };

    const getColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Alertas de Integridad Pedagógica
            </h3>
            <div className="grid gap-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:bg-white/[0.02] ${getColor(alert.severity)}`}
                    >
                        <div className="mt-1 shrink-0">
                            {getIcon(alert.alert_type)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                                    {alert.alert_type.replace('_', ' ')}
                                </span>
                                {alert.severity === 'CRITICAL' && (
                                    <span className="text-[9px] bg-red-500 text-black px-1 rounded font-bold">URGENTE</span>
                                )}
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-90">
                                {alert.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
