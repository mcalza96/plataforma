import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-black transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
            outline: "border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20",
            ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        };

        const sizes = {
            sm: "h-9 px-4 text-[10px] uppercase tracking-widest",
            md: "h-11 px-6 text-xs uppercase tracking-widest",
            lg: "h-13 px-8 text-sm uppercase tracking-widest",
            icon: "size-9 p-0",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
