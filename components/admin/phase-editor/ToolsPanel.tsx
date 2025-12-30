'use client';

import ResourceUploader from '@/components/admin/ResourceUploader';
import CopilotSidebar from '@/components/admin/CopilotSidebar';

interface ToolsPanelProps {
    thumbnailUrl: string;
    downloadUrl: string;
    onUpdateField: (field: any, url: string) => void;
    onApplyAISuggestion: (count: number) => void;
}

export default function ToolsPanel({ thumbnailUrl, downloadUrl, onUpdateField, onApplyAISuggestion }: ToolsPanelProps) {
    return (
        <div className="space-y-8">
            {/* AI Assistant Section */}
            <div className="bg-[#1F1F1F] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform blur-3xl" />

                <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6 px-1">Copiloto Atómico</h3>
                    <CopilotSidebar
                        onApplyStructure={(steps) => onApplyAISuggestion(steps.length)}
                        isInline={true} // New prop for integrated layout
                    />
                </div>
            </div>

            {/* Assets Management */}
            <div className="bg-[#1F1F1F] border border-white/5 rounded-[3rem] p-8 shadow-2xl space-y-10">
                <ResourceUploader
                    label="Miniatura de Fase"
                    folder="lesson-thumbs"
                    accept="image/*"
                    initialUrl={thumbnailUrl}
                    onUploadComplete={(url) => onUpdateField('thumbnail_url', url)}
                />

                <div className="h-px bg-white/5" />

                <ResourceUploader
                    label="Caja de Herramientas (.brushset / .zip)"
                    folder="lesson-resources"
                    accept=".brushset,.pdf,.zip,.procreate"
                    initialUrl={downloadUrl}
                    onUploadComplete={(url) => onUpdateField('download_url', url)}
                />
            </div>
        </div>
    );
}
