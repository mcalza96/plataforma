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
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: speed, delayChildren: 0.04 * i },
        }),
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
            y: 5,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            style={{ display: "inline-block", overflow: "hidden" }}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
            onAnimationComplete={() => onComplete && onComplete()}
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    style={{ display: "inline-block", marginRight: "0.25em" }}
                    key={index}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
