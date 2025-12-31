import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-black transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95";

        const variants = {
            primary: "bg-amber-500 text-black hover:bg-amber-600 shadow-lg shadow-amber-500/10",
            outline: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
            ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
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
