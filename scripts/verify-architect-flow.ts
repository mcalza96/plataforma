#!/usr/bin/env tsx
/**
 * Architect Flow Verification Script
 * 
 * Validates that the TeacherOS Architect Agent correctly adapts its behavior
 * based on the FSM stage (initial_profiling, concept_extraction, shadow_work).
 * 
 * Usage: tsx scripts/verify-architect-flow.ts
 */

import { buildArchitectPrompt } from '../lib/ai/prompts';

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

interface TestCase {
    name: string;
    stage: string;
    message: string;
    expectedKeywords: string[];
    description: string;
}

const testCases: TestCase[] = [
    {
        name: 'Test Case A: Initial Profiling',
        stage: 'initial_profiling',
        message: 'Hola, quiero crear un curso',
        expectedKeywords: ['materia', 'audiencia', 'estudiantes', 'edad', 'enseñar'],
        description: 'Should focus ONLY on defining Subject and Target Audience'
    },
    {
        name: 'Test Case B: Concept Extraction',
        stage: 'concept_extraction',
        message: 'Es para enseñar Física a niños de 10 años',
        expectedKeywords: ['concepto', 'prerrequisito', 'antes', 'dominar', 'necesita saber'],
        description: 'Should use Recursive Decomposition technique'
    },
    {
        name: 'Test Case C: Shadow Work',
        stage: 'shadow_work',
        message: 'Los conceptos clave son gravedad, fuerza y aceleración',
        expectedKeywords: ['error', 'lógica', 'estudiante', 'cree', 'falsa', 'misconception'],
        description: 'Should use Critical Incident technique for misconceptions'
    },
    {
        name: 'Test Case D: Synthesis',
        stage: 'synthesis',
        message: 'Ya tenemos conceptos y misconceptions',
        expectedKeywords: ['validar', 'resumen', 'completo', 'generar', 'diagnóstico'],
        description: 'Should validate complete EKG before generation'
    }
];

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function validatePrompt(prompt: string, keywords: string[]): { passed: boolean; foundKeywords: string[] } {
    const foundKeywords = keywords.filter(keyword =>
        prompt.toLowerCase().includes(keyword.toLowerCase())
    );

    // Consider test passed if at least 40% of keywords are found
    const threshold = Math.ceil(keywords.length * 0.4);
    const passed = foundKeywords.length >= threshold;

    return { passed, foundKeywords };
}

async function runTests() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║   TeacherOS Architect Agent - FSM Verification Script    ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    let passedTests = 0;
    let failedTests = 0;

    for (const testCase of testCases) {
        log(`\n${'='.repeat(60)}`, 'blue');
        log(`${testCase.name}`, 'blue');
        log(`Stage: ${testCase.stage}`, 'yellow');
        log(`Description: ${testCase.description}`, 'yellow');
        log(`${'='.repeat(60)}\n`, 'blue');

        try {
            // Generate prompt for this stage
            const prompt = buildArchitectPrompt(testCase.stage);

            // Validate prompt contains expected keywords
            const { passed, foundKeywords } = validatePrompt(prompt, testCase.expectedKeywords);

            if (passed) {
                log(`✅ PASSED`, 'green');
                log(`   Found keywords: ${foundKeywords.join(', ')}`, 'green');
                passedTests++;
            } else {
                log(`❌ FAILED`, 'red');
                log(`   Expected keywords: ${testCase.expectedKeywords.join(', ')}`, 'red');
                log(`   Found keywords: ${foundKeywords.join(', ') || 'none'}`, 'red');
                failedTests++;
            }

            // Show prompt snippet for verification
            log(`\n📝 Prompt Snippet (first 300 chars):`, 'cyan');
            const snippet = prompt.substring(0, 300).replace(/\n/g, ' ');
            log(`   "${snippet}..."`, 'cyan');

        } catch (error: any) {
            log(`❌ ERROR: ${error.message}`, 'red');
            failedTests++;
        }
    }

    // Summary
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`SUMMARY`, 'blue');
    log(`${'='.repeat(60)}`, 'blue');
    log(`Total Tests: ${testCases.length}`, 'yellow');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%\n`, 'yellow');

    if (failedTests === 0) {
        log('🎉 All tests passed! FSM is working correctly.', 'green');
        process.exit(0);
    } else {
        log('⚠️  Some tests failed. Please review the implementation.', 'red');
        process.exit(1);
    }
}

// Additional validation: Check that prompts are different for each stage
function validatePromptDiversity() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║          Validating Prompt Diversity Across Stages        ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    const stages = ['initial_profiling', 'concept_extraction', 'shadow_work', 'synthesis'];
    const prompts = stages.map(stage => buildArchitectPrompt(stage));

    // Check that each prompt is unique
    const uniquePrompts = new Set(prompts);

    if (uniquePrompts.size === stages.length) {
        log('✅ All stage prompts are unique', 'green');
        return true;
    } else {
        log('❌ Some stage prompts are identical', 'red');
        return false;
    }
}

// Run tests
(async () => {
    try {
        const diversityPassed = validatePromptDiversity();
        if (!diversityPassed) {
            log('\n⚠️  Prompt diversity check failed. Skipping main tests.', 'red');
            process.exit(1);
        }

        await runTests();
    } catch (error: any) {
        log(`\n💥 Fatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
})();
