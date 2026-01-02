"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface ConceptDriftMonitorProps {
    data?: any[];
}

export default function ConceptDriftMonitor({ data }: ConceptDriftMonitorProps) {
    // Generate mock data if none provided
    const chartData = data || [
        { time: 'Sem 1', baseline: 78, current: 80 },
        { time: 'Sem 2', baseline: 78, current: 79 },
        { time: 'Sem 3', baseline: 78, current: 75 },
        { time: 'Sem 4', baseline: 78, current: 65 }, // Drift detected here
    ];

    return (
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 h-[300px]">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Monitor de Deriva de Concepto (Drift)
                </h4>
                <div className="flex gap-4 text-[9px] font-bold">
                    <div className="flex items-center gap-1 text-slate-500">
                        <div className="w-2 h-0.5 bg-slate-500" /> BASELINE
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                        <div className="w-2 h-0.5 bg-blue-400" /> COHORTE ACTUAL
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1A1A1A',
                            border: '1px solid #ffffff10',
                            borderRadius: '8px',
                            fontSize: '10px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="current"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCurrent)"
                    />
                    <Line
                        type="monotone"
                        dataKey="baseline"
                        stroke="#475569"
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
