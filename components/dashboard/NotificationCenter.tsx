'use client';

import { useState, useEffect } from 'react';
import { getLearnerFeedback, markFeedbackAsRead } from '@/lib/feedback-actions';
import Link from 'next/link';

export default function NotificationCenter({ learnerId }: { learnerId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read_by_learner).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getLearnerFeedback(learnerId);
            setNotifications(data);
        };
        fetchNotifications();
    }, [learnerId]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markFeedbackAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read_by_learner: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center relative hover:bg-white/10 transition-all active:scale-90 group"
            >
                <span className={`material-symbols-outlined text-gray-400 group-hover:text-amber-500 transition-colors ${unreadCount > 0 ? 'animate-swing' : ''}`}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1A1A1A] animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute top-14 right-0 w-80 bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[200] animate-in slide-in-from-top-4 duration-500 ring-1 ring-white/5">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] leading-none">Sala de Prensa Alpha</p>
                        {unreadCount > 0 && <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <span className="material-symbols-outlined text-4xl mb-4 text-white/5">drafts</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Cero mensajes nuevos</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-6 transition-all hover:bg-white/[0.03] cursor-pointer group relative ${!notif.is_read_by_learner ? 'bg-amber-500/[0.03]' : ''}`}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="size-5 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                    <span className="material-symbols-outlined text-[10px] text-amber-500">brush</span>
                                                </div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Instructor</span>
                                            </div>
                                            <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(notif.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className={`text-xs leading-relaxed font-medium line-clamp-3 transition-colors ${!notif.is_read_by_learner ? 'text-gray-200' : 'text-gray-500 italic'}`}>
                                            "{notif.content}"
                                        </p>
                                        {!notif.is_read_by_learner && (
                                            <div className="mt-4 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest">Nueva Crítica</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/parent-dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center py-5 bg-white/[0.02] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all border-t border-white/5"
                    >
                        Archivo de Talento
                    </Link>
                </div>
            )}
        </div>
    );
}
