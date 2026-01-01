import { describe, it, expect, vi, beforeEach } from 'vitest';
import { continueInterview } from '@/lib/application/services/discovery/discovery-service';
import { generatePrototypesFromContext } from '@/lib/application/services/assessment/assessment-generator';

/**
 * 1. Mock Groq SDK
 * We use a regular function (not arrow) to allow 'new' instantiation
 */
const mockCompletionsCreate = vi.fn();

vi.mock('groq-sdk', () => {
    return {
        default: class {
            chat = {
                completions: {
                    create: mockCompletionsCreate
                }
            }
        }
    };
});

// 2. Mock Vercel AI SDK
vi.mock('ai', () => ({
    generateText: vi.fn()
}));

// 3. Mock Server Actions
vi.mock('@/lib/actions/assessment/discovery-actions', () => ({
    saveDiscoveryContext: vi.fn().mockResolvedValue({ success: true }),
    loadDraftExam: vi.fn().mockResolvedValue({ success: true, context: {} })
}));

describe('Architect & Assessment Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set env var for testing
        process.env.GROQ_API_KEY = 'test-key';
    });

    it('should complete a discovery turn and then generate prototypes', async () => {
        const { generateText } = await import('ai');

        // --- STEP 1: Discovery Turn ---
        // Mocking Groq response for discovery (first call returns tool_calls)
        mockCompletionsCreate.mockResolvedValueOnce({
            choices: [{
                message: {
                    role: 'assistant',
                    content: 'Entendido. ¿Para qué edad son los alumnos?',
                    tool_calls: [{
                        id: 'call_123',
                        type: 'function',
                        function: {
                            name: 'updateContext',
                            arguments: JSON.stringify({ subject: 'Matemáticas' })
                        }
                    }]
                },
                finish_reason: 'tool_calls'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 5 }
        });

        // Mocking Groq response for follow-up (second call returns text)
        mockCompletionsCreate.mockResolvedValueOnce({
            choices: [{
                message: {
                    content: 'Entendido. ¿Para qué edad son los alumnos?',
                    role: 'assistant'
                }
            }]
        });

        const messages = [{ role: 'user', content: 'Quiero enseñar matemáticas' }];
        const response = await continueInterview(messages, 'initial_profiling', {});
        const data = await response.json();

        expect(data.content).toBeDefined();
        expect(data.toolCalls).toHaveLength(1);
        expect(data.toolCalls[0].args.subject).toBe('Matemáticas');

        // --- STEP 2: Prototype Generation ---
        const mockContext = {
            subject: 'Matemáticas',
            targetAudience: 'Niños de 11 años',
            keyConcepts: ['Fracciones', 'Ecuaciones'],
            identifiedMisconceptions: [{ error: 'Confusión de signos', refutation: 'X es negativa' }]
        };

        // Mocking Vercel AI SDK generateText for Prototypes
        (generateText as any).mockResolvedValue({
            text: JSON.stringify({
                prototypes: [
                    {
                        id: 'p1',
                        stem: '¿Cuánto es 1/2 + 1/4?',
                        options: [
                            { content: '3/4', isCorrect: true, rationale: 'Suma correcta' },
                            { content: '2/6', isCorrect: false, rationale: 'Error común' }
                        ],
                        pedagogicalReasoning: 'Valida suma de fracciones básica'
                    }
                ]
            })
        });

        const prototypesResult = await generatePrototypesFromContext(mockContext);

        expect(prototypesResult.prototypes).toHaveLength(1);
        expect(prototypesResult.prototypes[0].stem).toContain('1/2 + 1/4');
    });
});
