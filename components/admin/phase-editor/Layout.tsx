'use client';

interface PhaseEditorLayoutProps {
    header: React.ReactNode;
    contextPanel: React.ReactNode;
    workbenchPanel: React.ReactNode;
    toolsPanel: React.ReactNode;
}

/**
 * OCP: Composable Layout for the Phase Workshop.
 * Uses CSS Grid to define the 3-column architecture with semantic slots.
 */
export function PhaseEditorLayout({
    header,
    contextPanel,
    workbenchPanel,
    toolsPanel
}: PhaseEditorLayoutProps) {
    return (
        <div className="h-screen bg-[#151515] text-white flex flex-col overflow-hidden font-sans">
            {/* Minimalist Fixed Header */}
            <header className="h-20 border-b border-white/5 flex items-center px-8 shrink-0 bg-[#151515]/80 backdrop-blur-md z-[100]">
                {header}
            </header>

            {/* Infinite Workbench Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Context & Vision (Video/Meta) */}
                <aside className="w-[400px] border-r border-white/5 overflow-y-auto custom-scrollbar p-8 bg-[#181818]/50">
                    {contextPanel}
                </aside>

                {/* Main Panel: Timeline (The Heart) */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[#151515]">
                    <div className="max-w-4xl mx-auto">
                        {workbenchPanel}
                    </div>
                </main>

                {/* Right Panel: Tools & AI */}
                <aside className="w-[380px] border-l border-white/5 overflow-y-auto custom-scrollbar bg-[#181818]/50">
                    {toolsPanel}
                </aside>
            </div>
        </div>
    );
}
