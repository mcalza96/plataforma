"use client";

import React, { useEffect, useState } from 'react';
import {
    Fingerprint,
    ShieldCheck,
    Globe,
    Smartphone,
    Laptop,
    AlertTriangle,
    RefreshCcw,
    Scale
} from 'lucide-react';
import {
    getFairnessAuditData,
    FairnessAuditData,
    getLatencyNormalizationStats,
    LatencyStats
} from '@/lib/actions/admin/admin-analytics-actions';
import ImpactRatioGauge from './ImpactRatioGauge';
import DIFQuarantineTable from './DIFQuarantineTable';
import IntegrityCertificate from './IntegrityCertificate';

export default function EquityControlTower() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FairnessAuditData | null>(null);
    const [latency, setLatency] = useState<LatencyStats[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [fairness, latencyStats] = await Promise.all([
                getFairnessAuditData(),
                getLatencyNormalizationStats()
            ]);
            setData(fairness);
            setLatency(latencyStats);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <Fingerprint className="w-12 h-12 text-blue-500 animate-pulse" />
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Ejecutando Auditoría Ética Binaria...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400">
            <h3 className="font-bold flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" /> Error en Auditoría
            </h3>
            <p className="text-sm">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Scale className="w-8 h-8 text-blue-500" />
                        Torre de Control de Equidad
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium">
                        Auditoría forense de sesgos algorítmicos. TeacherOS garantiza que la IA sea daltónica demográficamente y neutral ante el tipo de dispositivo.
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 transition-all"
                >
                    <RefreshCcw className="w-4 h-4" /> RE-AUDITAR SISTEMA
                </button>
            </div>

            {/* Top Grid: Impact & Certificate */}
            <div className="grid lg:grid-cols-3 gap-8">
                {data && (
                    <>
                        <ImpactRatioGauge ratio={data.impactRatio} status={data.equityStatus} />

                        <div className="lg:col-span-1">
                            <IntegrityCertificate status={data.equityStatus} />
                        </div>

                        {/* Device Neutrality Summary */}
                        <div className="bg-[#1A1A1A] p-8 rounded-3xl border border-white/5 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Neutralidad de Acceso
                            </h4>

                            <div className="space-y-4">
                                {latency.map((l) => (
                                    <div key={l.deviceType} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {l.deviceType === 'mobile' ? <Smartphone className="w-5 h-5 text-blue-400" /> : <Laptop className="w-5 h-5 text-slate-400" />}
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase">{l.deviceType}</p>
                                                <p className="text-[10px] text-slate-500">n = {l.sampleSize} sesiones</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 font-bold">RTE NORMALIZADO</p>
                                            <p className="text-sm font-mono text-emerald-400">{l.avgRTE.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <p className="text-[10px] text-blue-400 leading-relaxed italic">
                                    <strong>Nota forense:</strong> Los umbrales de impulsividad se ajustan dinámicamente según el RTE base de cada plataforma para evitar falsos positivos en usuarios táctiles.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Section: DIF Quarantine Table */}
            {data && <DIFQuarantineTable alerts={data.difAlerts} />}

            {/* Ethical Compliance Tags */}
            <div className="flex flex-wrap gap-4 pt-10 border-t border-white/5">
                {['Daltónico-Demográfico', 'Neutralidad-Táctil', 'Caja-Blanca', 'Privacy-Preserving'].map((tag) => (
                    <div key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tag}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
