/**
 * Normalizes messages from the UI (useChat) to the format expected by the AI SDK (CoreMessage).
 * Handles roles: user, assistant, system.
 * Extracts text from parts or content.
 */
export function normalizeMessages(messages: any[]): { role: 'user' | 'assistant' | 'system'; content: string }[] {
    return messages.map(m => {
        let content = '';

        if (typeof m.content === 'string') {
            content = m.content;
        } else if (m.parts && Array.isArray(m.parts)) {
            content = m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('\n');
        } else if (Array.isArray(m.content)) {
            content = m.content
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('\n');
        }

        return {
            role: (m.role === 'data' || m.role === 'tool') ? 'assistant' : m.role, // Fallback for unsupported roles in some contexts
            content: content
        };
    }).filter(m => ['user', 'assistant', 'system'].includes(m.role));
}
