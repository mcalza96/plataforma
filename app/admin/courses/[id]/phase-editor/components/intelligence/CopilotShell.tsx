import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/use-copilot-session';
import { ActiveChat } from './ActiveChat';
import { LiveContextView } from './LiveContextView';

interface CopilotShellProps {
    session: CopilotSessionHelper;
}

/**
 * CopilotShell: The intelligent sidebar container.
 * Features a dual-mode interface: Chat and Deep Insights.
 */
export function CopilotShell({ session }: CopilotShellProps) {
    const [view, setView] = useState<'chat' | 'insights'>('chat');

    return (
        <div className="w-full h-full flex flex-col bg-[#121212] overflow-hidden">
            {/* Mode Switcher - Segmented Control Style */}
            <div className="p-6 border-b border-white/5">
                <div className="bg-black/40 p-1.5 rounded-2xl flex relative">
                    {/* Sliding Highlight */}
                    <motion.div
                        className="absolute inset-y-1.5 rounded-xl bg-white/5 shadow-xl border border-white/5 pointer-events-none"
                        initial={false}
                        animate={{
                            x: view === 'chat' ? 0 : '100%',
                            width: 'calc(50% - 6px)'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />

                    <button
                        onClick={() => setView('chat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors relative z-10 ${view === 'chat' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                    >
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        Chat
                    </button>

                    <button
                        onClick={() => setView('insights')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors relative z-10 ${view === 'insights' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                    >
                        <span className="material-symbols-outlined text-sm">psychology</span>
                        Insights
                    </button>
                </div>
            </div>

            {/* Content Area with Transition */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {view === 'chat' ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <ActiveChat session={session} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <LiveContextView session={session} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* HUD State Footer */}
            <footer className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Sincronizado</span>
                </div>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">Deepmind Engine v4.2</span>
            </footer>
        </div>
    );
}
