'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * A hook to handle navigation using the native View Transitions API.
 * This provides a smooth "fly" effect for elements with matching view-transition-names.
 */
export function useViewTransition() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const transitionPush = (href: string) => {
        // Fallback for browsers that don't support View Transitions
        if (!document.startViewTransition) {
            router.push(href);
            return;
        }

        document.startViewTransition(() => {
            return new Promise<void>((resolve) => {
                startTransition(() => {
                    router.push(href);
                    // We resolve after a short delay to allow the DOM to start updating
                    // In a real App Router scenario, this is slightly more complex as we don't 
                    // always know exactly when the new page is "ready", but for this UX demo it works.
                    resolve();
                });
            });
        });
    };

    return { transitionPush, isPending };
}
