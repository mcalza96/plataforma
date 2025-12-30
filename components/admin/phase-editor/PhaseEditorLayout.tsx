'use client';

import { ReactNode } from 'react';

interface PhaseEditorLayoutProps {
    header: ReactNode;
    contextPanel: ReactNode;
    workbenchPanel: ReactNode;
    toolsPanel: ReactNode;
}

/**
 * PhaseEditorLayout: Orchestrates the 3-column tactical layout.
 * OCP: Accepts slots for each panel, allowing content changes without re-styling.
 */
export default function PhaseEditorLayout({
    header,
    contextPanel,
    workbenchPanel,
    toolsPanel
}: PhaseEditorLayoutProps) {
    return (
        <div className="space-y-12 pb-24 relative">
            {/* Command Header Slot */}
            {header}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(400px,500px)_400px] gap-8">
                {/* Left: Tactical Context */}
                <div className="space-y-8 h-fit">
                    {contextPanel}
                </div>

                {/* Center: Instruction Workbench */}
                <div className="space-y-8 h-fit lg:sticky lg:top-48">
                    {workbenchPanel}
                </div>

                {/* Right: Cognitive Tools */}
                <div className="space-y-8 h-fit lg:sticky lg:top-48">
                    {toolsPanel}
                </div>
            </div>
        </div>
    );
}
