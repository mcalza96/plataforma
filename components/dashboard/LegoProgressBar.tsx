interface LegoProgressBarProps {
    completedSteps: number;
    totalSteps: number;
    variant?: 'primary' | 'secondary';
}

export default function LegoProgressBar({
    completedSteps,
    totalSteps,
    variant = 'primary'
}: LegoProgressBarProps) {
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-[#90b2cb] uppercase tracking-wider">
                <span>{completedSteps} de {totalSteps} Pasos</span>
                <span className="text-white">{percentage}%</span>
            </div>
            <div className="flex w-full gap-1.5 h-3">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={`lego-segment flex-1 rounded transition-all duration-300 ${i < completedSteps
                                ? variant === 'primary'
                                    ? 'bg-primary active shadow-[0_0_8px_rgba(13,147,242,0.4)]'
                                    : 'bg-secondary active-secondary shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                                : 'bg-[#31485a]'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
