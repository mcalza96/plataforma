import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export const useCelebration = () => {
    const triggerCelebration = useCallback(() => {
        const end = Date.now() + 1000;

        const colors = ['#3b82f6', '#8b5cf6', '#10b981']; // Brand colors: Blue, Purple, Emerald

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }, []);

    return { triggerCelebration };
};
