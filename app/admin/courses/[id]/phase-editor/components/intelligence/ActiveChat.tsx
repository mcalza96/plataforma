'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/useCopilotSession';

interface ActiveChatProps {
    session: CopilotSessionHelper;
}

/**
 * ActiveChat: Immersive conversational interface for the Copilot.
 * Clean, borderless design that fills its container.
 */
import { PedagogicalChat } from '@/components/admin/shared/PedagogicalChat';

interface ActiveChatProps {
    session: CopilotSessionHelper;
}

export function ActiveChat({ session }: ActiveChatProps) {
    const [localInput, setLocalInput] = useState('');
    const {
        messages,
        isLoading,
        error,
        append
    } = session;

    const handleSubmitLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput?.trim() || isLoading) return;

        const content = localInput;
        setLocalInput('');
        await append({ role: 'user', content });
    };

    return (
        <PedagogicalChat
            messages={messages}
            input={localInput}
            handleInputChange={(e) => setLocalInput(e.target.value)}
            handleSubmit={handleSubmitLocal}
            isLoading={isLoading}
            error={error}
            placeholder="Intervenir en la fase..."
            emptyStateTitle="Asistente de Diseño"
            emptyStateDescription="Mapea la topología de esta fase o solicita una secuencia de pasos atómicos."
        />
    );
}
