'use client';

import { ToastType } from '@/context/ToastContext';

interface ToastComponentProps {
    toast: {
        id: string;
        message: string;
        type: ToastType;
    };
}

const icons: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
};

const colors: Record<ToastType, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-primary',
};

export default function ToastComponent({ toast }: ToastComponentProps) {
    return (
        <div className="pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 bg-[#1F1F1F]/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl shadow-2xl min-w-[300px]">
                <span className={`material-symbols-outlined ${colors[toast.type]}`}>
                    {icons[toast.type]}
                </span>
                <p className="text-white text-sm font-black uppercase tracking-wider">
                    {toast.message}
                </p>
            </div>
        </div>
    );
}
