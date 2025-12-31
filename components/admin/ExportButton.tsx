'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportExamResultsToCSV } from '@/lib/actions/export-actions';

interface ExportButtonProps {
    examId: string;
    variant?: 'primary' | 'outline' | 'ghost';
    className?: string;
}

export function ExportButton({ examId, variant = 'primary', className = "" }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const result = await exportExamResultsToCSV(examId);

            if (result.success && result.content) {
                // Create a blob and download it
                const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', result.filename || `reporte_vacio.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                alert("No se pudieron exportar los resultados.");
            }
        } catch (error) {
            console.error("Export error:", error);
            alert("Error crítico durante la exportación.");
        } finally {
            setIsLoading(false);
        }
    };

    const variants = {
        primary: "bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/10",
        outline: "border border-white/10 hover:bg-white/5 text-white",
        ghost: "hover:bg-white/5 text-zinc-400 hover:text-white"
    };

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${className}
            `}
        >
            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <Download size={14} />
            )}
            {isLoading ? "PROCESANDO..." : "Exportar Resultados"}
        </button>
    );
}
