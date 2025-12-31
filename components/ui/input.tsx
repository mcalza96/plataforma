import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={`bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all ${className}`}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";
