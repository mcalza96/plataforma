import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
    const variants = {
        default: 'bg-blue-600 text-white',
        secondary: 'bg-gray-100 text-gray-800',
        outline: 'border border-gray-200 text-gray-600',
        destructive: 'bg-red-600 text-white',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
