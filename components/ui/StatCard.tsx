import { ReactNode } from 'react';

interface StatCardProps {
    value: string | number;
    label: string;
    icon?: string;
    variant?: 'default' | 'primary' | 'amber' | 'violet';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export default function StatCard({
    value,
    label,
    icon,
    variant = 'default',
    trend,
    className = ''
}: StatCardProps) {
    const variants = {
        default: 'bg-white/[0.03] border-white/5 hover:bg-white/5 text-white',
        primary: 'bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary',
        amber: 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 text-amber-500',
        violet: 'bg-neon-violet/5 border-neon-violet/20 hover:bg-neon-violet/10 text-neon-violet',
    };

    const textColors = {
        default: 'text-white',
        primary: 'text-primary',
        amber: 'text-amber-500',
        violet: 'text-neon-violet',
    };

    return (
        <div className={`
            relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 group
            ${variants[variant]}
            ${className}
        `}>
            {/* Background Glow Effect */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40
                ${variant === 'default' ? 'bg-white' : ''}
                ${variant === 'primary' ? 'bg-primary' : ''}
                ${variant === 'amber' ? 'bg-amber-500' : ''}
                ${variant === 'violet' ? 'bg-neon-violet' : ''}
            `} />

            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className={`text-3xl sm:text-4xl font-black tracking-tight ${textColors[variant]}`}>
                            {value}
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60 mt-1">
                            {label}
                        </p>
                    </div>
                    {icon && (
                        <div className={`
                            p-3 rounded-2xl flex items-center justify-center
                            ${variant === 'default' ? 'bg-white/5' : 'bg-current/10'}
                        `}>
                            <span className="material-symbols-outlined text-2xl">{icon}</span>
                        </div>
                    )}
                </div>

                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
                        <span className={`material-symbols-outlined text-sm ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend.isPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        <span className={trend.isPositive ? 'text-emerald-500' : 'text-red-500'}>
                            {trend.value}% vs mes anterior
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
