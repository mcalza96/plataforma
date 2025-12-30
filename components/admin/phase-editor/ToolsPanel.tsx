'use client';

import { useState } from 'react';
import DiscoveryChat from '../copilot/DiscoveryChat';
import ResourceUploader from '../ResourceUploader';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/useCopilotSession';

interface ToolsPanelProps {
    copilotSession: CopilotSessionHelper;
    onApplyAI: (suggestions: { title: string }[]) => void;
    onUpdateDownload: (url: string) => void;
    downloadUrl: string | null;
    lessonId: string;
}

/**
 * ISP: ToolsPanel consolidates auxiliary workflows like AI generation and downloadable resources.
 */
export function ToolsPanel({ copilotSession, onApplyAI, onUpdateDownload, downloadUrl, lessonId }: ToolsPanelProps) {
    const [activeTool, setActiveTool] = useState<'ai' | 'resources'>('ai');

    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right duration-1000">
            {/* Tool Switcher */}
            <div className="flex bg-[#121212] border-b border-white/5 p-4 gap-2">
                <button
                    onClick={() => setActiveTool('ai')}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTool === 'ai' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined !text-[16px]">smart_toy</span>
                    Copilot
                </button>
                <button
                    onClick={() => setActiveTool('resources')}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTool === 'resources' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined !text-[16px]">attachment</span>
                    Recursos
                </button>
            </div>

            {/* Active Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {activeTool === 'ai' ? (
                    <div className="space-y-6 h-full">
                        <DiscoveryChat session={copilotSession} />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Archivo Descargable</h4>
                            <p className="text-[10px] text-gray-700 italic px-2">Sube pinceles, referencias o archivos de trabajo para esta fase.</p>
                            <ResourceUploader
                                folder="lesson-resources"
                                accept="*"
                                initialUrl={downloadUrl || ''}
                                label="Subir Recurso Maestro"
                                onUploadComplete={onUpdateDownload}
                            />
                        </div>

                        {downloadUrl && (
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">verified</span>
                                <span className="text-[10px] font-bold text-gray-400">Recurso vinculado exitosamente</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                <p className="text-[9px] text-gray-700 font-medium italic text-center leading-relaxed">
                    "Las herramientas potencian la enseñanza, el contenido maestro transforma al alumno."
                </p>
            </div>
        </div>
    );
}
