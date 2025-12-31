/**
 * Normalizes messages from the UI (useChat) to the format expected by the AI SDK (CoreMessage).
 * Handles roles: user, assistant, system.
 * Extracts text from parts or content.
 */
export function normalizeMessages(messages: any[]): any[] {
    return messages.map(m => {
        const base: any = { role: m.role };

        if (m.tool_calls) base.tool_calls = m.tool_calls;
        if (m.tool_call_id) base.tool_call_id = m.tool_call_id;

        if (typeof m.content === 'string') {
            base.content = m.content;
        } else if (m.parts && Array.isArray(m.parts)) {
            base.content = m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('\n');
        } else if (Array.isArray(m.content)) {
            base.content = m.content
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('\n');
        } else {
            base.content = m.content || '';
        }

        return base;
    });
}
