'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
}

export function TypewriterText({
    text,
    speed = 0.01,
    className = "",
    onComplete
}: TypewriterTextProps) {
    const words = text.split(/(\s+)/); // Preserve all whitespace and newlines

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: speed },
        },
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 2,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ display: "inline" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
            onAnimationComplete={() => onComplete && onComplete()}
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child as any}
                    style={{ display: "inline" }}
                    key={index}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
