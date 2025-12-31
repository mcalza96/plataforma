"use client";

import React from "react";
import { motion } from "framer-motion";

interface BuilderLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    header: React.ReactNode;
}

export function BuilderLayout({ children, sidebar, header }: BuilderLayoutProps) {
    return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0A] z-20">
                {header}
            </header>

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden">
                {/* Left: Chat (40%) */}
                <section className="w-[40%] border-r border-white/10 flex flex-col bg-[#0D0D0D]">
                    {sidebar}
                </section>

                {/* Right: Dashboard (60%) */}
                <section className="w-[60%] overflow-y-auto bg-[#0A0A0A] p-8 custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </section>
            </main>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}
