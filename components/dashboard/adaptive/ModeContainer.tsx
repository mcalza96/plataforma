import React from 'react';
import { UIMode, InterfaceAdaptationService } from '@/lib/application/services/interface-adapter';

interface ModeContainerProps {
    mode: UIMode;
    children: React.ReactNode;
}

export const ModeContainer: React.FC<ModeContainerProps> = ({ mode, children }) => {
    const config = InterfaceAdaptationService.getConfig(mode);

    // Base layout styles based on mode
    // Mission: Centered, Focused
    // Explorer & Dashboard: Grid with increasing density

    if (mode === 'MISSION') {
        return (
            <main className="flex-1 flex justify-center py-8 px-4 sm:px-10 lg:px-20 bg-[#121e26] min-h-screen">
                <div className={`flex flex-col w-full gap-8 ${config?.gridColumns || 'max-w-2xl'}`}>
                    {children}
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-[#121e26] min-h-screen">
            <div className={`grid gap-6 w-full max-w-[1600px] ${config?.gridColumns}`}>
                {children}
            </div>
        </main>
    );
};
