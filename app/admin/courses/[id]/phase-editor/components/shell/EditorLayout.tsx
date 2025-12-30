'use client';

import React, { ReactNode } from 'react';

interface EditorLayoutProps {
    actions: ReactNode;
    intelligence: ReactNode;
    canvas: ReactNode;
}

/**
 * EditorLayout: Oorchestration layout for the Phase Editor.
 * Split into Intelligence Zone (left, 35%) and Working Canvas (right, 65%).
 */
export function EditorLayout({ actions, intelligence, canvas }: EditorLayoutProps) {
    return (
        <div className="h-screen w-full bg-[#0F0F0F] flex overflow-hidden text-white/90 font-sans selection:bg-indigo-500/30">
            {/* Sidebar: Intelligence Zone */}
            <aside className="w-[400px] lg:w-[35%] border-r border-white/5 bg-[#121212] flex flex-col h-full overflow-hidden shrink-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {intelligence}
                </div>
            </aside>

            {/* Main: Working Canvas */}
            <main className="flex-1 relative bg-[#0F0F0F] flex flex-col h-full overflow-hidden">
                {/* Floating/Integrated Actions Header */}
                <header className="absolute top-6 right-8 z-50 flex items-center gap-3">
                    {actions}
                </header>

                {/* Canvas Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {canvas}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
