"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    MoreVertical,
    Eye,
    RefreshCcw,
    Trash2,
    Activity,
    Clock,
    Users
} from 'lucide-react';
import { GlobalItemHealth } from '@/lib/actions/admin/admin-analytics-actions';

interface ItemHealthMatrixProps {
    data: GlobalItemHealth[];
}

export default function ItemHealthMatrix({ data }: ItemHealthMatrixProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'BROKEN' | 'TRIVIAL' | 'USELESS'>('ALL');
    const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
    const [deprecatedItems, setDeprecatedItems] = useState<Set<string>>(new Set());

    const filteredData = data.filter(item => {
        const matchesSearch = item.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.question_id.toLowerCase().includes(searchTerm.toLowerCase());

        const isUseless = item.accuracy_rate > 95;

        if (filter === 'ALL') return matchesSearch;
        if (filter === 'BROKEN') return matchesSearch && item.health_status === 'BROKEN';
        if (filter === 'TRIVIAL') return matchesSearch && item.health_status === 'TRIVIAL';
        if (filter === 'USELESS') return matchesSearch && isUseless;

        return matchesSearch;
    });

    const toggleReview = (id: string) => {
        const next = new Set(reviewedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setReviewedItems(next);
    };

    const toggleDeprecate = (id: string) => {
        const next = new Set(deprecatedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setDeprecatedItems(next);
    };

    const getStatusStyles = (status: string, accuracy: number) => {
        if (accuracy > 95) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        switch (status) {
            case 'HEALTHY': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'BROKEN': return "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse";
            case 'TRIVIAL': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const getStatusIcon = (status: string, accuracy: number) => {
        if (accuracy > 95) return <AlertTriangle className="w-3 h-3 mr-1" />;
        switch (status) {
            case 'HEALTHY': return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'BROKEN': return <XCircle className="w-3 h-3 mr-1" />;
            case 'TRIVIAL': return <Activity className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#252525] p-4 rounded-xl border border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por examen o ID..."
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-[#1A1A1A] text-slate-400 hover:bg-white/5'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('BROKEN')}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === 'BROKEN' ? 'bg-rose-600/90 text-white' : 'bg-[#1A1A1A] text-slate-400 hover:bg-rose-500/10'}`}
                    >
                        Ítems Rotos
                    </button>
                    <button
                        onClick={() => setFilter('USELESS')}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === 'USELESS' ? 'bg-blue-600/90 text-white' : 'bg-[#1A1A1A] text-slate-400 hover:bg-blue-500/10'}`}
                    >
                        Distractores Inútiles
                    </button>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto bg-[#252525] rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">ID Ítem</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Examen</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Popularidad</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Precisión</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Latencia</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Estado</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence mode='popLayout'>
                            {filteredData.map((item, index) => (
                                <motion.tr
                                    key={item.question_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`group hover:bg-white/[0.02] transition-colors ${deprecatedItems.has(item.question_id) ? 'opacity-40 grayscale' : ''}`}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-mono text-slate-300">
                                                {item.question_id.substring(0, 8)}...
                                            </span>
                                            {item.accuracy_rate > 95 && (
                                                <span className="text-[9px] text-blue-400 mt-1 uppercase font-semibold">Distractor Crítico</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-slate-200 line-clamp-1">{item.exam_title}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center text-slate-400">
                                            <Users className="w-3 h-3 mr-2" />
                                            <span className="text-xs">{item.total_responses}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.accuracy_rate > 80 ? 'bg-emerald-500' : item.accuracy_rate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                    style={{ width: `${item.accuracy_rate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-300">{Math.round(item.accuracy_rate)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center text-slate-400">
                                            <Clock className="w-3 h-3 mr-2" />
                                            <span className="text-xs">{(item.median_time_ms / 1000).toFixed(1)}s</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyles(item.health_status, item.accuracy_rate)}`}>
                                            {getStatusIcon(item.health_status, item.accuracy_rate)}
                                            {item.accuracy_rate > 95 ? 'USELESS' : item.health_status}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleReview(item.question_id)}
                                                className={`p-2 rounded-lg border transition-all ${reviewedItems.has(item.question_id) ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                                title="Mandar a Revisión"
                                            >
                                                <RefreshCcw className={`w-4 h-4 ${reviewedItems.has(item.question_id) ? 'animate-spin-slow' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => toggleDeprecate(item.question_id)}
                                                className={`p-2 rounded-lg border transition-all ${deprecatedItems.has(item.question_id) ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                                title="Deprecar Ítem"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {filteredData.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">No se encontraron ítems con los filtros actuales</p>
                    </div>
                )}
            </div>

            <div className="text-[11px] text-slate-500 italic p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <strong>Nota Forense:</strong> Los ítems marcados como <strong>USELESS</strong> tienen una precisión {'>'} 95%, lo que sugiere que sus distractores no están capturando errores conceptuales y el ítem podría ser trivial o el grupo de alumnos está sobre-entrenado.
            </div>
        </div>
    );
}

// Tailward plugin for spin slow if not defined:
// animation: { 'spin-slow': 'spin 3s linear infinite' }
