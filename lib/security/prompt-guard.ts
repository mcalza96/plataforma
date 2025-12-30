/**
 * Utility to sanitize user input before sending it to an LLM.
 * Prevents basic prompt injection attacks and system instruction overrides.
 */

// Patterns that might indicate an attempt to override system instructions
const JAILBREAK_PATTERNS = [
    /ignore previous instructions/i,
    /ignore all previous instructions/i,
    /system override/i,
    /you are now/i,
    /debug mode/i,
    /developer mode/i,
    /unfiltered/i,
];

// Delimiters often used in system prompts
const SYSTEM_DELIMITERS = [
    '<<<', '>>>',
    '---',
    '```',
    '<system>', '</system>',
    '[INST]', '[/INST]'
];

export class PromptGuard {
    /**
     * Removes potentially dangerous delimiters and normalizes text.
     */
    static sanitizeInput(text: string): string {
        let sanitized = text;

        // Remove system delimiters to prevent context confusion
        SYSTEM_DELIMITERS.forEach(delimiter => {
            sanitized = sanitized.split(delimiter).join('');
        });

        // Normalize whitespace
        sanitized = sanitized.replace(/\s+/g, ' ').trim();

        return sanitized;
    }

    /**
     * Detects if the input contains patterns resembling a jailbreak attempt.
     * Returns true if a threat is detected.
     */
    static detectJailbreak(text: string): boolean {
        // 1. Check length abuse
        if (text.length > 5000) return true; // Unusually long inputs are suspicious

        // 2. Check known jailbreak patterns
        for (const pattern of JAILBREAK_PATTERNS) {
            if (pattern.test(text)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validates input: Sanitizes and checks for jailbreaks.
     * Throws error if jailbreak detected.
     */
    static validate(text: string): string {
        if (this.detectJailbreak(text)) {
            throw new Error("Entrada potencialmente maliciosa detectada.");
        }
        return this.sanitizeInput(text);
    }
}
