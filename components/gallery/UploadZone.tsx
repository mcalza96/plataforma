'use client';

import { useState, useRef } from 'react';
import { uploadSubmission } from '@/lib/actions/shared/storage-actions';

interface UploadZoneProps {
    learnerId: string;
    courseId?: string;
    lessonId?: string;
}

export default function UploadZone({ learnerId, courseId, lessonId }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('video/')) {
            alert('Por favor selecciona un archivo de video (.mp4, .mov)');
            return;
        }

        setUploading(true);
        setStatus('idle');
        setProgress(10); // Artificial progress for UX

        const formData = new FormData();
        formData.append('file', file);
        formData.append('learnerId', learnerId);
        if (lessonId) formData.append('lessonId', lessonId);
        formData.append('title', file.name.split('.')[0]);
        formData.append('category', 'Procreate Time-lapse');

        try {
            setProgress(40);
            const result = await uploadSubmission(formData);
            if (result.success) {
                setProgress(100);
                setStatus('success');
                setTimeout(() => {
                    setStatus('idle');
                    setProgress(0);
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div
            className={`relative group rounded-3xl border-2 border-dashed p-10 transition-all duration-500 overflow-hidden ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                } ${status === 'success' ? 'border-green-500 bg-green-500/5' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/mp4,video/quicktime"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />

            {/* Glowing Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${status === 'success' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-neutral-800 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(13,147,242,0.4)]'
                    }`}>
                    <span className="material-symbols-outlined text-4xl text-white">
                        {uploading ? 'sync' : status === 'success' ? 'check' : 'cloud_upload'}
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                    {uploading ? 'Subiendo tu obra...' : status === 'success' ? '¡Obra Subida!' : '¡Muestra tu Arte!'}
                </h3>
                <p className="text-gray-400 max-w-xs mx-auto mb-6">
                    {uploading ? 'Estamos guardando tu creación en la galería...' : 'Arrastra tu video exportado de Procreate o haz clic para buscarlo.'}
                </p>

                {/* Progress Bar */}
                {(uploading || progress > 0) && (
                    <div className="w-full max-w-md h-2 bg-neutral-800 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(13,147,242,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}

                <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">movie</span> MP4 / MOV
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">timer</span> TIME-LAPSE
                    </span>
                </div>
            </div>

            {/* Scanning Line Animation if Uploading */}
            {uploading && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-primary/30 blur-sm animate-[scan_2s_infinite]"></div>
                </div>
            )}
        </div>
    );
}
