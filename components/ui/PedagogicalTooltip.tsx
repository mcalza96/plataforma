'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PedagogicalTooltipProps {
    term: string;
    definition: string;
    children: React.ReactNode;
}

export function PedagogicalTooltip({ term, definition, children }: PedagogicalTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <span className="cursor-help border-b-2 border-dotted border-blue-300 decoration-blue-300 hover:bg-blue-50 transition-colors rounded px-0.5">
                        {children}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-800">
                    <p className="font-semibold text-xs text-blue-300 mb-1">{term}</p>
                    <p className="text-sm leading-snug">{definition}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
