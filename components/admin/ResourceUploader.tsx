'use client';

import { useState, useRef } from 'react';
import { StorageService } from '@/lib/infrastructure/storage/storage-service';
import { useToast } from '@/context/ToastContext';

interface ResourceUploaderProps {
    onUploadComplete: (url: string) => void;
    label?: string;
    accept?: string;
    folder?: string;
    bucket?: string;
    initialUrl?: string;
}

export default function ResourceUploader({
    onUploadComplete,
    label = "Subir Recurso",
    accept = "image/*,.brushset,.pdf,.procreate",
    folder = "resources",
    bucket = "art-portfolio",
    initialUrl
}: ResourceUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(initialUrl);
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        setFileName(file.name);

        // Simulation for UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                return prev + (Math.random() * 15);
            });
        }, 200);

        try {
            const { publicUrl } = await StorageService.uploadFile(file, {
                bucket,
                folder
            });

            onUploadComplete(publicUrl);
            setPreviewUrl(publicUrl);
            setUploadProgress(100);

            setTimeout(() => {
                setUploadProgress(0);
            }, 1000);
        } catch (error: any) {
            console.error('Error uploading:', error);
            showToast('Error en el despliegue al almacenamiento: ' + error.message, 'error');
        } finally {
            setIsUploading(false);
            clearInterval(progressInterval);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const isImage = previewUrl?.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/i);
    const isBrush = previewUrl?.match(/\.brushset$/i);
    const isPDF = previewUrl?.match(/\.pdf$/i);
    const isProcreate = previewUrl?.match(/\.procreate$/i);

    return (
        <div className="space-y-4">
            {label && (
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{label}</p>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
            )}

            <div
                className={`group relative border-2 border-dashed rounded-3xl overflow-hidden min-h-[140px] flex items-center justify-center transition-all duration-500 cursor-pointer ${dragActive
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-white/10 bg-black/20 hover:border-white/20'
                    } ${isUploading ? 'pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleChange}
                    accept={accept}
                    disabled={isUploading}
                />

                {previewUrl && !isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isImage ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-700 blur-[2px] group-hover:blur-0"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-500 text-2xl">
                                        {isBrush ? 'brush' : isPDF ? 'picture_as_pdf' : isProcreate ? 'draw' : 'description'}
                                    </span>
                                </div>
                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Recurso Listo</p>
                            </div>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="material-symbols-outlined text-white text-3xl mb-2 translate-y-2 group-hover:translate-y-0 transition-transform">sync</span>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Reemplazar Archivo</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 p-8">
                        <div className={`size-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${isUploading ? 'bg-amber-500 text-black animate-spin' : 'bg-white/5 text-gray-400 group-hover:scale-110 group-hover:bg-white/10'
                            }`}>
                            <span className="material-symbols-outlined text-3xl font-black">
                                {isUploading ? 'sync' : 'cloud_upload'}
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-white text-xs font-black uppercase tracking-tight">
                                {isUploading ? `Sincronizando... ${Math.round(uploadProgress)}%` : 'Despliega tu recurso aquí'}
                            </p>
                            {!isUploading && (
                                <p className="text-gray-600 text-[9px] uppercase font-bold tracking-widest mt-1">
                                    O haz clic para navegar
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Real-time Progress Bar */}
                {isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                        <div
                            className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {previewUrl && !isUploading && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                        <p className="text-[9px] text-gray-500 truncate font-mono">{previewUrl}</p>
                    </div>
                    <button
                        onClick={() => {
                            setPreviewUrl('');
                            onUploadComplete('');
                        }}
                        className="text-[9px] font-black text-red-400/50 hover:text-red-400 uppercase tracking-widest transition-colors"
                    >
                        Remover
                    </button>
                </div>
            )}
        </div>
    );
}
